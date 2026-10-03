'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">লোড হচ্ছে...</div>}>
            <AdminLoginContent />
        </Suspense>
    );
}

function AdminLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') ?? '/admin/dashboard';
    const { login } = useAdmin();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        adminCode: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(formData.email, formData.password, formData.adminCode);
        setLoading(false);

        if (res.success) {
            router.push(redirect);
        } else {
            setError(res.message ?? 'লগইন ব্যর্থ');
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🔐</div>
                    <h1 className="text-2xl font-bold">Admin Login</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        শুধুমাত্র অনুমোদিত অ্যাডমিনদের জন্য
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full border rounded-lg p-3 text-sm"
                            placeholder="admin@nursehelp.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input
                            required
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full border rounded-lg p-3 text-sm"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Admin Code 👈 NEW */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Admin Code <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.adminCode}
                            onChange={(e) => setFormData({ ...formData, adminCode: e.target.value })}
                            className="w-full border rounded-lg p-3 text-sm font-mono uppercase"
                            placeholder="ADM1001"
                            maxLength={20}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">
                            🎫 আপনার অনুমোদিত admin code দিন
                        </p>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                            ⚠️ {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'প্রসেস হচ্ছে...' : '🔓 Login'}
                    </button>
                </form>
            </div>
        </main>
    );
}