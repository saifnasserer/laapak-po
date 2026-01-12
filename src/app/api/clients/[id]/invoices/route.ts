import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const p = prisma as any;
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        // First, get the client to retrieve their tax registration number
        const client = await p.client.findUnique({
            where: { id },
            select: { taxRegistrationNumber: true, name: true },
        });

        if (!client) {
            return NextResponse.json(
                { error: 'Client not found' },
                { status: 404 }
            );
        }

        const taxId = (client as any).taxRegistrationNumber;

        if (!taxId) {
            return NextResponse.json(
                { error: 'Client does not have a tax registration number' },
                { status: 400 }
            );
        }

        // Build the query
        const where: any = {
            receiverId: taxId,
        };

        if (startDate || endDate) {
            where.dateTimeIssued = {};
            if (startDate) where.dateTimeIssued.gte = new Date(startDate);
            if (endDate) where.dateTimeIssued.lte = new Date(endDate);
        }

        // Fetch invoices
        const invoices = await p.eTAInvoice.findMany({
            where,
            orderBy: { dateTimeIssued: 'desc' },
            select: {
                uuid: true,
                internalId: true,
                documentType: true,
                dateTimeIssued: true,
                totalSalesAmount: true,
                totalDiscountAmount: true,
                netAmount: true,
                totalTax: true,
                totalAmount: true,
                status: true,
                issuerName: true,
            },
        });

        // Calculate totals
        const totals = invoices.reduce(
            (acc: any, inv: any) => {
                acc.totalAmount += inv.totalAmount;
                acc.totalTax += inv.totalTax;
                acc.count += 1;
                return acc;
            },
            { totalAmount: 0, totalTax: 0, count: 0 }
        );

        return NextResponse.json({
            client: {
                name: client.name,
                taxRegistrationNumber: taxId,
            },
            invoices,
            totals,
        });
    } catch (error) {
        console.error('Error fetching client invoices:', error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            { status: 500 }
        );
    }
}
