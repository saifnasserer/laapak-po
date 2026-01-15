"use client";

import { Check, ExternalLink, Phone, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { markClientAsContacted } from "../actions";

interface FollowUpRowProps {
    client: {
        id: string;
        name: string;
        phone: string | null;
        contactInfo: string | null;
        updatedAt: Date;
        _count: {
            pos: number;
            etaInvoices: number;
        };
    };
}

export function FollowUpRow({ client }: FollowUpRowProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isDone, setIsDone] = useState(false);

    const handleMarkContacted = async () => {
        setIsLoading(true);
        // Optimistic update
        setIsDone(true);

        const result = await markClientAsContacted(client.id);

        if (!result?.success) {
            // Revert if failed
            setIsDone(false);
        }
        setIsLoading(false);
    };

    if (isDone) return null; // Hide row immediately

    return (
        <div className="p-4 hover:bg-red-50/10 transition-colors group flex items-center justify-between gap-4 border-b border-gray-50 last:border-0">
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{client.name}</h3>
                    {client.id && (
                        <Link href={`/dashboard/clients/${client.id}`} className="text-gray-300 hover:text-blue-600 transition-colors" title="View Client">
                            <ExternalLink size={14} />
                        </Link>
                    )}
                </div>
                <div className="text-xs text-gray-500 flex flex-wrap gap-x-3 gap-y-1 items-center">
                    <span className="text-red-500 font-medium">Last: {new Date(client.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{client._count.pos} POs</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span>{client._count.etaInvoices} Invoices</span>
                </div>
                {(client.phone || client.contactInfo) && (
                    <p className="text-xs font-mono text-gray-400 mt-1 truncate">{client.phone || client.contactInfo}</p>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Link
                    href={`tel:${client.phone || ''}`}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-green-100 text-gray-400 hover:text-green-600 flex items-center justify-center transition-all shadow-sm"
                    title="Call Client"
                >
                    <Phone size={16} />
                </Link>

                <button
                    onClick={handleMarkContacted}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-blue-100 text-gray-400 hover:text-blue-600 flex items-center justify-center transition-all shadow-sm disabled:opacity-50"
                    title="Mark as Contacted (Removes from list)"
                >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                </button>
            </div>
        </div>
    );
}
