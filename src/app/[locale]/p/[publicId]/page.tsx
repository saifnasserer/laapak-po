import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { PublicPOView } from "@/app/[locale]/p/[publicId]/public-po-view";
import { shouldBeExpired } from "@/lib/utils";

interface PageProps {
    params: Promise<{ publicId: string }>;
}

export default async function PublicPOPage({ params }: PageProps) {
    const { publicId } = await params;

    const po = await prisma.purchaseOffer.findUnique({
        where: { publicId },
        include: {
            client: true,
            items: true,
        },
    });

    if (!po) {
        notFound();
    }

    // Check if PO should be expired and update if needed (only expire POs with DRAFT/PENDING status)
    let finalPO = po;
    if (po.validUntil && po.status === "DRAFT" && shouldBeExpired(po.validUntil)) {
        await prisma.purchaseOffer.update({
            where: { id: po.id },
            data: { status: "EXPIRED" },
        });
        // Refetch the PO with updated status
        const updatedPO = await prisma.purchaseOffer.findUnique({
            where: { publicId },
            include: {
                client: true,
                items: true,
            },
        });
        if (updatedPO) {
            finalPO = updatedPO;
        }
    }

    // Track view
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || null;

    try {
        await prisma.pOView.create({
            data: {
                poId: finalPO.id,
                userAgent,
            },
        });
    } catch (error) {
        // Ignore tracking errors (silently fail in production)
        if (process.env.NODE_ENV === "development") {
            console.error("Failed to track view:", error);
        }
    }

    // Convert Date objects to strings for the component
    const poForView = {
        ...finalPO,
        validUntil: finalPO.validUntil ? finalPO.validUntil.toISOString().split('T')[0] : null,
        createdAt: finalPO.createdAt.toISOString(),
    };

    return <PublicPOView po={poForView as any} />;
}
