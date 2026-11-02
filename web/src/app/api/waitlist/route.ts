const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Waitlist sign-up. Storage (Neon, via DATABASE_URL) is not wired up yet, so valid
 * requests answer { status: "closed" } and the form tells people how to follow along.
 */
export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  if (typeof email !== "string" || email.length > 254 || !EMAIL.test(email.trim())) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  return Response.json({ status: "closed" });
}
