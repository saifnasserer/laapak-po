"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface FetchButtonProps {
    receiverId?: string | null;
    initialLastSyncDate?: string | null;
    onSuccess?: () => void;
}

export function FetchButton({ receiverId, initialLastSyncDate, onSuccess }: FetchButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showOptions, setShowOptions] = useState(false);
    // TEMPORARY: Default to Nov 2024 as requested
    const [syncDate, setSyncDate] = useState("2024-11-01");
    // const [syncDate, setSyncDate] = useState(initialLastSyncDate ? initialLastSyncDate.split('T')[0] : "");
    const router = useRouter();

    const handleFetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/eta/fetch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    receiverId: receiverId || undefined,
                    startDate: syncDate || undefined,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || "Failed to fetch invoices");
            }

            const data = await response.json();
            if (data.success) {
                setShowOptions(false);
                router.refresh();
                if (onSuccess) onSuccess();
            } else {
                throw new Error(data.error || "Unknown error");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch invoices");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <button
                    onClick={handleFetch}
                    disabled={loading || (!receiverId && !syncDate)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-bold shadow-sm"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    {loading ? "Syncing..." : "Sync ETA Invoices"}
                </button>
                <button
                    onClick={() => setShowOptions(!showOptions)}
                    className="p-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Sync Options"
                >
                    <RefreshCw size={18} className={showOptions ? "rotate-180 transition-transform" : ""} />
                </button>
            </div>

            {!receiverId && !showOptions && (
                <p className="text-[10px] text-amber-600 font-medium text-center bg-amber-50 py-1 rounded border border-amber-100 italic">
                    Connect an ETA account above to sync invoices.
                </p>
            )}

            {showOptions && (
                <div className="p-4 bg-white rounded-lg border border-blue-100 shadow-sm space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-1">
                            Fetch Invoices Issued Since
                        </label>
                        <input
                            type="date"
                            value={syncDate}
                            onChange={(e) => setSyncDate(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 italic">
                            {initialLastSyncDate
                                ? "Auto-detected last invoice date."
                                : "Default: Last 30 days."}
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
}
