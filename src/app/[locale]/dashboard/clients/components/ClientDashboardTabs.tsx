"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { FileText, Receipt, Smartphone, RefreshCw, AlertCircle } from "lucide-react";
import { InvoiceTable } from "./InvoiceTable";
import { PriceOfferGrid } from "./PriceOfferGrid";
import { TaxRegistrationControl } from "./TaxRegistrationControl";
import { formatCurrency } from "@/lib/utils";
import { FetchButton } from "./FetchButton";
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { DeviceReport } from "@/types/device-report";

interface ClientDashboardTabsProps {
    clientId: string;
    invoices: any[];
    pos: any[];
    taxRegistrationNumber: string | null;
    contactInfo: string | null;
    createdAt: Date;
    initialReports: DeviceReport[];
}

export function ClientDashboardTabs({ clientId, invoices, pos, taxRegistrationNumber, contactInfo, createdAt, initialReports }: ClientDashboardTabsProps) {
    const t = useTranslations('ClientDetails');
    const params = useParams();
    const locale = params.locale as string;
    const isRTL = locale === 'ar';
    const [activeTab, setActiveTab] = useState<"invoices" | "pos" | "reports">("pos");
    const [reports, setReports] = useState<DeviceReport[]>(initialReports || []);
    const [loadingReports, setLoadingReports] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);
    const [reportsFetched, setReportsFetched] = useState(true);

    const fetchReports = async () => {
        setLoadingReports(true);
        setReportError(null);
        try {
            const res = await fetch(`/api/clients/${clientId}/reports`);
            const data = await res.json();

            if (!res.ok) {
                if (res.status === 400 && data.error === "Client does not have a phone number linked") {
                    setReportError("no_phone");
                } else {
                    throw new Error(data.error || "Failed to fetch reports");
                }
            } else {
                setReports(data);
            }
        } catch (err) {
            setReportError(err instanceof Error ? err.message : "Error loading reports");
        } finally {
            setLoadingReports(false);
            setReportsFetched(true);
        }
    };

    const totalInvoicedValue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalOffersValue = pos.reduce((sum, po) => {
        return sum + po.items.reduce((itemSum: number, item: any) => itemSum + item.price * item.quantity, 0);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-2 rounded-t-xl">
                <div className="flex gap-8">
                    <button
                        onClick={() => setActiveTab("pos")}
                        className={`flex items-center gap-2 py-4 px-2 text-sm font-bold relative ${activeTab === "pos"
                            ? "text-green-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <FileText size={18} />
                        {t('priceOffers')}
                        {pos.length > 0 && (
                            <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px]">
                                {pos.length}
                            </span>
                        )}
                        {activeTab === "pos" && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("invoices")}
                        className={`flex items-center gap-2 py-4 px-2 text-sm font-bold relative ${activeTab === "invoices"
                            ? "text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Receipt size={18} />
                        {t('invoices')}
                        {invoices.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                                {invoices.length}
                            </span>
                        )}
                        {activeTab === "invoices" && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`flex items-center gap-2 py-4 px-2 text-sm font-bold relative ${activeTab === "reports"
                            ? "text-purple-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Smartphone size={18} />
                        {t('deviceReports')}
                        {reports.length > 0 && (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px]">
                                {reports.length}
                            </span>
                        )}
                        {activeTab === "reports" && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 rounded-t-full" />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {activeTab === "pos" ? (
                    <div className="space-y-6">
                        <PriceOfferGrid pos={pos} clientId={clientId} />
                    </div>
                ) : activeTab === "reports" ? (
                    <div className="space-y-6">
                        {loadingReports ? (
                            <div className="text-center py-12">
                                <RefreshCw className="animate-spin mx-auto text-gray-400 mb-2" size={24} />
                                <p className="text-gray-500">{t('loadingReports')}</p>
                            </div>
                        ) : reportError === "no_phone" ? (
                            <div className="bg-white rounded-xl border border-dashed border-purple-200 p-12 text-center shadow-sm">
                                <Smartphone size={48} className="mx-auto text-purple-100 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('phoneRequired')}</h3>
                                <p className="text-gray-500 mb-6 text-sm">{t('addPhoneToFetch')}</p>
                            </div>
                        ) : reportError ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                                <AlertCircle size={20} />
                                {reportError}
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center shadow-sm">
                                <Smartphone size={48} className="mx-auto text-gray-200 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">{t('noReportsFound')}</h3>
                                <p className="text-gray-500 text-sm">{t('noReportsDescription')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {reports.map((report) => (
                                    <Link
                                        href={`/dashboard/clients/${clientId}/reports/${report.id}`}
                                        key={report.id}
                                        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all hover:border-purple-200 group block"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{report.device_model}</h3>
                                                <p className="text-xs text-gray-500 font-mono mt-1">{report.serial_number}</p>
                                            </div>
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${report.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 space-y-1">
                                            <p>{t('inspectionDate')}: {new Date(report.inspection_date).toLocaleDateString()}</p>
                                            <p>{t('reportId')}: {report.id}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
                        {/* Top Widgets Row for Invoices */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        {t('companyProfile')}
                                    </h2>
                                </div>
                                <div className="p-5 flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t('contactInfo')}</label>
                                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
                                            {contactInfo || t('noContactInfo')}
                                        </p>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">{t('registryId')}</label>
                                            <TaxRegistrationControl clientId={clientId} initialValue={taxRegistrationNumber} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-medium italic">
                                                {t('registeredOn')} {new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="bg-gradient-to-br from-gray-900 to-blue-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <Receipt size={60} />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-black text-sm mb-1 uppercase tracking-wider">{t('etaSyncCloud')}</h3>
                                        <p className="text-blue-100 text-[10px] mb-4 font-medium leading-relaxed max-w-xs">
                                            {t('syncDescription')}
                                        </p>
                                        <FetchButton
                                            receiverId={taxRegistrationNumber}
                                            initialLastSyncDate={invoices[0]?.dateTimeIssued?.toISOString()}
                                        />
                                    </div>
                                </div>

                                {taxRegistrationNumber && (
                                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                                <Receipt size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase">{t('totalInvoiced')}</p>
                                                <p className="text-xl font-black text-blue-600">{formatCurrency(totalInvoicedValue, "EGP")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">{t('documents')}</p>
                                            <p className="text-base font-bold text-gray-900">{invoices.length}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Main Table Content */}
                        <div className="space-y-6">
                            {!taxRegistrationNumber ? (
                                <div className="bg-white rounded-xl border border-dashed border-blue-200 p-12 text-center shadow-sm">
                                    <Receipt size={48} className="mx-auto text-blue-100 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('invoicesNotLinked')}</h3>
                                    <p className="text-gray-500 mb-6 text-sm">{t('provideTaxId')}</p>
                                </div>
                            ) : (
                                <InvoiceTable invoices={invoices} clientId={clientId} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}
