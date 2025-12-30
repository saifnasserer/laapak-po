import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { password } = await request.json();

        // Get the system password from environment variables
        const systemPassword = process.env.SYSTEM_PASSWORD || 'laapak2025';

        // Validate password
        if (password === systemPassword) {
            // Set HTTP-only cookie for authentication
            const cookieStore = await cookies();
            cookieStore.set('auth_token', 'authenticated', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                path: '/',
            });

            return NextResponse.json({ success: true });
        } else {
            return NextResponse.json(
                { success: false, message: 'Invalid password' },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error('Auth error:', error);
        return NextResponse.json(
            { success: false, message: 'Authentication failed' },
            { status: 500 }
        );
    }
}

// Logout endpoint
export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
    return NextResponse.json({ success: true });
}
