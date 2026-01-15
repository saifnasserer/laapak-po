import { AnalysisService } from "@/lib/services/analysisService";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, AlertCircle, DollarSign, ExternalLink, Phone } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const revalidate = 0; // Dynamic

export default async function AnalysisPage() {
    const t = await getTranslations("Dashboard");
    const metrics = await AnalysisService.getMetrics();
    const inactiveClients = await AnalysisService.getInactiveClients(30);
    const topClients = await AnalysisService.getTopClients(5);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Analysis & Follow-up</h1>

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
                    value={formatCurrency(metrics.revenueMonth, "EGP")}
                    icon={TrendingUp}
                    color="text-green-600"
                    bg="bg-green-50"
                />
                <KPICard
                    title="Open Pipeline"
                    value={formatCurrency(metrics.openPipeline, "EGP")}
                    icon={AlertCircle}
                    color="text-amber-600"
                    bg="bg-amber-50"
                />
                <KPICard
                    title="Avg. Deal Size"
                    value={formatCurrency(metrics.avgDealSize, "EGP")}
                    icon={DollarSign}
                    color="text-purple-600"
                    bg="bg-purple-50"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Left Column: Follow-up Actions */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Phone className="text-gray-400" size={24} />
                            Follow-up Required
                        </h2>
                        {inactiveClients.length > 0 && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                                {inactiveClients.length} Action Items
                            </span>
                        )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1">
                        <div className="p-4 bg-gray-50 border-b border-gray-100">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Inactive for 30+ Days</p>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                            {inactiveClients.length === 0 ? (
                                <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                        <TrendingUp className="text-green-500" size={32} />
                                    </div>
                                    <p>All clients are engaged! Great work.</p>
                                </div>
                            ) : (
                                inactiveClients.map(client => (
                                    <div key={client.id} className="p-4 hover:bg-red-50/10 transition-colors group flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{client.name}</h3>
                                                {client.id && (
                                                    <Link href={`/dashboard/clients/${client.id}`} className="text-gray-300 hover:text-blue-600 transition-colors" title="View Client">
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 items-center">
                                                <span className="text-red-500 font-medium">Last: {new Date(client.updatedAt).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{client._count.pos} POs</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                <span>{client._count.etaInvoices} Invoices</span>
                                            </div>
                                            {client.phone && (
                                                <p className="text-xs font-mono text-gray-400 mt-1">{client.phone}</p>
                                            )}
                                        </div>
                                        <Link
                                            href={`tel:${client.phone || ''}`}
                                            className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-green-100 text-gray-400 group-hover:text-green-600 flex items-center justify-center transition-all shadow-sm"
                                            title="Call Client"
                                        >
                                            <Phone size={18} />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
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
                        <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                            <div className="col-span-1 text-center">#</div>
                            <div className="col-span-8">Client</div>
                            <div className="col-span-3 text-right">Total</div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {topClients.map((client, idx) => (
                                <div key={idx} className="p-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition-colors">
                                    <div className="col-span-1 flex justify-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${idx === 0 ? "bg-yellow-100 text-yellow-700 shadow-sm" :
                                                idx === 1 ? "bg-gray-100 text-gray-700" :
                                                    idx === 2 ? "bg-orange-100 text-orange-700" :
                                                        "min-w-0"
                                            }`}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="col-span-8 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-gray-900 truncate text-sm">{client.name}</p>
                                            {client.clientId && (
                                                <Link href={`/dashboard/clients/${client.clientId}`} className="text-gray-300 hover:text-blue-600 shrink-0">
                                                    <ExternalLink size={12} />
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-span-3 text-right">
                                        <span className="font-bold text-gray-900 text-sm block">
                                            {formatCurrency(client.totalSpent, "EGP")}
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
