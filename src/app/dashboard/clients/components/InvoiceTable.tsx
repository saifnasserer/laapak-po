import { formatCurrency } from "@/lib/utils";
import { FileText, CheckCircle2, AlertCircle, Clock, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Invoice {
    uuid: string;
    internalId: string;
    documentType: string;
    dateTimeIssued: string | Date;
    totalAmount: number;
    totalTax: number;
    status: string;
    issuerName: string;
    [key: string]: any;
}

interface InvoiceTableProps {
    invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
    if (invoices.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Invoices found</h3>
                <p className="text-gray-600">Sync with ETA to see invoices for this client.</p>
            </div>
        );
    }

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "valid":
                return <CheckCircle2 size={16} className="text-green-500" />;
            case "invalid":
                return <AlertCircle size={16} className="text-red-500" />;
            default:
                return <Clock size={16} className="text-yellow-500" />;
        }
    };

    const getDocTypeBadge = (type: string) => {
        switch (type.toUpperCase()) {
            case "I":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        <ArrowUpRight size={12} />
                        Invoice
                    </span>
                );
            case "C":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        <ArrowDownLeft size={12} />
                        Credit Note
                    </span>
                );
            case "D":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                        <ArrowUpRight size={12} />
                        Debit Note
                    </span>
                );
            default:
                return type;
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold">
                        <tr>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Internal ID</th>
                            <th className="px-6 py-3 text-right">Tax</th>
                            <th className="px-6 py-3 text-right">Total Amount</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice.uuid} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                    {new Date(invoice.dateTimeIssued).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getDocTypeBadge(invoice.documentType)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {invoice.internalId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-gray-500">
                                    {formatCurrency(invoice.totalTax, "EGP")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-gray-900">
                                    {formatCurrency(invoice.totalAmount, "EGP")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-xs">
                                        {getStatusIcon(invoice.status)}
                                        <span className="capitalize">{invoice.status}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
