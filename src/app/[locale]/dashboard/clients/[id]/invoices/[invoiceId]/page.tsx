import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ShieldCheck, Building2, User, Info } from "lucide-react";
import { PrintButton } from "../../../components/PrintButton";
import { BackButton } from "../../../components/BackButton";
import { getTranslations } from 'next-intl/server';

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string; invoiceId: string; locale: string }>;
}) {
    const { id, invoiceId, locale } = await params;
    const isRTL = locale === 'ar';

    const invoice = await (prisma as any).eTAInvoice.findUnique({
        where: { uuid: invoiceId },
        include: {
            client: true,
        },
    });

    if (!invoice) {
        notFound();
    }

    const t = await getTranslations('InvoiceDetail');


    const rawFullDoc = invoice.fullDocument as any;

    // Debug logging
    console.log('===== INVOICE DEBUG =====');
    console.log('Invoice UUID:', invoice.uuid);
    console.log('rawFullDoc keys:', Object.keys(rawFullDoc || {}));
    console.log('rawFullDoc.document type:', typeof rawFullDoc?.document);

    // ETA documents can have data in different structures
    let docData = rawFullDoc;

    // Check if there's a nested document field
    if (rawFullDoc?.document) {
        if (typeof rawFullDoc.document === 'string') {
            try {
                docData = JSON.parse(rawFullDoc.document);
                console.log('✓ Parsed document from string');
            } catch (e) {
                console.error("Failed to parse nested document JSON", e);
            }
        } else if (typeof rawFullDoc.document === 'object') {
            docData = rawFullDoc.document;
            console.log('✓ Using document object directly');
        }
    }

    console.log('docData keys:', Object.keys(docData || {}));
    console.log('invoiceLines count:', docData?.invoiceLines?.length || 0);
    console.log('issuer:', docData?.issuer?.name || 'NOT FOUND');
    console.log('receiver:', docData?.receiver?.name || 'NOT FOUND');
    console.log('=========================');

    const items = docData?.invoiceLines || [];
    const taxTotals = docData?.taxTotals || [];
    const validationSteps = rawFullDoc?.validationResults?.validationSteps || [];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Nav Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <BackButton
                        isRTL={isRTL}
                        fallbackUrl={`/dashboard/clients/${id}`}
                    />
                    <div className="flex items-center gap-3">
                        <PrintButton />
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Compact Header Block */}
                    <div className="p-6 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        {t('invoiceNumber')} <span className="font-mono text-gray-600">{invoice.internalId}</span>
                                    </h1>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${invoice.status === "Valid"
                                        ? "bg-green-50 text-green-700 border-green-100"
                                        : "bg-red-50 text-red-700 border-red-100"
                                        }`}>
                                        {invoice.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                                    <span className="flex items-center gap-1.5">
                                        <span className="font-bold text-gray-400 uppercase tracking-wider">{t('etaUuid')}:</span>
                                        <span className="font-mono text-gray-600 select-all">{invoice.uuid.substring(0, 8)}...</span>
                                    </span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    <span>{new Date(invoice.dateTimeIssued).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('activityCode')}</p>
                                    <p className="text-xs font-bold text-gray-700 font-mono">{docData?.taxpayerActivityCode || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t('version')}</p>
                                    <p className="text-xs font-bold text-gray-700 font-mono">{docData?.documentTypeVersion || '1.0'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Grid (Compact) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Issuer */}
                        <div className="p-6 bg-blue-50/10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Building2 size={14} className="text-blue-600" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t('issuer')}</h3>
                            </div>
                            <div className="pl-8 space-y-1">
                                <p className="text-sm font-bold text-gray-900">{docData?.issuer?.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{docData?.issuer?.id}</p>
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                    {docData?.issuer?.address?.buildingNumber} {docData?.issuer?.address?.street}, {docData?.issuer?.address?.regionCity}
                                </p>
                            </div>
                        </div>

                        {/* Receiver */}
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <User size={14} className="text-gray-500" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{t('receiver')}</h3>
                            </div>
                            <div className="pl-8 space-y-1">
                                <p className="text-sm font-bold text-gray-900">{docData?.receiver?.name}</p>
                                <p className="text-xs text-gray-500 font-mono">{docData?.receiver?.id}</p>
                                <p className="text-xs text-gray-500 leading-relaxed mt-1">
                                    {docData?.receiver?.address?.buildingNumber} {docData?.receiver?.address?.street}, {docData?.receiver?.address?.regionCity}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Compact Data Table */}
                    <div className="border-t border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-2.5 px-4">{t('descriptionCodes')}</th>
                                        <th className="py-2.5 px-4 text-right">{t('qty')}</th>
                                        <th className="py-2.5 px-4 text-right">{t('unitValue')}</th>
                                        <th className="py-2.5 px-4 text-right">{t('netAmount')}</th>
                                        <th className="py-2.5 px-4 text-right">{t('taxes')}</th>
                                        <th className="py-2.5 px-4 text-right">{t('total')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                    {items.map((item: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-gray-50/50">
                                            <td className="py-3 px-4 max-w-xs">
                                                <p className="font-semibold text-gray-900">{item.description}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="font-mono text-gray-400">{item.itemType}:{item.itemCode}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {item.quantity} {item.unitType}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {formatCurrency(item.unitValue?.amountEGP, "EGP")}
                                            </td>
                                            <td className="py-3 px-4 text-right font-medium">
                                                {formatCurrency(item.netTotal, "EGP")}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="flex flex-col items-end gap-0.5">
                                                    {(item.taxableItems || []).map((t: any, tidx: number) => (
                                                        <span key={tidx} className="text-[10px] text-gray-500">
                                                            {t.taxType} {t.rate}%
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-right font-bold text-gray-900">
                                                {formatCurrency(item.total, "EGP")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Integrated Footer / Totals */}
                    <div className="bg-gray-50/50 border-t border-gray-200 p-6">
                        <div className="flex flex-col sm:flex-row justify-end gap-8">
                            {/* Tax Breakdown (Optional - compact) */}
                            <div className="flex-1 flex flex-wrap gap-3 justify-end content-start text-xs text-gray-500">
                                {(taxTotals || []).map((tax: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-gray-200 rounded px-2 py-1">
                                        <span className="font-bold">{tax.taxType}:</span> {formatCurrency(tax.amount, "EGP")}
                                    </div>
                                ))}
                            </div>

                            {/* Final Totals Block */}
                            <div className="w-full sm:w-72 bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{t('grossSales')}</span>
                                    <span className="font-medium text-gray-900">{formatCurrency(docData?.totalSalesAmount, "EGP")}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{t('itemsDiscount')}</span>
                                    <span className="font-medium text-red-600">-{formatCurrency(docData?.totalItemsDiscountAmount || 0, "EGP")}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{t('totalTaxes')}</span>
                                    <span className="font-medium text-blue-600">+{formatCurrency(docData?.totalTaxAmount || 0, "EGP")}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-900">{t('payableAmount')}</span>
                                    <span className="text-lg font-black text-gray-900">{formatCurrency(docData?.totalAmount, "EGP")}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer decoration */}
                    <div className="h-1 bg-gradient-to-r from-blue-600 to-purple-600" />
                </div>
            </main>
        </div>
    );
}
