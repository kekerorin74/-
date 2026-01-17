"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push('/'); // Redirect to home on success
                router.refresh(); // Ensure middleware re-runs
            } else {
                setError('Password Incorrect');
            }
        } catch {
            setError('Login Failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-antigravity-bg p-4">
            <div className="bg-black/50 p-8 rounded-xl border border-antigravity-purple/30 shadow-[0_0_50px_rgba(189,0,255,0.2)] max-w-md w-full backdrop-blur-sm">
                <h2 className="text-2xl font-bold text-white mb-6 text-center text-glow">ANTIGRAVITY ACCESS</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="password"
                        placeholder="Access Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-900/80 border border-gray-700 rounded-lg p-4 text-white focus:border-antigravity-purple focus:ring-1 focus:ring-antigravity-purple outline-none transition-all"
                    />
                    {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
                    <button
                        type="submit"
                        className="w-full bg-antigravity-purple text-white font-bold py-4 rounded-lg hover:bg-fuchsia-600 transition-colors shadow-lg"
                    >
                        ENTER SITE
                    </button>
                </form>
            </div>
        </div>
    );
}
