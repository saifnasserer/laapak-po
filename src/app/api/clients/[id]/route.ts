import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, contactInfo } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Update client
    const client = await prisma.client.update({
      where: { id },
      data: {
        name: name.trim(),
        contactInfo: contactInfo?.trim() || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating client:", error);
      console.error("Error details:", { 
        errorName,
        errorMessage, 
        errorStack,
      });
    } else {
      console.error("Error updating client:", {
        errorName,
        errorMessage,
      });
    }
    return NextResponse.json(
      { 
        error: "Failed to update client",
        details: errorMessage,
        errorName: errorName
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if client exists
    const existingClient = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { pos: true },
        },
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Check if client has purchase offers
    if (existingClient._count.pos > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete client with existing Price Offers. Please delete all Price Offers first.",
        },
        { status: 400 }
      );
    }

    // Delete the client
    await prisma.client.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting client:", error);
      console.error("Error details:", { 
        errorName,
        errorMessage, 
        errorStack,
      });
    } else {
      console.error("Error deleting client:", {
        errorName,
        errorMessage,
      });
    }
    return NextResponse.json(
      { 
        error: "Failed to delete client",
        details: errorMessage,
        errorName: errorName
      },
      { status: 500 }
    );
  }
}

