"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginForm() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/admin-post'); // Redirect to secret page
            } else {
                setError('Invalid password');
            }
        } catch {
            setError('An error occurred');
        }
    };

    return (
        <div className="w-full max-w-md bg-antigravity-card p-8 rounded-2xl border border-gray-800 shadow-2xl">
            <h2 className="text-2xl font-bold text-center text-white mb-6">Admin Access</h2>
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-antigravity-accent transition-colors"
                        placeholder="••••••••"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-antigravity-accent text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(0,243,255,0.3)]"
                >
                    Enter Console
                </button>
            </form>
        </div>
    );
}
