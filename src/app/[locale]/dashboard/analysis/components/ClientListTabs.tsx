"use client";

import { Phone, CheckCircle2, TrendingUp, ExternalLink } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { FollowUpRow } from "./FollowUpRow";

interface ClientListTabsProps {
    inactiveClients: any[];
    activeClients: any[];
}

export function ClientListTabs({ inactiveClients, activeClients }: ClientListTabsProps) {
    const [activeTab, setActiveTab] = useState<"inactive" | "active">("inactive");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab("inactive")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "inactive"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <Phone size={16} />
                        Follow-up Required
                        {inactiveClients.length > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "inactive" ? "bg-red-100 text-red-700" : "bg-gray-200 text-gray-600"
                                }`}>
                                {inactiveClients.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("active")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "active"
                            ? "bg-white text-gray-900 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <CheckCircle2 size={16} />
                        Recently Active
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === "active" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                            }`}>
                            {activeClients.length}
                        </span>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex-1">
                <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        {activeTab === "inactive" ? "Inactive for 30+ Days" : "Activity in Last 30 Days"}
                    </p>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {activeTab === "inactive" ? (
                        inactiveClients.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                                    <TrendingUp className="text-green-500" size={32} />
                                </div>
                                <p>All clients are engaged! Great work.</p>
                            </div>
                        ) : (
                            inactiveClients.map(client => (
                                <FollowUpRow key={client.id} client={client} />
                            ))
                        )
                    ) : (
                        activeClients.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                No recently active clients found.
                            </div>
                        ) : (
                            activeClients.map(client => {
                                const poDate = client.pos?.[0] ? new Date(client.pos[0].updatedAt).getTime() : 0;
                                const etaDate = client.etaInvoices?.[0] ? new Date(client.etaInvoices[0].dateTimeIssued).getTime() : 0;
                                const maxDate = Math.max(poDate, etaDate);
                                const displayDate = maxDate > 0
                                    ? new Date(maxDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
                                    : new Date(client.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });

                                return (
                                    <div key={client.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{client.name}</h3>
                                                {client.id && (
                                                    <Link href={`/dashboard/clients/${client.id}`} className="text-gray-300 hover:text-blue-600 transition-colors" title="View Client">
                                                        <ExternalLink size={14} />
                                                    </Link>
                                                )}
                                            </div>
                                            <div className="text-xs text-green-600 font-medium flex flex-wrap gap-x-3 gap-y-1 items-center">
                                                <span>Active: {displayDate}</span>
                                                <span className="w-1 h-1 bg-green-200 rounded-full" />
                                                <span className="text-gray-500">{client._count.pos} POs</span>
                                                <span className="text-gray-500">•</span>
                                                <span className="text-gray-500">{client._count.etaInvoices} Invoices</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
