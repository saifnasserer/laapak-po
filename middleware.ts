import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check if user is authenticated
    const authToken = request.cookies.get('auth_token');
    const isAuthenticated = authToken?.value === 'authenticated';

    // Allow access to API routes
    if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    // If not authenticated, show password gate on main page
    if (!isAuthenticated) {
        // User will see the password gate component rendered by page.tsx
        return NextResponse.next();
    }

    // User is authenticated, allow access
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
