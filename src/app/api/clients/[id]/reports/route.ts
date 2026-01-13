import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reportService } from "@/lib/services/reportService";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const client = await prisma.client.findUnique({
            where: { id },
            select: { phone: true },
        });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        if (!client.phone) {
            return NextResponse.json(
                { error: "Client does not have a phone number linked" },
                { status: 400 }
            );
        }

        const reports = await reportService.getReportsByPhone(client.phone);

        return NextResponse.json(reports);
    } catch (error) {
        console.error("Error fetching reports:", error);
        return NextResponse.json(
            { error: "Failed to fetch reports" },
            { status: 500 }
        );
    }
}
