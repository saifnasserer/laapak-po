import { AnalysisService } from "@/lib/services/analysisService";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, AlertCircle, DollarSign, ExternalLink, Phone } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ClientListTabs } from "./components/ClientListTabs";

import { BackButton } from "../clients/components/BackButton";
import { getLocale } from "next-intl/server";

export const revalidate = 0; // Dynamic

export default async function AnalysisPage() {
    const t = await getTranslations("Dashboard");
    const locale = await getLocale();
    const isRTL = locale === "ar";
    const metrics = await AnalysisService.getMetrics();
    const inactiveClients = await AnalysisService.getInactiveClients(30);
    const activeClients = await AnalysisService.getActiveClients(20);
    const topClients = await AnalysisService.getTopClients(5);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <div className="flex items-center gap-4">
                <BackButton isRTL={isRTL} fallbackUrl="/" />
                <h1 className="text-2xl font-bold text-gray-900">Analysis & Follow-up</h1>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Active Clients (30d)"
                    value={metrics.activeClients.toString()}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50"
                />
                <KPICard
                    title="Revenue (Month)"
                    value={metrics.revenueMonth.toLocaleString()}
                    icon={TrendingUp}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <KPICard
                    title="Open Pipeline"
                    value={metrics.openPipeline.toLocaleString()}
                    icon={AlertCircle}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <KPICard
                    title="Avg. Deal Size"
                    value={metrics.avgDealSize.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    icon={DollarSign}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Left Column: Follow-up & Active */}
                <div >
                    <ClientListTabs inactiveClients={inactiveClients} activeClients={activeClients} />
                </div>

                {/* Right Column: Leaderboard */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <TrendingUp className="text-gray-400" size={24} />
                            Revenue Leaders
                        </h2>
                        <span className="bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1 rounded-full">
                            Top 5
                        </span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <div className="w-8 text-center">#</div>
                            <div className="flex-1">Client</div>
                            <div className="text-right">Total</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {topClients.map((client, idx) => (
                                <div key={idx} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                                    <div className="w-8 flex justify-center flex-shrink-0">
                                        <div className={`w-8 h-8 shrink-0 aspect-square rounded-full flex items-center justify-center text-sm font-black ${idx === 0 ? "bg-yellow-100 text-yellow-700 shadow-sm" :
                                            idx === 1 ? "bg-gray-100 text-gray-700" :
                                                idx === 2 ? "bg-orange-100 text-orange-700" :
                                                    "min-w-0"
                                            }`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 truncate text-sm">{client.name}</p>
                                            {client.clientId && (
                                                <Link href={`/dashboard/clients/${client.clientId}`} className="text-gray-300 hover:text-blue-600 shrink-0" title="View Client">
                                                    <ExternalLink size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="font-bold text-gray-900 text-sm block whitespace-nowrap">
                                            {client.totalSpent.toLocaleString()}
                                        </span>
                                        <span className="text-xs text-gray-400 block whitespace-nowrap">
                                            {client.invoiceCount} Invoices
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {topClients.length === 0 && (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    No revenue data available yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KPICard({ title, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                <Icon size={20} />
            </div>
        </div>
    );
}
