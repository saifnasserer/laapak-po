"use client";

import { useState } from "react";
import { FileText, Receipt } from "lucide-react";
import { InvoiceTable } from "./InvoiceTable";
import { PriceOfferGrid } from "@/app/dashboard/clients/components/PriceOfferGrid";
import { TaxRegistrationControl } from "./TaxRegistrationControl";
import { formatCurrency } from "@/lib/utils";
import { FetchButton } from "./FetchButton";

interface ClientDashboardTabsProps {
    clientId: string;
    invoices: any[];
    pos: any[];
    taxRegistrationNumber: string | null;
    contactInfo: string | null;
    createdAt: Date;
}

export function ClientDashboardTabs({ clientId, invoices, pos, taxRegistrationNumber, contactInfo, createdAt }: ClientDashboardTabsProps) {
    const [activeTab, setActiveTab] = useState<"invoices" | "pos">("pos");

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
                        Price Offers
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
                        ETA Invoices
                        {invoices.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px]">
                                {invoices.length}
                            </span>
                        )}
                        {activeTab === "invoices" && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />
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
                ) : (
                    <div className="space-y-8">
                        {/* Top Widgets Row for Invoices */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 flex items-center justify-between">
                                    <h2 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        Company Profile
                                    </h2>
                                </div>
                                <div className="p-5 flex flex-col sm:flex-row gap-6">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Contact Information</label>
                                        <p className="text-gray-700 text-xs leading-relaxed line-clamp-3">
                                            {contactInfo || "No contact information recorded."}
                                        </p>
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Registry ID (ETA)</label>
                                            <TaxRegistrationControl clientId={clientId} initialValue={taxRegistrationNumber} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-400 font-medium italic">
                                                Registered on {new Date(createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
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
                                        <h3 className="font-black text-sm mb-1 uppercase tracking-wider">ETA Sync Cloud</h3>
                                        <p className="text-blue-100 text-[10px] mb-4 font-medium leading-relaxed max-w-xs">
                                            Synchronize your local ledger with the Egyptian Tax Authority cloud network.
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
                                                <p className="text-[10px] font-black text-gray-400 uppercase">Total Invoiced</p>
                                                <p className="text-xl font-black text-blue-600">{formatCurrency(totalInvoicedValue, "EGP")}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase">Documents</p>
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
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Invoices Not Linked</h3>
                                    <p className="text-gray-500 mb-6 text-sm">Please provide a Tax Registration Number to fetch invoices from ETA.</p>
                                </div>
                            ) : (
                                <InvoiceTable invoices={invoices} clientId={clientId} />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
