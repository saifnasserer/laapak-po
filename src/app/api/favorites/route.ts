import { NextRequest, NextResponse } from 'next/server';
import { toggleFavorite } from '@/lib/favorites';

export async function POST(request: NextRequest) {
    try {
        const { clientId } = await request.json();

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }

        const isAdded = await toggleFavorite(clientId);
        return NextResponse.json({ success: true, isFavorite: isAdded });
    } catch (error) {
        console.error('API Error toggling favorite:', error);
        return NextResponse.json({ error: 'Failed to toggle favorite' }, { status: 500 });
    }
}
