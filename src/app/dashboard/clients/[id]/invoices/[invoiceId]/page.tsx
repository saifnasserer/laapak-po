import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ArrowLeft, ShieldCheck, Building2, User, Info } from "lucide-react";
import { PrintButton } from "@/app/dashboard/clients/components/PrintButton";

export default async function InvoiceDetailPage({
    params,
}: {
    params: Promise<{ id: string; invoiceId: string }>;
}) {
    const { id, invoiceId } = await params;

    const invoice = await (prisma as any).eTAInvoice.findUnique({
        where: { uuid: invoiceId },
        include: {
            client: true,
        },
    });

    if (!invoice) {
        notFound();
    }

    const rawFullDoc = invoice.fullDocument as any;

    // ETA documents often have the core data nested as a string in the "document" field
    let docData = rawFullDoc;
    if (typeof rawFullDoc?.document === 'string') {
        try {
            docData = JSON.parse(rawFullDoc.document);
        } catch (e) {
            console.error("Failed to parse nested document JSON", e);
        }
    }

    const items = docData?.invoiceLines || [];
    const taxTotals = docData?.taxTotals || [];
    const validationSteps = rawFullDoc?.validationResults?.validationSteps || [];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Sticky Header Actions */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
                    <Link
                        href={`/dashboard/clients/${id}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Client
                    </Link>
                    <div className="flex items-center gap-3">
                        <PrintButton />
                    </div>
                </div>
            </div>

            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 space-y-8">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden print:shadow-none print:border-none">
                    {/* Document Header Section */}
                    <div className="p-8 sm:p-12 border-b border-gray-100 bg-white">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Electronic Document</p>
                                    <h1 className="text-xl font-black text-gray-900 tracking-tight uppercase">Invoice #{invoice.internalId}</h1>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Activity Code</span>
                                        <span className="text-sm font-black text-gray-900 font-mono">{docData?.taxpayerActivityCode || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Version</span>
                                        <span className="text-sm font-black text-gray-900 font-mono">{docData?.documentTypeVersion || '1.0'}</span>
                                    </div>
                                    <div className="flex flex-col col-span-2">
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">ETA UUID</span>
                                        <span className="text-[10px] font-bold text-blue-600 font-mono break-all leading-tight">{invoice.uuid}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-4">
                                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${invoice.status === "Valid" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
                                    }`}>
                                    {invoice.status}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Issued Date</p>
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">{new Date(invoice.dateTimeIssued).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12 space-y-12">
                        {/* Issuer & Receiver Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Issuer Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                    <div className="flex items-center gap-2">
                                        <Building2 size={16} className="text-gray-400" />
                                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Issuer</h3>
                                    </div>
                                    <span className="text-[9px] font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase tracking-tighter">Branch: {docData?.issuer?.address?.branchID || '0'}</span>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg font-black text-gray-900 leading-tight">{docData?.issuer?.name}</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center shrink-0">
                                                <ShieldCheck size={12} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tax Registration</p>
                                                <p className="text-sm font-bold text-gray-700 font-mono tracking-wide">{docData?.issuer?.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center shrink-0">
                                                <Info size={12} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                                <p className="text-xs text-gray-600 leading-relaxed font-bold uppercase tracking-tight">
                                                    {docData?.issuer?.address?.buildingNumber} {docData?.issuer?.address?.street}<br />
                                                    {docData?.issuer?.address?.regionCity && `${docData.issuer.address.regionCity}, `}
                                                    {docData?.issuer?.address?.governate}<br />
                                                    {docData?.issuer?.address?.postalCode && `Zip: ${docData.issuer.address.postalCode} • `}
                                                    {docData?.issuer?.address?.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Receiver Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                    <User size={16} className="text-gray-400" />
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Receiver</h3>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg font-black text-gray-900 leading-tight">{docData?.receiver?.name}</p>
                                    <div className="space-y-3">
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center shrink-0">
                                                <ShieldCheck size={12} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tax ID / National ID</p>
                                                <p className="text-sm font-bold text-gray-700 font-mono tracking-wide">{docData?.receiver?.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <div className="w-5 h-5 bg-gray-50 rounded flex items-center justify-center shrink-0">
                                                <Info size={12} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                                <p className="text-xs text-gray-600 leading-relaxed font-bold uppercase tracking-tight">
                                                    {docData?.receiver?.address?.buildingNumber} {docData?.receiver?.address?.street}<br />
                                                    {docData?.receiver?.address?.regionCity && `${docData.receiver.address.regionCity}, `}
                                                    {docData?.receiver?.address?.governate}<br />
                                                    {docData?.receiver?.address?.postalCode && `Zip: ${docData.receiver.address.postalCode} • `}
                                                    {docData?.receiver?.address?.country}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Document Items ({items.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                                            <th className="py-3 px-2">Description / Codes</th>
                                            <th className="py-3 px-2 text-right">Qty</th>
                                            <th className="py-3 px-2 text-right">Unit Value</th>
                                            <th className="py-3 px-2 text-right">Net Amount</th>
                                            <th className="py-3 px-2 text-right">Taxes</th>
                                            <th className="py-3 px-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {items.map((item: any, idx: number) => (
                                            <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                                <td className="py-5 px-2 max-w-xs">
                                                    <p className="font-black text-gray-900 leading-snug">{item.description}</p>
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        <span className="text-[8px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">{item.itemType}: {item.itemCode}</span>
                                                        {item.internalCode && <span className="text-[8px] font-black bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded uppercase">Ref: {item.internalCode}</span>}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-2 text-right font-black text-gray-700">
                                                    {item.quantity} <span className="text-[9px] text-gray-400 font-bold uppercase">{item.unitType}</span>
                                                </td>
                                                <td className="py-5 px-2 text-right font-black text-gray-700">
                                                    {formatCurrency(item.unitValue?.amountEGP, "EGP")}
                                                </td>
                                                <td className="py-5 px-2 text-right font-black text-gray-700">
                                                    {formatCurrency(item.netTotal, "EGP")}
                                                </td>
                                                <td className="py-5 px-2 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        {(item.taxableItems || []).map((t: any, tidx: number) => (
                                                            <div key={tidx} className="flex items-center gap-1.5 text-[8px] font-black bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                                                <span className="text-gray-400 italic">{t.taxType} {t.rate}%</span>
                                                                <span className="text-gray-700">+{formatCurrency(t.amount, "EGP")}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="py-5 px-2 text-right font-black text-blue-600">
                                                    {formatCurrency(item.total, "EGP")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Totals Section */}
                        <div className="flex flex-col sm:flex-row justify-between gap-12 pt-8 border-t border-gray-100">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Tax breakdown</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {(taxTotals || []).map((tax: any, idx: number) => (
                                        <div key={idx} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 space-y-1">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{tax.taxType} Aggregate</p>
                                            <p className="text-sm font-black text-gray-900">{formatCurrency(tax.amount, "EGP")}</p>
                                        </div>
                                    ))}
                                </div>
                                {docData?.extraDiscountAmount > 0 && (
                                    <div className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Extra Discount Applied</span>
                                        <span className="text-sm font-black text-red-700">-{formatCurrency(docData.extraDiscountAmount, "EGP")}</span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full sm:w-80 space-y-4 bg-gray-900 rounded-2xl p-6 shadow-xl shadow-gray-200">
                                <div className="space-y-2 border-b border-gray-800 pb-4">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Gross Sales</span>
                                        <span className="font-black text-white">{formatCurrency(docData?.totalSalesAmount, "EGP")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Items Discount</span>
                                        <span className="font-black text-red-400">-{formatCurrency(docData?.totalItemsDiscountAmount || 0, "EGP")}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Net Amount</span>
                                        <span className="font-black text-white">{formatCurrency(docData?.netAmount, "EGP")}</span>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500 font-black uppercase tracking-widest">Total Taxes</span>
                                        <span className="font-black text-blue-400">+{formatCurrency(docData?.totalTaxAmount || 0, "EGP")}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Payable Amount</span>
                                        <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(docData?.totalAmount, "EGP")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Decoration */}
                    <div className="h-3 bg-gradient-to-r from-blue-600 via-blue-900 to-gray-900" />
                </div>



                <div className="text-center space-y-2 pb-12">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">
                        Laapak Software Solutions &bull; Official ETA Integration Gateway
                    </p>
                    <div className="flex items-center justify-center gap-4 text-[9px] font-black text-gray-300 uppercase tracking-widest">
                        <span>Digital Signature Verified</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span>Real-time Sync Active</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span>Secure Record</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
