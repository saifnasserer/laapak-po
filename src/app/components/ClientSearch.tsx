'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function ClientSearch() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');

    // Debounce search update
    useEffect(() => {
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set('search', query);
            } else {
                params.delete('search');
            }
            router.push(`/?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, router, searchParams]);

    return (
        <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                placeholder="Search clients..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            )}
        </div>
    );
}
