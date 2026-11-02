import { neon } from "@neondatabase/serverless";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Waitlist sign-up, stored in Neon (table `waitlist`, unique on lower(email)).
 * Without DATABASE_URL (e.g. local dev) sign-ups answer { status: "closed" }.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }

  // honeypot: real visitors never see or fill this field
  if (typeof body.company === "string" && body.company !== "") {
    return Response.json({ status: "joined" }, { status: 201 });
  }

  const url = process.env.DATABASE_URL;
  if (!url) return Response.json({ status: "closed" });

  try {
    const sql = neon(url);
    // a repeat sign-up is a no-op, and the reply never reveals whether an address is already listed
    await sql`INSERT INTO waitlist (email) VALUES (${email}) ON CONFLICT ((lower(email))) DO NOTHING`;
    return Response.json({ status: "joined" }, { status: 201 });
  } catch (error) {
    console.error("waitlist insert failed", error);
    return Response.json({ error: "failed" }, { status: 500 });
  }
}
