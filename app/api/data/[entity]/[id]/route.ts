import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getServerConfig } from "@/lib/config/serverConfig";
import { findEntity, getEntityName, validateRecordData } from "@/lib/config/entityRuntime";
import { deleteRecord, updateRecord } from "@/lib/db/entityQuery";

async function getSessionUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function PUT(request: Request, { params }: { params: { entity: string; id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const config = await getServerConfig();
  const entity = findEntity(config, params.entity);

  if (!entity?.name) {
    return NextResponse.json({ data: null, error: "Entity not found in configuration." }, { status: 404 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });

  const validation = validateRecordData(entity, body, "update");
  if (validation.error || !validation.data) {
    return NextResponse.json({ error: validation.error ?? "Validation failed." }, { status: 400 });
  }

  const result = await updateRecord(getEntityName(entity), userId, params.id, validation.data);
  return NextResponse.json(result);
}

export async function DELETE(_request: Request, { params }: { params: { entity: string; id: string } }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

  const config = await getServerConfig();
  const entity = findEntity(config, params.entity);

  if (!entity?.name) {
    return NextResponse.json({ data: null, error: "Entity not found in configuration." }, { status: 404 });
  }

  const result = await deleteRecord(getEntityName(entity), userId, params.id);
  return NextResponse.json(result);
}
