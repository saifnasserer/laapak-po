"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold shadow-sm"
        >
            <Printer size={18} />
            Print Invoice
        </button>
    );
}
