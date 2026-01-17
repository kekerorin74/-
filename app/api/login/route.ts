import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();

        // In a real application, this should be an environment variable
        if (password === (process.env.ADMIN_PASSWORD || 'paladion55')) {
            const cookieStore = await cookies();
            cookieStore.set('antigravity_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax', // Lax is better for top-level navigation
                maxAge: 60 * 60 * 24 * 30 // 30 days
            });
            // Also set admin session for backward compatibility if needed, or just unify.
            // Let's unify. The prompt says "use same password".
            // So one cookie "antigravity_session" is enough for everything.
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
