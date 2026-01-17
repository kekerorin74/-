import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Paths to exclude from authentication check
    const publicPaths = ['/login', '/api/login', '/favicon.ico', '/_next'];

    const isPublicPath = publicPaths.some(path =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Check for the authentication cookie
    const authCookie = request.cookies.get('antigravity_session');

    if (!authCookie || authCookie.value !== 'true') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (except api/auth) - wait, we might want to protect API too? 
         * The prompt says "accessing ANY page including top page".
         * APIs should also be protected ideally, but let's stick to the prompt's focus on "viewing".
         * However, simpler to protect everything not explicitly public.
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
