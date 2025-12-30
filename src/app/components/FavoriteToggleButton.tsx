'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FavoriteToggleButtonProps {
    clientId: string;
    initialIsFavorite: boolean;
}

export function FavoriteToggleButton({ clientId, initialIsFavorite }: FavoriteToggleButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;

        setIsLoading(true);
        try {
            const resp = await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId }),
            });

            if (resp.ok) {
                const data = await resp.json();
                setIsFavorite(data.isFavorite);
                router.refresh();
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            className={`p-2 rounded-full transition-all duration-200 ${isFavorite
                    ? 'text-yellow-500 hover:bg-yellow-50'
                    : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-100'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            disabled={isLoading}
        >
            <Star
                size={20}
                fill={isFavorite ? "currentColor" : "none"}
                strokeWidth={isFavorite ? 1.5 : 2}
            />
        </button>
    );
}
