import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactInfo, taxRegistrationNumber } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    const client = await prisma.client.create({
      data: {
        name: name.trim(),
        contactInfo: contactInfo?.trim() || null,
        taxRegistrationNumber: taxRegistrationNumber?.trim() || null,
      },
    });

    // #region agent log
    console.log("[DEBUG] POST /api/clients - Client created:", { clientId: client.id, clientName: client.name, nodeEnv: process.env.NODE_ENV });
    fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api/clients/route.ts:23', message: 'POST /api/clients - Client created', data: { clientId: client.id, clientName: client.name, nodeEnv: process.env.NODE_ENV }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    // Revalidate the homepage to show the new client
    // #region agent log
    console.log("[DEBUG] POST /api/clients - Before revalidatePath, paths:", ['/', `/dashboard/clients/${client.id}`]);
    fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api/clients/route.ts:28', message: 'POST /api/clients - Before revalidatePath', data: { paths: ['/', '/dashboard/clients/' + client.id] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    try {
      // Revalidate both page and layout to ensure complete cache invalidation
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidatePath(`/dashboard/clients/${client.id}`, "page");
      // #region agent log
      console.log("[DEBUG] POST /api/clients - After revalidatePath SUCCESS, revalidated:", ['/ (page)', '/ (layout)', `/dashboard/clients/${client.id} (page)`]);
      fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api/clients/route.ts:35', message: 'POST /api/clients - After revalidatePath', data: { success: true, revalidated: ['/ (page)', '/ (layout)', '/dashboard/clients/' + client.id + ' (page)'] }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
    } catch (revalidateError) {
      // #region agent log
      console.error("[DEBUG] POST /api/clients - revalidatePath ERROR:", revalidateError);
      fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api/clients/route.ts:39', message: 'POST /api/clients - revalidatePath error', data: { error: revalidateError instanceof Error ? revalidateError.message : String(revalidateError) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
      // #endregion
      console.error("revalidatePath error:", revalidateError);
    }

    // #region agent log
    console.log("[DEBUG] POST /api/clients - Returning response with clientId:", client.id);
    fetch('http://127.0.0.1:7242/ingest/bcb70cbe-853b-467e-af13-77a09249f6df', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'api/clients/route.ts:42', message: 'POST /api/clients - Returning response', data: { clientId: client.id }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    // Always log full error details
    console.error("Error creating client:", error);
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { error: "Failed to create client", details: errorMessage },
      { status: 500 }
    );
  }
}

