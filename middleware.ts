import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
    locales: ['en', 'ar'],
    defaultLocale: 'ar',
    localePrefix: 'always',
    localeDetection: false,
});

export const config = {
    matcher: [
        // Match all pathnames except for:
        // - API routes
        // - Static files (_next/static)
        // - Image optimization files (_next/image)
        // - Favicon and other assets
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
