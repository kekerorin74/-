import { cookies } from 'next/headers';
import AdminLoginForm from '@/components/AdminLoginForm';
import AdminPostForm from '@/components/AdminPostForm';

export default async function AdminPage() {
    const cookieStore = await cookies();
    const session = cookieStore.get('antigravity_session');

    // Middleware already protects this, but double check is fine
    if (session?.value === 'true') {
        return (
            <div className="min-h-screen p-6 bg-antigravity-bg">
                <h1 className="text-3xl font-bold text-center mb-8 text-glow text-white">Antigravity Console</h1>
                <AdminPostForm />
            </div>
        );
    }

    return (
        <div className="min-h-screen items-center justify-center bg-antigravity-bg p-4 text-white">
            Access Denied. Please login at /login.
        </div>
    );
}
