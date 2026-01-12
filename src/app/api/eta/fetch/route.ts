import { NextRequest, NextResponse } from 'next/server';
import { fetchAllFullInvoices } from '@/lib/eta-service';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { startDate, endDate, receiverId } = body;

        let start: Date;

        if (startDate) {
            start = new Date(startDate);
        } else {
            // TEMPORARY: Default to Nov 1, 2024 as requested
            start = new Date('2024-11-01T00:00:00Z');
            console.log(`📅 TEMPORARY: Starting sync from Nov 2024 (${start.toISOString()})`);
        }

        const end = endDate ? new Date(endDate) : new Date();

        console.log(`🔄 Starting ETA invoice fetch ${receiverId ? `for ${receiverId}` : 'globally'} from ${start.toISOString()} to ${end.toISOString()}`);

        const result = await fetchAllFullInvoices(start, end, receiverId);

        return NextResponse.json({
            success: true,
            message: 'Invoice fetch completed',
            ...result,
        });
    } catch (error) {
        console.error('Error fetching ETA invoices:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            },
            { status: 500 }
        );
    }
}
