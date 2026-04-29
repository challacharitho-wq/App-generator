import { NextResponse } from "next/server";
import { clearServerConfig, getServerConfig, updateServerConfig } from "@/lib/config/serverConfig";
import { auth } from "@/auth";
import { parseConfig } from "@/lib/config/parser";

export async function GET() {
  return NextResponse.json(await getServerConfig());
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rawConfig = await request.json();
    const parsedConfig = parseConfig(rawConfig);
    await updateServerConfig(parsedConfig);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to update config" }, { status: 400 });
  }
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await clearServerConfig();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reset config" }, { status: 400 });
  }
}
