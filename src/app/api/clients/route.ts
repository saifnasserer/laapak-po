import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, contactInfo } = body;

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
      },
    });

    // Revalidate the homepage to show the new client
    revalidatePath("/");
    revalidatePath(`/dashboard/clients/${client.id}`);

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

