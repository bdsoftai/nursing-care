'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCustomer } from '@/context/CustomerContext';
import { getCurrentCustomer } from '@/services/customerService';
import ThemeToggle from '@/components/ThemeToggle';

// ═══════════════════════════════════════════════
// Main export — Suspense wrapper
// ═══════════════════════════════════════════════
export default function LoginPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <LoginContent />
        </Suspense>
    );
}

// ═══════════════════════════════════════════════
// Actual content — uses useSearchParams()
// ═══════════════════════════════════════════════
function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') ?? '/dashboard';
    const { login } = useCustomer();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('🔐 Login form submitted:', formData);

        const res = await login({
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            email: formData.email || undefined,
        });

        console.log('🔐 Login result:', res);

        setLoading(false);

        if (res.success) {
            const current = getCurrentCustomer();
            console.log('✅ After login, session =', current);

            if (current) {
                console.log('➡️ Redirecting to', redirect);
                router.push(redirect);
            } else {
                setError('Session save হয়নি — console দেখুন');
            }
        } else {
            setError(res.message ?? 'লগইন ব্যর্থ হয়েছে');
        }
    };

    return (
        <main className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            <header className="flex justify-between items-center p-4">
                <Link
                    href="/"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                    ← হোম
                </Link>
                <ThemeToggle />
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                    <div className="text-center mb-6">
                        <p className="text-4xl mb-2">👤</p>
                        <h1 className="text-xl font-bold mb-1">লগইন / রেজিস্টার</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ফোন অথবা Email দিয়ে লগইন করুন
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                আপনার নাম
                            </label>
                            <input
                                required
                                type="text"
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="যেমন: রহিম চৌধুরী"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                মোবাইল নম্বর
                            </label>
                            <input
                                required
                                type="tel"
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="017XXXXXXXX"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                ঠিকানা
                            </label>
                            <textarea
                                required
                                rows={2}
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="বাসা নম্বর, রোড, এলাকা"
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                            />
                        </div>

                        {/* Email (optional) */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                Email{' '}
                                <span className="text-gray-400 text-xs font-normal">
                                    (optional)
                                </span>
                            </label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                📧 Email দিলে পরে password recovery করতে পারবেন
                            </p>
                        </div>

                        {error && (
                            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-2 rounded-lg">
                                ⚠️ {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                        >
                            {loading ? 'প্রসেস হচ্ছে...' : 'লগইন / রেজিস্টার'}
                        </button>
                    </form>

                    <p className="text-[10px] text-center text-gray-400 mt-4">
                        এটি একটি ডেমো — কোনো পাসওয়ার্ড বা OTP ছাড়াই লগইন হয়
                    </p>
                </div>
            </div>
        </main>
    );
}

// ═══════════════════════════════════════════════
// Loading fallback
// ═══════════════════════════════════════════════
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <p className="text-sm text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
        </div>
    );
}