// Payment checks: deposit pricing and the seasonal offer at checkout, settlement of paid, unpaid,
// and mismatched sessions, and signed webhooks for success, failure, expiry, and outages.
// Uses mocked services and a fake webhook secret; never calls Stripe or writes to a real database.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import Stripe from 'stripe';

function load(file, dependencies = {}, globals = {}) {
  const compiledModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module: compiledModule, exports: compiledModule.exports, require: (name) => {
    if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
    return dependencies[name];
  }, Response, Request, URL, URLSearchParams, AbortSignal, console, ...globals }, { filename: file });
  return compiledModule.exports;
}

const quiet = { ...console, log() {}, error() {} };

async function main() {
  const env = { DATABASE_URL: 'mock', STRIPE_SECRET_KEY: 'sk_test_mock', STRIPE_WEBHOOK_SECRET: 'whsec_mock' };
  const services = load('lib/services.ts');
  const locations = load('lib/locations.ts');
  const amounts = load('lib/stripe-amounts.ts', {}, { process: { env } });
  const offers = load('lib/offers.ts', { '@/lib/services': services });

  // Offer rules.
  assert.equal(offers.offerOpenOn('2026-11-30'), true);
  assert.equal(offers.offerOpenOn('2026-12-01'), false);
  assert.equal(offers.offerPrice(350), 280);
  assert.equal(offers.offerPrice(150), 120);
  assert.equal(offers.offerAppliesTo('cover-up', '2026-10-01'), true);
  assert.equal(offers.offerAppliesTo('removal', '2026-10-01'), true, 'removal is now a deposit booking that receives the offer');
  const LA = 'America/Los_Angeles';
  assert.equal(locations.dateInTimeZone(LA, new Date(offers.OFFER_ENDS_AT - 1)), '2026-11-30', 'banner runs to the end of Nov 30 in LA');
  assert.equal(locations.dateInTimeZone(LA, new Date(offers.OFFER_ENDS_AT)), '2026-12-01');
  assert.equal(offers.bookingOffer('{"offer":{"percentOff":20,"originalEstimate":350}}').originalEstimate, 350);
  assert.equal(offers.bookingOffer('not json'), null);
  assert.equal(offers.bookingOffer(null), null);

  // In-memory bookings table.
  const records = new Map();
  let databaseDown = false;
  const matches = (record, where) =>
    Object.entries(where).every(([key, value]) => (value && typeof value === 'object' ? value.in.includes(record[key]) : record[key] === value));
  const prisma = { booking: {
    findUnique: async ({ where }) => {
      if (databaseDown) throw new Error('Database offline');
      return records.get(where.ref) ?? null;
    },
    create: async ({ data }) => {
      if (records.has(data.ref)) throw Object.assign(new Error('Duplicate'), { code: 'P2002' });
      records.set(data.ref, { ...data });
      return data;
    },
    update: async ({ where, data }) => records.set(where.ref, { ...records.get(where.ref), ...data }),
    updateMany: async ({ where, data }) => {
      let count = 0;
      for (const [ref, record] of records) if (matches(record, where)) { records.set(ref, { ...record, ...data }); count++; }
      return { count };
    },
  } };

  // Checkout: the server prices the deposit and decides the offer.
  let studioToday = '2026-11-30';
  let stripeDown = false;
  const sessions = [];
  let viewer = { email: 'client@example.com', isAdmin: false };
  const checkout = load('app/api/stripe/checkout/route.ts', {
    '@/lib/prisma': { prisma },
    '@/lib/require-admin': { verifyUser: async () => viewer },
    '@/lib/services': services,
    '@/lib/locations': { ...locations, dateInTimeZone: () => studioToday },
    '@/lib/offers': offers,
    '@/lib/stripe': {
      stripeKeyProblem: () => null,
      stripeCurrency: () => 'usd',
      toStripeAmount: (amount, currency) => amounts.toMinorUnits(amount, currency),
      getStripeInstance: () => ({ checkout: { sessions: { create: async (args) => {
        if (stripeDown) throw new Error('Stripe unavailable');
        const session = { ...args, id: 'cs_test_' + (sessions.length + 1), url: 'https://checkout.stripe.com/c/pay/test' };
        sessions.push(session);
        return session;
      } } } }),
    },
  }, { process: { env }, console: quiet });

  const startCheckout = async (overrides = {}) => {
    const body = { requestId: crypto.randomUUID(), location: 'austin', service: 'tattoo', size: 'medium', placement: 'Forearm', date: '', time: "I'm flexible", name: 'Test Client', phone: '', notes: '', design: '', consent: true, policyAccepted: true, ...overrides };
    const response = await checkout.POST(new Request('http://localhost:3100/api/stripe/checkout', { method: 'POST', headers: { origin: 'http://localhost:3100' }, body: JSON.stringify(body) }));
    return { response, session: response.status === 201 ? sessions.at(-1) : null };
  };

  const offerDay = await startCheckout({ amount: 1, deposit: 1 });
  assert.equal(offerDay.response.status, 201);
  const offerSession = offerDay.session;
  assert.equal(offerSession.line_items[0].price_data.unit_amount, 10000, 'the full deposit is charged; browser amounts are ignored');
  assert.equal(offerSession.metadata.depositAmount, '100');
  assert.equal(offerSession.metadata.estimatedTotal, '280');
  assert.equal(offerSession.metadata.offerPercentOff, '20');
  assert.equal(offerSession.metadata.originalEstimate, '350');
  const pending = records.get(offerSession.client_reference_id);
  assert.equal(pending.status, 'awaiting_payment', 'no booking exists before payment');
  assert.equal(pending.estimatedTotal, 280);
  assert.equal(JSON.parse(pending.notes).offer.percentOff, 20);
  const cancelUrl = new URL(offerSession.cancel_url);
  assert.equal(cancelUrl.searchParams.get('cancelled'), 'true');
  assert.equal(cancelUrl.searchParams.get('placement'), 'Forearm');
  assert.equal(cancelUrl.searchParams.get('size'), 'medium');
  assert.equal(cancelUrl.searchParams.get('time'), "I'm flexible");

  const small = await startCheckout({ size: 'small', service: 'touch-up' });
  assert.equal(small.session.line_items[0].price_data.unit_amount, 5000);
  assert.equal(small.session.metadata.estimatedTotal, '120');

  const couple = await startCheckout({ size: 'couple-mini', service: 'couples' });
  assert.equal(couple.session.line_items[0].price_data.unit_amount, 7000, 'couples mini deposit is 70');
  assert.equal(couple.session.metadata.depositAmount, '70');
  assert.equal(couple.session.metadata.estimatedTotal, '176', '20% off 220 is 176');

  studioToday = '2026-12-01';
  const afterOffer = await startCheckout();
  assert.equal(afterOffer.session.metadata.estimatedTotal, '350', 'no offer after Nov 30');
  assert.equal(afterOffer.session.metadata.offerId, undefined);
  assert.equal(JSON.parse(records.get(afterOffer.session.client_reference_id).notes).offer, undefined);
  studioToday = '2026-11-30';

  const sessionCount = sessions.length;
  assert.equal((await startCheckout({ service: 'unknown' })).response.status, 400);
  assert.equal((await startCheckout({ policyAccepted: false })).response.status, 400);
  assert.equal((await startCheckout({ size: 'huge' })).response.status, 400);
  assert.equal(sessions.length, sessionCount, 'invalid requests never reach Stripe');

  const removalBooking = await startCheckout({ service: 'removal' });
  assert.equal(removalBooking.response.status, 201, 'removal can now be booked with a deposit');

  stripeDown = true;
  const outage = await startCheckout();
  assert.equal(outage.response.status, 502);
  assert.match((await outage.response.json()).error, /No payment has been taken/);
  stripeDown = false;

  // Settlement: only a paid session for exactly the priced deposit becomes a booking.
  const settle = load('lib/stripe-settle.ts', { '@/lib/prisma': { prisma }, '@/lib/stripe-amounts': amounts, '@/lib/services': services }, { process: { env }, console: quiet });
  const stripeSession = (created, overrides = {}) => ({
    id: created.id,
    client_reference_id: created.client_reference_id,
    metadata: created.metadata,
    currency: 'usd',
    amount_total: created.line_items[0].price_data.unit_amount,
    payment_status: 'paid',
    payment_intent: 'pi_test',
    customer_details: { email: 'client@example.com' },
    ...overrides,
  });
  const ref = offerSession.client_reference_id;

  // Live-mode smoke test deposit: admin only, and it settles like any other deposit.
  env.LIVE_TEST_DEPOSIT = '0.50';
  const customerDuringTest = await startCheckout();
  assert.equal(customerDuringTest.session.line_items[0].price_data.unit_amount, 10000, 'customers never get the test deposit');
  assert.equal(customerDuringTest.session.metadata.liveTest, undefined);
  viewer = { email: 'owner@example.com', isAdmin: true };
  const smokeTest = (await startCheckout()).session;
  assert.equal(smokeTest.line_items[0].price_data.unit_amount, 50);
  assert.equal(smokeTest.metadata.depositAmount, '0.5');
  assert.match(smokeTest.line_items[0].price_data.product_data.name, /^\[LIVE TEST\]/);
  assert.equal((await settle.settleCheckoutSession(stripeSession(smokeTest, { amount_total: 49 }))).status, 'failed');
  assert.equal((await settle.settleCheckoutSession(stripeSession(smokeTest))).status, 'paid');
  assert.equal(records.get(smokeTest.client_reference_id).depositPaid, 0.5);
  env.LIVE_TEST_DEPOSIT = 'abc';
  assert.equal((await startCheckout()).session.line_items[0].price_data.unit_amount, 10000, 'an invalid test deposit is ignored');
  delete env.LIVE_TEST_DEPOSIT;
  assert.equal((await startCheckout()).session.line_items[0].price_data.unit_amount, 10000);
  viewer = { email: 'client@example.com', isAdmin: false };

  assert.equal((await settle.settleCheckoutSession(stripeSession(offerSession, { payment_status: 'unpaid' }))).status, 'unpaid');
  assert.equal(records.get(ref).status, 'awaiting_payment');
  assert.equal((await settle.settleCheckoutSession(stripeSession(offerSession, { amount_total: 100 }))).status, 'failed');
  assert.equal(records.get(ref).status, 'awaiting_payment', 'an underpaid session is not confirmed');

  const paid = await settle.settleCheckoutSession(stripeSession(offerSession));
  assert.equal(paid.status, 'paid');
  assert.equal(paid.amount, 100);
  let confirmed = records.get(ref);
  assert.equal(confirmed.status, 'deposit_held');
  assert.equal(confirmed.depositPaid, 100);
  assert.equal(confirmed.estimatedTotal, 280, 'the offer price survives payment');
  assert.equal(JSON.parse(confirmed.notes).paymentStatus, 'paid');
  assert.equal(JSON.parse(confirmed.notes).offer.originalEstimate, 350);

  records.set(ref, { ...confirmed, status: 'confirmed' });
  assert.equal((await settle.settleCheckoutSession(stripeSession(offerSession))).status, 'paid');
  assert.equal(records.get(ref).status, 'confirmed', 'a repeat delivery never downgrades a studio-confirmed booking');
  await settle.markCheckoutUnpaid(stripeSession(offerSession), 'payment_failed');
  assert.equal(records.get(ref).status, 'confirmed', 'a late failure never cancels a paid booking');

  records.delete(small.session.client_reference_id);
  assert.equal((await settle.settleCheckoutSession(stripeSession(small.session))).status, 'paid');
  const recovered = records.get(small.session.client_reference_id);
  assert.equal(recovered.status, 'deposit_held', 'a paid session whose record was lost is recreated');
  assert.equal(JSON.parse(recovered.notes).offer.percentOff, 20);

  // Verify (return from Stripe): reports the offer without exposing booking notes.
  const verify = load('app/api/stripe/verify/route.ts', {
    'next/server': { NextResponse: Response },
    '@/lib/stripe': { stripeConfigured: () => true, getStripeInstance: () => ({ checkout: { sessions: { retrieve: async () => stripeSession(offerSession) } } }) },
    '@/lib/stripe-settle': settle,
    '@/lib/prisma': { prisma },
    '@/lib/offers': offers,
  }, { process: { env }, console: quiet });
  const verified = await (await verify.GET(new Request('http://localhost:3100/api/stripe/verify?session_id=' + offerSession.id))).json();
  assert.equal(verified.paid, true);
  assert.equal(verified.offer.percentOff, 20);
  assert.equal(verified.booking.estimatedTotal, 280);
  assert.equal('notes' in verified.booking, false, 'phone and message stay private');

  // Webhooks, signed and checked with the real Stripe library.
  const webhook = load('app/api/stripe/webhook/route.ts', {
    'next/server': { NextResponse: Response, NextRequest: Request },
    '@/lib/stripe': { stripeConfigured: () => true, getStripeInstance: () => new Stripe('sk_test_mock') },
    '@/lib/stripe-settle': settle,
  }, { process: { env }, console: quiet });
  const sign = (payload, secret) => {
    const timestamp = Math.floor(Date.now() / 1000);
    return `t=${timestamp},v1=${crypto.createHmac('sha256', secret).update(`${timestamp}.${payload}`).digest('hex')}`;
  };
  const deliver = (type, object, secret = env.STRIPE_WEBHOOK_SECRET) => {
    const payload = JSON.stringify({ id: 'evt_test', object: 'event', type, data: { object } });
    const headers = secret ? { 'stripe-signature': sign(payload, secret) } : {};
    return webhook.POST(new Request('http://localhost:3100/api/stripe/webhook', { method: 'POST', headers, body: payload }));
  };

  const cardPayment = (await startCheckout()).session;
  assert.equal((await deliver('checkout.session.completed', stripeSession(cardPayment), null)).status, 400, 'unsigned events are rejected');
  assert.equal((await deliver('checkout.session.completed', stripeSession(cardPayment), 'whsec_attacker')).status, 400, 'forged events are rejected');
  assert.equal(records.get(cardPayment.client_reference_id).status, 'awaiting_payment');
  assert.equal((await deliver('checkout.session.completed', stripeSession(cardPayment))).status, 200);
  assert.equal(records.get(cardPayment.client_reference_id).status, 'deposit_held', 'successful card payment confirms the booking');

  const bankPayment = (await startCheckout()).session;
  assert.equal((await deliver('checkout.session.completed', stripeSession(bankPayment, { payment_status: 'unpaid' }))).status, 200);
  assert.equal(records.get(bankPayment.client_reference_id).status, 'awaiting_payment', 'a delayed payment waits for the money');
  assert.equal((await deliver('checkout.session.async_payment_failed', stripeSession(bankPayment, { payment_status: 'unpaid' }))).status, 200);
  assert.equal(records.get(bankPayment.client_reference_id).status, 'payment_failed', 'failed payment is recorded and never shown as a booking');

  const delayedSuccess = (await startCheckout()).session;
  await deliver('checkout.session.completed', stripeSession(delayedSuccess, { payment_status: 'unpaid' }));
  assert.equal((await deliver('checkout.session.async_payment_succeeded', stripeSession(delayedSuccess))).status, 200);
  assert.equal(records.get(delayedSuccess.client_reference_id).status, 'deposit_held');

  const abandoned = (await startCheckout()).session;
  assert.equal((await deliver('checkout.session.expired', stripeSession(abandoned, { payment_status: 'unpaid', amount_total: 10000 }))).status, 200);
  assert.equal(records.get(abandoned.client_reference_id).status, 'payment_expired');

  assert.equal((await deliver('customer.created', { id: 'cus_test' })).status, 200);

  const duringOutage = (await startCheckout()).session;
  databaseDown = true;
  assert.equal((await deliver('checkout.session.completed', stripeSession(duringOutage))).status, 500, 'database errors make Stripe retry');
  databaseDown = false;
  assert.equal((await deliver('checkout.session.completed', stripeSession(duringOutage))).status, 200);
  assert.equal(records.get(duringOutage.client_reference_id).status, 'deposit_held', 'the retry confirms the booking');

  delete env.STRIPE_WEBHOOK_SECRET;
  assert.equal((await deliver('checkout.session.completed', stripeSession(cardPayment), 'whsec_mock')).status, 503);
  env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';

  console.log('Passed: offer pricing and deadline, server-priced deposits, checkout outages, paid/unpaid/underpaid settlement, idempotent webhooks, signature checks, failed and expired payments, and retries after database errors.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
