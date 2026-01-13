import { formatCurrency } from "@/lib/utils";
import { FileText, CheckCircle2, AlertCircle, Clock, ArrowDownLeft, ArrowUpRight, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

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
    clientId: string;
}

export function InvoiceTable({ invoices, clientId }: InvoiceTableProps) {
    const t = useTranslations('Invoice');
    const params = useParams();
    const locale = params.locale as string;
    const isRTL = locale === 'ar';
    if (invoices.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noInvoices')}</h3>
                <p className="text-gray-600">{t('syncWithETA')}</p>
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
            <div className="overflow-x-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold text-balance">
                        <tr>
                            <th className="px-6 py-3">{t('id')}</th>
                            <th className="px-6 py-3">{t('type')}</th>
                            <th className="px-6 py-3">{t('date')}</th>
                            <th className={`px-6 py-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('totalAmount')}</th>
                            <th className="px-6 py-3">{t('status')}</th>
                            <th className={`px-4 py-3 ${isRTL ? 'text-left' : 'text-right'}`}>{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                            <tr key={invoice.uuid} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap font-black text-gray-900 font-mono">
                                    {invoice.internalId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getDocTypeBadge(invoice.documentType)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                    {new Date(invoice.dateTimeIssued).toLocaleDateString()}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'} font-black text-blue-600`}>
                                    {formatCurrency(invoice.totalAmount, "EGP")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                                        {getStatusIcon(invoice.status)}
                                        <span>{invoice.status}</span>
                                    </div>
                                </td>
                                <td className={`px-4 py-4 whitespace-nowrap ${isRTL ? 'text-left' : 'text-right'}`}>
                                    <Link
                                        href={`/dashboard/clients/${clientId}/invoices/${invoice.uuid}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-[10px] font-black uppercase tracking-wider shadow-sm"
                                    >
                                        <ExternalLink size={12} />
                                        {t('fullData')}
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
