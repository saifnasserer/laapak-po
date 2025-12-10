import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePublicId } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientId, currency, taxRate, validUntil, status, paymentTerms, warranty, termsAndConditions, showProductOverview, showWarranty, showPricingSummary, showWhyLaapak, showPaymentTerms, showTermsAndConditions, showApproval, items } = body;

    if (!clientId || typeof clientId !== "string") {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one line item is required" },
        { status: 400 }
      );
    }

    // Validate client exists
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404 }
      );
    }

    // Generate unique publicId
    let publicId = generatePublicId();
    let attempts = 0;
    while (await prisma.purchaseOffer.findUnique({ where: { publicId } })) {
      publicId = generatePublicId();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { error: "Failed to generate unique PO ID" },
          { status: 500 }
        );
      }
    }

    // Convert and validate data types
    const taxRateNum = typeof taxRate === "string" ? parseFloat(taxRate) : (taxRate || 0);
    const validUntilDate = validUntil ? new Date(validUntil) : null;
    
    const DEFAULT_WARRANTY = `1- Warranty (6 months) against maintenance defects.

2- Warranty to replace the laptop in the event of a problem within a maximum period of 14 days.

3- Warranty for periodic maintenance for a full year provided that maintenance is performed at the company's warranty center twice, once every six months from the date of receipt of the laptop`;

    // Validate items
    for (const item of items) {
      if (!item.model || typeof item.model !== "string" || item.model.trim().length === 0) {
        return NextResponse.json(
          { error: "All items must have a valid model name" },
          { status: 400 }
        );
      }
      if (typeof item.quantity !== "number" || item.quantity <= 0) {
        return NextResponse.json(
          { error: "All items must have a valid quantity greater than 0" },
          { status: 400 }
        );
      }
      if (typeof item.price !== "number" || item.price < 0) {
        return NextResponse.json(
          { error: "All items must have a valid price" },
          { status: 400 }
        );
      }
    }

    // Create Price Offer with items
    const po = await prisma.purchaseOffer.create({
      data: {
        publicId,
        clientId,
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
            model: item.model?.trim() || "",
            quantity: Number(item.quantity) || 1,
            price: Number(item.price) || 0,
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

    return NextResponse.json(po, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Always log full error details
    console.error("Error creating Price Offer:", error);
    console.error("Error details:", { errorMessage, errorStack });
    
    return NextResponse.json(
      { error: "Failed to create Price Offer", details: errorMessage },
      { status: 500 }
    );
  }
}

