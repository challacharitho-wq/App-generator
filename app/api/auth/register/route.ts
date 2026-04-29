import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log("Register route hit");
  try {
    const [{ hash }, { getPrismaClient }] = await Promise.all([
      import("bcryptjs"),
      import("@/lib/prisma"),
    ]);
    const prisma = getPrismaClient();
    const body = await request.json();
    const email = String(body?.email ?? "").toLowerCase().trim();
    const password = String(body?.password ?? "");
    if (!email || !password) {
      return NextResponse.json({ data: null, error: "Email and password are required." }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ data: null, error: "Email already in use." }, { status: 409 });
    }
    const hashed = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed },
      select: { email: true },
    });
    return NextResponse.json({ data: user, error: null }, { status: 201 });
  } catch (err) {
    console.error("REGISTER ERROR FULL:", JSON.stringify(err, Object.getOwnPropertyNames(err)));
    return NextResponse.json(
      {
        data: null,
        error: err instanceof Error ? err.message : "Internal server error.",
      },
      { status: 500 },
    );
  }
}
