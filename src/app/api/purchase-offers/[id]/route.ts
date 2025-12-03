import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let items: any[] | undefined;
  try {
    const { id } = await params;
    const body = await request.json();
    const { clientId, currency, taxRate, validUntil, status, paymentTerms, warranty, termsAndConditions, showProductOverview, showWarranty, showPricingSummary, showWhyLaapak, showPaymentTerms, showTermsAndConditions, showApproval, items: bodyItems } = body;
    items = bodyItems;

    // Check if PO exists
    const existingPO = await prisma.purchaseOffer.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!existingPO) {
      return NextResponse.json(
        { error: "Price Offer not found" },
        { status: 404 }
      );
    }

    if (existingPO.clientId !== clientId) {
      return NextResponse.json(
        { error: "Client ID mismatch" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required" },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.model || !item.model.trim()) {
        return NextResponse.json(
          { error: "All items must have a model name" },
          { status: 400 }
        );
      }
      if (!item.quantity || Number(item.quantity) <= 0) {
        return NextResponse.json(
          { error: "All items must have a quantity greater than 0" },
          { status: 400 }
        );
      }
      if (item.price === undefined || item.price === null || Number(item.price) < 0) {
        return NextResponse.json(
          { error: "All items must have a valid price" },
          { status: 400 }
        );
      }
    }

    const DEFAULT_WARRANTY = `1- Warranty (6 months) against maintenance defects.

2- Warranty to replace the laptop in the event of a problem within a maximum period of 14 days.

3- Warranty for periodic maintenance for a full year provided that maintenance is performed at the company's warranty center twice, once every six months from the date of receipt of the laptop`;

    // Parse taxRate as number
    const taxRateNum = taxRate ? Number(taxRate) : 0;
    const validUntilDate = validUntil ? new Date(validUntil) : null;

    // Delete existing items first
    await prisma.lineItem.deleteMany({
      where: { poId: id },
    });

    // Update Price Offer with new items
    const po = await prisma.purchaseOffer.update({
      where: { id },
      data: {
        currency: currency || "EGP",
        taxRate: taxRateNum,
        validUntil: validUntilDate,
        status: status || "DRAFT",
        paymentTerms: paymentTerms?.trim() || null,
        warranty: warranty?.trim() || DEFAULT_WARRANTY,
        termsAndConditions: termsAndConditions?.trim() || null,
        showProductOverview: showProductOverview ?? true,
        showWarranty: showWarranty ?? true,
        showPricingSummary: showPricingSummary ?? true,
        showWhyLaapak: showWhyLaapak ?? true,
        showPaymentTerms: showPaymentTerms ?? true,
        showTermsAndConditions: showTermsAndConditions ?? true,
        showApproval: showApproval ?? true,
        items: {
          create: items.map((item: any) => ({
            model: item.model.trim(),
            quantity: Number(item.quantity),
            price: Number(item.price),
            specs: item.specs?.trim() || null,
            notes: item.notes?.trim() || null,
          })),
        },
      },
      include: {
        items: true,
        client: true,
      },
    });

    return NextResponse.json(po);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    // Log error details (only in development or for monitoring)
    if (process.env.NODE_ENV === "development") {
      console.error("Error updating Price Offer:", error);
      console.error("Error details:", { 
        errorName,
        errorMessage, 
        errorStack,
        itemsCount: items?.length,
      });
    } else {
      // In production, log structured errors for monitoring
      console.error("Error updating Price Offer:", {
        errorName,
        errorMessage,
        itemsCount: items?.length,
      });
    }
    return NextResponse.json(
      { 
        error: "Failed to update Price Offer",
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

    // Check if PO exists
    const existingPO = await prisma.purchaseOffer.findUnique({
      where: { id },
    });

    if (!existingPO) {
      return NextResponse.json(
        { error: "Price Offer not found" },
        { status: 404 }
      );
    }

    // Delete related records first (due to foreign key constraints)
    // Delete all line items
    await prisma.lineItem.deleteMany({
      where: { poId: id },
    });

    // Delete all views
    await prisma.pOView.deleteMany({
      where: { poId: id },
    });

    // Now delete the PO
    await prisma.purchaseOffer.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : "Error";
    
    if (process.env.NODE_ENV === "development") {
      console.error("Error deleting Price Offer:", error);
      console.error("Error details:", { 
        errorName,
        errorMessage, 
        errorStack,
      });
    } else {
      console.error("Error deleting Price Offer:", {
        errorName,
        errorMessage,
      });
    }
    return NextResponse.json(
      { 
        error: "Failed to delete Price Offer",
        details: errorMessage,
        errorName: errorName
      },
      { status: 500 }
    );
  }
}

