"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
    isRTL: boolean;
    fallbackUrl: string;
}

export function BackButton({ isRTL, fallbackUrl }: BackButtonProps) {
    const router = useRouter();

    const handleBack = () => {
        if (window.history.length > 2) {
            router.back();
        } else {
            router.push(fallbackUrl);
        }
    };

    return (
        <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 shrink-0"
            aria-label="Go back"
        >
            <ArrowLeft size={20} className={isRTL ? "rotate-180" : ""} />
        </button>
    );
}
