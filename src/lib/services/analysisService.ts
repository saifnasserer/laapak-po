import { prisma } from "@/lib/prisma";

export const AnalysisService = {
    /**
     * Get high-level KPI metrics
     */
    async getMetrics() {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // 1. Active Clients (Last 30 Days)
        const activeClientsCount = await prisma.client.count({
            where: {
                OR: [
                    { pos: { some: { createdAt: { gte: thirtyDaysAgo } } } },
                    { etaInvoices: { some: { dateTimeIssued: { gte: thirtyDaysAgo } } } }
                ]
            }
        });

        // 2. Total Revenue (This Month) - From Valid Invoices
        const revenueResult = await prisma.eTAInvoice.aggregate({
            where: {
                dateTimeIssued: { gte: startOfMonth },
                status: "Valid"
            },
            _sum: {
                totalAmount: true
            }
        });

        // 3. Open Pipeline (Draft/Published POs value)
        // Note: This is an estimation. We sum (items.price * items.quantity)
        // Since price is on LineItem, we might need a raw query or fetch & sum.
        // Fetching is safer for logic availability.
        const openPos = await prisma.purchaseOffer.findMany({
            where: {
                status: { in: ["DRAFT", "PUBLISHED"] },
                // Optional: validUntil is future
            },
            include: {
                items: true
            }
        });

        const openPipelineValue = openPos.reduce((sum, po) => {
            const poTotal = po.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            return sum + poTotal;
        }, 0);

        // 4. Avg Deal Size (All time or this year?) -> Let's do All Time for stability
        const avgDealResult = await prisma.eTAInvoice.aggregate({
            where: { status: "Valid" },
            _avg: {
                totalAmount: true
            }
        });

        return {
            activeClients: activeClientsCount,
            revenueMonth: revenueResult._sum.totalAmount || 0,
            openPipeline: openPipelineValue,
            avgDealSize: avgDealResult._avg.totalAmount || 0
        };
    },

    /**
     * Get inactive clients who haven't had activity in `days`
     */
    async getInactiveClients(days: number = 30) {
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() - days);

        return await prisma.client.findMany({
            where: {
                AND: [
                    {
                        name: { not: { contains: 'لابك' } } // Exclude Laapak
                    },
                    {
                        name: { not: { contains: 'Laapak' } } // Exclude Laapak
                    },
                    {
                        pos: {
                            none: { createdAt: { gte: thresholdDate } }
                        }
                    },
                    {
                        etaInvoices: {
                            none: { dateTimeIssued: { gte: thresholdDate } }
                        }
                    }
                ]
            },
            select: {
                id: true,
                name: true,
                phone: true,
                contactInfo: true,
                updatedAt: true,
                _count: {
                    select: { pos: true, etaInvoices: true }
                }
            },
            orderBy: { updatedAt: 'asc' }, // Oldest first
            take: 20
        });
    },

    /**
     * Get top clients by Total Paid Revenue (All time)
     */
    async getTopClients(limit: number = 5) {
        // Since we can't easily orderBy aggregate in nested relation findMany,
        // we use groupBy on ETAInvoice first.
        const topPayers = await prisma.eTAInvoice.groupBy({
            by: ['receiverId'],
            where: {
                status: "Valid",
                receiverId: { not: "" },
                receiverName: { not: { contains: 'لابك' } } // Quick filter on denormalized name if available, or just filter later
                // Note: receiverName might not be reliable if not synced, but let's assume it is or rely on client filter
            },
            _sum: {
                totalAmount: true
            },
            orderBy: {
                _sum: {
                    totalAmount: 'desc'
                }
            },
            take: limit + 5 // Fetch extra in case we filter some out
        });

        // Map Tax Number -> Client Details
        const taxNumbers = topPayers.map(p => p.receiverId);

        const clients = await prisma.client.findMany({
            where: {
                taxRegistrationNumber: { in: taxNumbers },
                // Double check exclusion here
                AND: [
                    { name: { not: { contains: 'لابك' } } },
                    { name: { not: { contains: 'Laapak' } } }
                ]
            },
            select: {
                id: true,
                name: true,
                taxRegistrationNumber: true
            }
        });

        // Merge and Filter (only return those that matched a valid client to exclude weird data)
        const results = topPayers.map(payer => {
            const client = clients.find(c => c.taxRegistrationNumber === payer.receiverId);
            if (!client) return null; // Filter out if not found or excluded
            return {
                taxId: payer.receiverId,
                name: client.name,
                clientId: client.id,
                totalSpent: payer._sum.totalAmount || 0
            };
        }).filter(item => item !== null) as any[];

        return results.slice(0, limit);
    }
};
