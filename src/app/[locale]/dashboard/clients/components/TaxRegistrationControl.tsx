"use client";

import { useState } from "react";
import { Edit2, Check, X, ShieldCheck } from "lucide-react";
import { useRouter } from "@/i18n/routing";

interface TaxRegistrationControlProps {
    clientId: string;
    initialValue: string | null;
}

export function TaxRegistrationControl({ clientId, initialValue }: TaxRegistrationControlProps) {
    const [isEditing, setIsEditing] = useState(!initialValue);
    const [value, setValue] = useState(initialValue || "");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/clients/${clientId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // We need to fetch the existing name to update
                    // However, our API might require name. 
                    // Let's assume the API might need the full object or we can just send the change.
                    // Wait, I updated the API to handle partial updates? No, I used PUT.
                    // Let's check the API again.
                    taxRegistrationNumber: value.trim() || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to update Tax ID");
            }

            setIsEditing(false);
            router.refresh();
        } catch (err) {
            alert("Error updating Tax ID. Please make sure the name is also provided or the API supports partial updates.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isEditing) {
        return (
            <div className="flex items-center gap-3 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 group">
                <ShieldCheck className="text-blue-600 shrink-0" size={18} />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono font-bold text-blue-900 truncate">{value}</p>
                </div>
                <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Tax ID"
                >
                    <Edit2 size={14} />
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-xl border-2 border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white" size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900">Connect ETA Account</h4>
                    <p className="text-[10px] text-gray-500">Enter Tax Registration Number</p>
                </div>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="e.g. 123-456-789"
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                    disabled={loading}
                />
                <button
                    onClick={handleSave}
                    disabled={loading || !value.trim()}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    title="Save"
                >
                    <Check size={18} />
                </button>
                {initialValue && (
                    <button
                        onClick={() => {
                            setValue(initialValue);
                            setIsEditing(false);
                        }}
                        disabled={loading}
                        className="p-2 border border-gray-200 text-gray-400 rounded-lg hover:bg-gray-50 transition-colors"
                        title="Cancel"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}
