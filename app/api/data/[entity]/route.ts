import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServerConfig } from "@/lib/config/serverConfig";
import { findEntity, getEntityName, validateRecordData } from "@/lib/config/entityRuntime";
import { createRecord, listRecords } from "@/lib/db/entityQuery";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET(request: Request, { params }: { params: { entity: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const config = await getServerConfig();
  const entity = findEntity(config, params.entity);

  if (!entity?.name) {
    return NextResponse.json({ data: null, error: "Entity not found in configuration." }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const result = await listRecords(getEntityName(entity), userId, {
    searchQuery: searchParams.get("q") ?? undefined,
    searchableFields: entity.searchableFields ?? [],
  });

  return NextResponse.json(result);
}

export async function POST(request: Request, { params }: { params: { entity: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const config = await getServerConfig();
  const entity = findEntity(config, params.entity);

  if (!entity?.name) {
    return NextResponse.json({ error: "Entity not found in configuration." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

  const validation = validateRecordData(entity, body, "create");
  if (validation.error || !validation.data) {
    return NextResponse.json({ error: validation.error ?? "Validation failed." }, { status: 400 });
  }

  const result = await createRecord(getEntityName(entity), userId, validation.data);
  return NextResponse.json(result, { status: 201 });
}
