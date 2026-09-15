// Regression checks for validation, persistence failures, and admin access.
// Uses mocked services; never writes to a real database or charges a card.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, dependencies = {}, globals = {}) {
  const compiledModule = { exports: {} };
  const source = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(source, { module: compiledModule, exports: compiledModule.exports, require: (name) => {
    if (!(name in dependencies)) throw new Error('Unexpected dependency: ' + name);
    return dependencies[name];
  }, Response, Request, URL, URLSearchParams, AbortSignal, console, ...globals }, { filename: file });
  return compiledModule.exports;
}

async function main() {
  const services = load('lib/services.ts');
  const locations = load('lib/locations.ts');
  const LA = 'America/Los_Angeles';
  assert.equal(locations.dateInTimeZone(LA, new Date('2026-09-14T02:00:00Z')), '2026-09-13');
  assert.equal(locations.dateInTimeZone(LA, new Date('2026-01-01T07:00:00Z')), '2025-12-31');
  assert.equal(locations.dateInTimeZone('America/New_York', new Date('2026-09-14T02:00:00Z')), '2026-09-13');
  assert.equal(locations.dateInTimeZone('America/New_York', new Date('2026-09-14T05:00:00Z')), '2026-09-14', 'New York reaches midnight before Los Angeles');
  assert.equal(locations.validPreferredDate('2026-02-30', LA, new Date('2026-01-01')), false);
  assert.equal(locations.validPreferredDate('2026-09-13', LA, new Date('2026-09-13T18:00Z')), false);
  assert.equal(locations.validPreferredDate('2026-09-14', LA, new Date('2026-09-13T18:00Z')), true);
  assert.equal(locations.validPreferredDate('2026-09-14', 'America/New_York', new Date('2026-09-14T05:00Z')), false, 'dates are checked in the studio time zone');

  const env = { DATABASE_URL: 'mock', FIREBASE_WEB_API_KEY: 'mock', ADMIN_EMAIL: 'owner@example.com' };
  let identity = { email: 'owner@example.com', emailVerified: true };
  let authStatus = 200;
  const admin = load('lib/require-admin.ts', {}, { process: { env }, fetch: async (_url, init) => {
    assert.equal(JSON.parse(init.body).idToken, 'test-token');
    return Response.json({ users: [identity] }, { status: authStatus });
  } });
  const records = new Map();
  let databaseFails = false;
  let reads = 0;
  const prisma = { booking: {
    upsert: async ({ where, create }) => {
      if (databaseFails) throw new Error('Database offline');
      if (!records.has(where.ref)) records.set(where.ref, create);
      return { ref: where.ref };
    },
    findMany: async () => { reads++; return [...records.values()]; },
    findUnique: async ({ where }) => records.get(where.ref) || null,
  } };
  const route = load('app/api/consultations/route.ts', { '@/lib/services': services, '@/lib/locations': locations, '@/lib/prisma': { prisma }, '@/lib/require-admin': admin }, { process: { env } });
  const body = { requestId: 'c9e95e70-0959-4a52-a8d4-b269a572207b', location: 'austin', service: 'removal', name: 'Test Client', email: 'client@example.com', phone: '', notes: 'Question about fading', date: '', time: "I'm flexible", consent: true };
  const request = (data = body, origin = 'http://localhost:3100') => new Request('http://localhost:3100/api/consultations', { method: 'POST', headers: { origin }, body: JSON.stringify(data) });
  assert.equal((await route.POST(request(null))).status, 400);
  assert.equal((await route.POST(request({ ...body, service: 'unknown' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, location: 'atlantis' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, location: undefined }))).status, 400);
  assert.equal((await route.POST(request({ ...body, consent: false }))).status, 400);
  assert.equal((await route.POST(request({ ...body, name: '  ' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, email: 'invalid' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, date: '2020-01-01' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, time: 'arbitrary' }))).status, 400);
  assert.equal((await route.POST(request({ ...body, notes: 'a'.repeat(7000) }))).status, 413);
  assert.equal((await route.POST(request(body, 'https://another-site.example'))).status, 403);
  assert.equal(records.size, 0);
  delete env.DATABASE_URL;
  assert.equal((await route.POST(request())).status, 503);
  env.DATABASE_URL = 'mock';
  databaseFails = true;
  assert.equal((await route.POST(request())).status, 503);
  databaseFails = false;
  assert.equal((await route.POST(request())).status, 201);
  assert.equal((await route.POST(request())).status, 201);
  assert.equal(records.size, 1, 'retry must not duplicate a request');
  const stored = [...records.values()][0];
  assert.equal(stored.depositPaid, 0);
  assert.equal(stored.status, 'pending');
  assert.equal(stored.tattooTitle, 'Tattoo removal');
  assert.equal(stored.location, 'austin');
  assert.ok(stored.time.endsWith('Central Time'), stored.time);
  assert.equal(JSON.parse(stored.notes).consent, true);

  const anonymous = new Request('http://localhost:3100/api/consultations');
  const authorized = new Request(anonymous.url, { headers: { Authorization: 'Bearer test-token' } });
  assert.equal((await route.GET(anonymous)).status, 401);
  assert.equal(reads, 0);
  identity.email = 'someone@example.com';
  assert.equal((await route.GET(authorized)).status, 403);
  identity.email = 'owner@example.com';
  identity.emailVerified = false;
  assert.equal((await route.GET(authorized)).status, 403);
  identity.emailVerified = true;
  identity.disabled = true;
  assert.equal((await route.GET(authorized)).status, 403);
  identity.disabled = false;
  authStatus = 400;
  assert.equal((await route.GET(authorized)).status, 401);
  authStatus = 200;
  assert.equal(reads, 0);
  const inbox = await route.GET(authorized);
  assert.equal(inbox.status, 200);
  assert.equal(inbox.headers.get('cache-control'), 'private, no-store');
  assert.equal(reads, 1);

  let payment = { payment_status: 'unpaid', status: 'complete' };
  const mockStripe = {
    stripeConfigured: () => Boolean(env.STRIPE_SECRET_KEY),
    getStripeInstance: () => ({
      checkout: {
        sessions: {
          retrieve: async () => payment,
        },
      },
    }),
  };
  const mockSettle = {
    settleCheckoutSession: async (session) => ({
      status: session.payment_status === 'paid' ? 'paid' : 'unpaid',
      amount: 50,
      currency: 'usd',
      channel: 'card',
      bookingRef: 'test-ref',
    }),
  };
  const verify = load(
    'app/api/stripe/verify/route.ts',
    {
      'next/server': { NextResponse: Response },
      '@/lib/stripe': mockStripe,
      '@/lib/stripe-settle': mockSettle,
      '@/lib/prisma': { prisma },
      '@/lib/offers': load('lib/offers.ts', { '@/lib/services': services }),
    },
    { process: { env } }
  );
  const checkoutRequest = new Request('http://localhost:3100/api/stripe/verify?session_id=test');
  assert.equal((await verify.GET(checkoutRequest)).status, 503);
  env.STRIPE_SECRET_KEY = 'mock';
  assert.equal((await (await verify.GET(checkoutRequest)).json()).paid, false);
  payment = { payment_status: 'paid', status: 'complete' };
  assert.equal((await (await verify.GET(checkoutRequest)).json()).paid, true);
  console.log('Passed: studio time-zone dates, locations, request validation, failed saves, retry deduplication, zero-payment requests, admin authorization, and payment verification.');
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
