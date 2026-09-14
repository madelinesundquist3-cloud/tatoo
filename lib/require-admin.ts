// Verify the Firebase ID token through the project's account lookup endpoint.
// Never use the localStorage profile or a client-supplied email as authorization.
export async function requireAdmin(request: Request): Promise<Response | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 10000) {
    return Response.json({ error: "Sign in with your administrator Google account." }, { status: 401 });
  }
  const key = process.env.FIREBASE_WEB_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const adminEmail = (process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL)?.trim().toLowerCase();
  if (!key || !adminEmail) return Response.json({ error: "Administrator access is not configured." }, { status: 503 });
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: authorization.slice(7) }), cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return Response.json({ error: "Your session could not be verified. Please sign in again." }, { status: 401 });
    const result = await response.json();
    const user = result.users?.[0];
    if (!user || user.disabled || user.emailVerified !== true || user.email?.toLowerCase() !== adminEmail) {
      return Response.json({ error: "This account does not have administrator access." }, { status: 403 });
    }
    return null;
  } catch {
    return Response.json({ error: "Sign-in verification is temporarily unavailable." }, { status: 503 });
  }
}
