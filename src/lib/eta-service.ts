// ETA Service - Handles authentication and invoice fetching from Egyptian Tax Authority
import { prisma } from './prisma';

const AUTH_URL = process.env.ETA_AUTH_URL!;
const API_URL = process.env.ETA_API_URL!;
const CLIENT_ID = process.env.ETA_CLIENT_ID!;
const CLIENT_SECRET = process.env.ETA_CLIENT_SECRET!;

interface ETADocument {
    uuid: string;
    submissionUUID?: string;
    longId?: string;
    internalId: string;
    status: string;
    dateTimeIssued: string;
    taxpayerActivityCode?: string;
    issuerId: string;
    issuerName: string;
    receiverId: string;
    receiverName: string;
    totalSalesAmount: number;
    totalDiscountAmount: number;
    netAmount: number;
    totalAmount: number;
    extraDiscountAmount?: number;
    totalItemsDiscountAmount?: number;
    taxTotals?: Array<{
        taxType: string;
        amount: number;
    }>;
}

interface ETAFullDocument {
    uuid: string;
    submissionId: string;
    longId: string;
    internalId: string;
    typeName: string;
    documentType: string;
    documentTypeVersion: string;
    status: string;
    cancelRequestDate?: string;
    rejectRequestDate?: string;
    declineCancelRequestDate?: string;
    dateTimeIssued: string;
    dateTimeReceived: string;
    taxpayerActivityCode?: string;
    issuerId: string;
    issuerName: string;
    receiverId: string;
    receiverName: string;
    totalSalesAmount: number;
    totalDiscountAmount: number;
    netAmount: number;
    totalAmount: number;
    extraDiscountAmount: number;
    totalItemsDiscountAmount: number;
    taxTotals: Array<{
        taxType: string;
        amount: number;
    }>;
    document: string; // JSON string of the full document
}

export async function getAccessToken(): Promise<string> {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('scope', 'InvoicingAPI');

    const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
    });

    if (!response.ok) {
        throw new Error(`ETA Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function getFullDocument(accessToken: string, uuid: string): Promise<ETAFullDocument | null> {
    try {
        const response = await fetch(`${API_URL}/documents/${uuid}/raw`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            console.error(`Error fetching document ${uuid}: ${response.status}`);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching document ${uuid}:`, error);
        return null;
    }
}

function getDocumentType(fullDoc: ETAFullDocument): string {
    try {
        const doc = JSON.parse(fullDoc.document);
        return (doc.documentType || fullDoc.typeName || 'i').toLowerCase();
    } catch {
        return (fullDoc.typeName || 'i').toLowerCase();
    }
}

export async function fetchAllFullInvoices(
    startDate: Date,
    endDate: Date = new Date(),
    receiverId?: string
): Promise<{ totalFetched: number; totalValid: number; totalSkipped: number }> {
    const accessToken = await getAccessToken();

    let currentStart = new Date(startDate);
    // Ensure we don't have overlapping timestamps by a tiny bit
    currentStart.setSeconds(currentStart.getSeconds() + 1);

    let totalFetched = 0;
    let totalValid = 0;
    let totalSkipped = 0;

    while (currentStart < endDate) {
        // Calculate end of this 30-day chunk
        let currentEnd = new Date(currentStart);
        currentEnd.setDate(currentEnd.getDate() + 30);

        if (currentEnd > endDate) {
            currentEnd = endDate;
        }

        const dateFrom = currentStart.toISOString().split('.')[0] + 'Z';
        const dateTo = currentEnd.toISOString().split('.')[0] + 'Z';

        console.log(`📅 Fetching period: ${dateFrom.split('T')[0]} to ${dateTo.split('T')[0]}`);

        // Search for documents in this period
        let continuationToken: string | null = null;
        let hasMore = true;
        let pageNum = 1;

        while (hasMore) {
            try {
                const params = new URLSearchParams({
                    submissionDateFrom: dateFrom,
                    submissionDateTo: dateTo,
                    pageSize: '50',
                });

                if (receiverId) {
                    params.append('direction', 'Sent');
                    params.append('receiverId', receiverId);
                    console.log(`  🔍 Filtering: direction=Sent | receiverId=${receiverId}`);
                }

                if (continuationToken) {
                    params.append('continuationToken', continuationToken);
                }

                const searchResponse = await fetch(`${API_URL}/documents/search?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!searchResponse.ok) {
                    const errorText = await searchResponse.text();
                    console.error(`Error searching documents (${searchResponse.status}):`, errorText);
                    hasMore = false;
                    break;
                }

                const result = await searchResponse.json();
                const documents: ETADocument[] = result.result || [];
                const metadata = result.metadata;

                console.log(`  📄 Page ${pageNum}: Found ${documents.length} documents`);

                // Filter for VALID documents only
                const validDocs = documents.filter((doc) => doc.status === 'Valid');
                console.log(`  ✅ Valid: ${validDocs.length} | ❌ Skipped: ${documents.length - validDocs.length}`);

                totalSkipped += documents.length - validDocs.length;

                // Fetch full document for each valid one and save to DB
                for (const doc of validDocs) {
                    const fullDoc = await getFullDocument(accessToken, doc.uuid);

                    if (fullDoc) {
                        const docType = getDocumentType(fullDoc);
                        let docData: any = {};
                        try {
                            if (typeof fullDoc.document === 'string') {
                                docData = JSON.parse(fullDoc.document);
                            } else if (fullDoc.document && typeof fullDoc.document === 'object') {
                                docData = fullDoc.document;
                            }
                        } catch (e) {
                            console.warn('Failed to parse document JSON:', e);
                        }

                        const totalTax = docData.taxTotals?.reduce((sum: number, tax: any) => sum + tax.amount, 0) ||
                            fullDoc.taxTotals?.reduce((sum: number, tax: any) => sum + tax.amount, 0) || 0;

                        await prisma.eTAInvoice.upsert({
                            where: { uuid: fullDoc.uuid },
                            update: {
                                status: fullDoc.status,
                                fullDocument: fullDoc,
                                totalSalesAmount: docData.totalSalesAmount || fullDoc.totalSalesAmount || 0,
                                totalDiscountAmount: docData.totalDiscountAmount || fullDoc.totalDiscountAmount || 0,
                                netAmount: docData.netAmount || fullDoc.netAmount || 0,
                                totalTax: totalTax,
                                totalAmount: docData.totalAmount || fullDoc.totalAmount || 0,
                                updatedAt: new Date(),
                            },
                            create: {
                                uuid: fullDoc.uuid,
                                submissionUUID: fullDoc.submissionId,
                                longId: fullDoc.longId,
                                internalId: fullDoc.internalId,
                                documentType: docType.toUpperCase(),
                                dateTimeIssued: new Date(fullDoc.dateTimeIssued),
                                taxpayerActivityCode: fullDoc.taxpayerActivityCode,
                                receiverId: fullDoc.receiverId,
                                receiverName: fullDoc.receiverName,
                                issuerId: fullDoc.issuerId,
                                issuerName: fullDoc.issuerName,
                                totalSalesAmount: docData.totalSalesAmount || fullDoc.totalSalesAmount || 0,
                                totalDiscountAmount: docData.totalDiscountAmount || fullDoc.totalDiscountAmount || 0,
                                netAmount: docData.netAmount || fullDoc.netAmount || 0,
                                totalTax: totalTax,
                                totalAmount: docData.totalAmount || fullDoc.totalAmount || 0,
                                status: fullDoc.status,
                                fullDocument: fullDoc,
                            },
                        });

                        totalValid++;
                        console.log(`  💾 Saved: ${fullDoc.internalId} (${docType.toUpperCase()})`);
                    }

                    // Small delay to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }

                totalFetched += documents.length;

                if (metadata?.continuationToken && metadata.continuationToken !== 'EndofResultSet') {
                    continuationToken = metadata.continuationToken;
                    pageNum++;
                } else {
                    hasMore = false;
                }
            } catch (error) {
                console.error('Error in search loop:', error);
                hasMore = false;
            }
        }

        // Move to next chunk
        currentStart = new Date(currentEnd);
        currentStart.setMilliseconds(currentStart.getMilliseconds() + 1);

        // Small delay between date ranges
        if (currentStart < endDate) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    console.log('✅ FETCH COMPLETE!');
    console.log(`📊 Total documents found: ${totalFetched}`);
    console.log(`✅ Valid invoices saved: ${totalValid}`);
    console.log(`❌ Invalid/skipped: ${totalSkipped}`);

    return { totalFetched, totalValid, totalSkipped };
}
