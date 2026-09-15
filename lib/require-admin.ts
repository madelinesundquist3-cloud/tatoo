export interface VerifiedUser {
  email: string;
  isAdmin: boolean;
}

function configuredAdminEmail() {
  return (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL)?.trim().toLowerCase();
}

// Verify the Firebase ID token through the project's account lookup endpoint.
// Never use the localStorage profile or a client-supplied email as authorization.
export async function verifyUser(request: Request): Promise<VerifiedUser | Response> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 10000) {
    return Response.json({ error: "Sign in with your Google account." }, { status: 401 });
  }
  const key = process.env.FIREBASE_WEB_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!key) return Response.json({ error: "Sign-in verification is not configured." }, { status: 503 });
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: authorization.slice(7) }), cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return Response.json({ error: "Your session could not be verified. Please sign in again." }, { status: 401 });
    const result = await response.json();
    const user = result.users?.[0];
    if (!user || user.disabled || user.emailVerified !== true || typeof user.email !== "string") {
      return Response.json({ error: "This account could not be verified." }, { status: 403 });
    }
    const email = user.email.toLowerCase();
    const adminEmail = configuredAdminEmail();
    return { email, isAdmin: Boolean(adminEmail) && email === adminEmail };
  } catch {
    return Response.json({ error: "Sign-in verification is temporarily unavailable." }, { status: 503 });
  }
}

export async function requireAdmin(request: Request): Promise<Response | null> {
  if (!configuredAdminEmail()) return Response.json({ error: "Administrator access is not configured." }, { status: 503 });
  const user = await verifyUser(request);
  if (user instanceof Response) return user;
  if (!user.isAdmin) return Response.json({ error: "This account does not have administrator access." }, { status: 403 });
  return null;
}
