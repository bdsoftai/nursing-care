'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNurse } from '@/context/NurseContext';
import { Hospital } from '@/types';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

interface Category {
    code: string;
    name_bn: string;
}

export default function NurseLoginModal({ isOpen, onClose }: Props) {
    const router = useRouter();
    const { login, nurse } = useNurse();

    // Tab: 'login' | 'signup'
    const [tab, setTab] = useState<'login' | 'signup'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // ── Login state ──
    const [loginData, setLoginData] = useState({ email: '', password: '' });

    // ── Signup state ──
    const [signupData, setSignupData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        category_code: '',
        hospital_id: '',
        area: '',
        image_url: '',
    });

    // ── Categories + Hospitals ──
    const [categories, setCategories] = useState<Category[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);

    // Already logged in → redirect
    useEffect(() => {
        if (isOpen && nurse) {
            onClose();
            router.push('/nurse/dashboard');
        }
    }, [isOpen, nurse, onClose, router]);

    // Load categories + hospitals when modal opens
    useEffect(() => {
        if (!isOpen) return;

        async function load() {
            try {
                const [catsRes, hospsRes] = await Promise.all([
                    fetch('/api/categories'),
                    fetch('/api/hospitals'),
                ]);
                const cats = await catsRes.json();
                const hosps = await hospsRes.json();
                setCategories(cats.categories ?? []);
                setHospitals(hosps.hospitals ?? []);
            } catch (err) {
                console.error('Load error:', err);
            }
        }
        load();

        // Reset state on open
        setTab('login');
        setError('');
        setSuccess(false);
        setLoginData({ email: '', password: '' });
        setSignupData({
            name: '',
            phone: '',
            email: '',
            password: '',
            address: '',
            category_code: '',
            hospital_id: '',
            area: '',
            image_url: '',
        });
    }, [isOpen]);

    if (!isOpen) return null;

    // ═══════════════════════════════════════════
    // LOGIN HANDLER
    // ═══════════════════════════════════════════
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const res = await login(loginData.email, loginData.password);
        setLoading(false);

        if (res.success) {
            onClose();
            router.push('/nurse/dashboard');
        } else {
            setError(res.message ?? 'লগইন ব্যর্থ');
        }
    };

    // ═══════════════════════════════════════════
    // SIGNUP HANDLER
    // ═══════════════════════════════════════════
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/nurses/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupData),
            });
            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message ?? 'রেজিস্ট্রেশন ব্যর্থ');
            }
        } catch {
            setLoading(false);
            setError('নেটওয়ার্ক সমস্যা');
        }
    };

    // ═══════════════════════════════════════════
    // IMAGE UPLOAD
    // ═══════════════════════════════════════════
    const handleFileUpload = async (file: File) => {
        setLoading(true);
        setError('');

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'nurses');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
            });
            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setSignupData({ ...signupData, image_url: data.url });
            } else {
                setError(data.message);
            }
        } catch {
            setLoading(false);
            setError('Upload ব্যর্থ');
        }
    };

    // ═══════════════════════════════════════════
    // SUCCESS SCREEN
    // ═══════════════════════════════════════════
    if (success) {
        return (
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                onClick={onClose}
            >
                <div
                    className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-8 text-center">
                        <div className="text-5xl mb-3">✅</div>
                        <h2 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                            রেজিস্ট্রেশন সফল!
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            আপনার আবেদন Admin-এর কাছে পাঠানো হয়েছে। Approve হলে Email-এ জানতে
                            পারবেন।
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setSuccess(false);
                                    setTab('login');
                                }}
                                className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                            >
                                🔓 লগইনে যান
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                বন্ধ করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════
    // MAIN MODAL
    // ═══════════════════════════════════════════
    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[95vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ═══════════ HEADER ═══════════ */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-5 text-white text-center relative shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-lg transition"
                        aria-label="Close"
                    >
                        ×
                    </button>
                    <div className="text-3xl mb-1">🧑‍⚕️</div>
                    <h2 className="text-base font-bold">
                        {tab === 'login' ? 'নার্স লগইন' : 'নার্স রেজিস্ট্রেশন'}
                    </h2>
                    <p className="text-xs text-teal-100 mt-0.5">
                        {tab === 'login'
                            ? 'আপনার অ্যাকাউন্টে প্রবেশ করুন'
                            : 'নতুন অ্যাকাউন্ট তৈরি করুন'}
                    </p>
                </div>

                {/* ═══════════ TABS ═══════════ */}
                <div className="flex border-b border-gray-200 dark:border-gray-800 shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            setTab('login');
                            setError('');
                        }}
                        className={`flex-1 py-3 text-sm font-bold transition ${tab === 'login'
                                ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-b-2 border-teal-600'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        🔓 লগইন
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setTab('signup');
                            setError('');
                        }}
                        className={`flex-1 py-3 text-sm font-bold transition ${tab === 'signup'
                                ? 'bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border-b-2 border-teal-600'
                                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                            }`}
                    >
                        📝 রেজিস্ট্রেশন
                    </button>
                </div>

                {/* ═══════════ SCROLLABLE CONTENT ═══════════ */}
                <div className="overflow-y-auto flex-1">
                    <div className="p-5">
                        {tab === 'login' ? (
                            /* ──────── LOGIN FORM ──────── */
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Email
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        autoFocus
                                        value={loginData.email}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, email: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="nurse@example.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Password
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        value={loginData.password}
                                        onChange={(e) =>
                                            setLoginData({ ...loginData, password: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                        ⚠️ {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-teal-300 transition"
                                >
                                    {loading ? 'প্রসেস হচ্ছে...' : '🔓 লগইন'}
                                </button>

                                {/* 👇 Signup Button */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                    <p className="text-xs text-center text-gray-500 mb-2">
                                        অ্যাকাউন্ট নেই?
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTab('signup');
                                            setError('');
                                        }}
                                        className="w-full py-2.5 border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-500 rounded-lg font-medium hover:bg-teal-50 dark:hover:bg-teal-950 transition"
                                    >
                                        📝 নতুন রেজিস্ট্রেশন করুন
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* ──────── SIGNUP FORM ──────── */
                            <form onSubmit={handleSignup} className="space-y-3">
                                {/* Image Upload */}
                                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0 border-2 border-dashed border-gray-300 dark:border-gray-600">
                                        {signupData.image_url ? (
                                            <img
                                                src={signupData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-2xl text-gray-400">📷</span>
                                        )}
                                    </div>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const f = e.target.files?.[0];
                                                if (f) handleFileUpload(f);
                                            }}
                                        />
                                        <span className="inline-block px-3 py-1.5 border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-500 rounded-lg text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-950 transition">
                                            📤 ছবি নির্বাচন করুন
                                        </span>
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            JPG, PNG • সর্বোচ্চ 5MB
                                        </p>
                                    </label>
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        নাম *
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={signupData.name}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, name: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="যেমন: রেহানা পারভীন"
                                    />
                                </div>

                                {/* Phone + Area */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            ফোন *
                                        </label>
                                        <input
                                            required
                                            type="tel"
                                            value={signupData.phone}
                                            onChange={(e) =>
                                                setSignupData({ ...signupData, phone: e.target.value })
                                            }
                                            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                            placeholder="017XXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                            এলাকা *
                                        </label>
                                        <select
                                            required
                                            value={signupData.area}
                                            onChange={(e) =>
                                                setSignupData({ ...signupData, area: e.target.value })
                                            }
                                            className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        >
                                            <option value="">-- select --</option>
                                            <option value="Uttara">Uttara</option>
                                            <option value="Mirpur">Mirpur</option>
                                            <option value="Dhanmondi">Dhanmondi</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Email *
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={signupData.email}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, email: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="nurse@example.com"
                                    />
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Password *
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        value={signupData.password}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, password: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="কমপক্ষে ৬ অক্ষর"
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        ধরন *
                                    </label>
                                    <select
                                        required
                                        value={signupData.category_code}
                                        onChange={(e) =>
                                            setSignupData({
                                                ...signupData,
                                                category_code: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                    >
                                        <option value="">-- নির্বাচন করুন --</option>
                                        {categories.map((c) => (
                                            <option key={c.code} value={c.code}>
                                                {c.name_bn}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Hospital */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        হাসপাতাল
                                    </label>
                                    <select
                                        value={signupData.hospital_id}
                                        onChange={(e) =>
                                            setSignupData({
                                                ...signupData,
                                                hospital_id: e.target.value,
                                            })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                    >
                                        <option value="">-- নির্বাচন করুন --</option>
                                        {hospitals.map((h) => (
                                            <option key={h.id} value={h.id}>
                                                {h.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        ঠিকানা
                                    </label>
                                    <input
                                        type="text"
                                        value={signupData.address}
                                        onChange={(e) =>
                                            setSignupData({ ...signupData, address: e.target.value })
                                        }
                                        className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none transition"
                                        placeholder="বাসা নম্বর, রোড"
                                    />
                                </div>

                                {error && (
                                    <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                        ⚠️ {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-teal-300 transition"
                                >
                                    {loading ? 'প্রসেস হচ্ছে...' : '📝 রেজিস্ট্রেশন করুন'}
                                </button>

                                {/* Back to Login */}
                                <div className="pt-2 border-t border-gray-200 dark:border-gray-800">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setTab('login');
                                            setError('');
                                        }}
                                        className="w-full py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                    >
                                        ← লগইনে ফিরে যান
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}