"use client";

import { useLocale } from 'next-intl';
import { Languages } from 'lucide-react';
import { useRouter, usePathname } from '@/i18n/routing';
import { useSearchParams } from 'next/navigation';

export function LanguageSwitcher() {
    const currentLocale = useLocale();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const newLocale = currentLocale === 'en' ? 'ar' : 'en';

    const handleSwitchLocale = () => {
        const search = searchParams.toString();
        const fullPath = search ? `${pathname}?${search}` : pathname;

        // Use replace with locale parameter to prevent /ar/en bug
        router.replace(fullPath, { locale: newLocale });
    };

    return (
        <button
            onClick={handleSwitchLocale}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all text-sm font-bold border border-gray-200"
            title={`Switch to ${currentLocale === 'en' ? 'Arabic' : 'English'}`}
        >
            <Languages size={18} />
            <span className="hidden sm:inline">{currentLocale === 'en' ? 'ع' : 'EN'}</span>
        </button>
    );
}
