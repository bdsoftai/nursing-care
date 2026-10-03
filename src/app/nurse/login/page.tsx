'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ImageUploader from '@/components/ImageUploader';

interface Hospital {
    id: string;
    name: string;
}

interface Category {
    code: string;
    name_bn: string;
}

export default function NurseRegisterPage() {
    const router = useRouter();

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
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

    // ── Load categories + hospitals ──
    useEffect(() => {
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
                console.error('Failed to load categories/hospitals:', err);
            }
        }
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/nurses/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message ?? 'রেজিস্ট্রেশন ব্যর্থ');
            }
        } catch (err) {
            setLoading(false);
            setError('নেটওয়ার্ক সমস্যা');
        }
    };

    // ── Success Screen ──
    if (success) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-teal-900 to-teal-700 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl">
                    <div className="text-5xl mb-4">✅</div>
                    <h1 className="text-xl font-bold mb-2">রেজিস্ট্রেশন সফল!</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        আপনার আবেদন অ্যাডমিনের কাছে পাঠানো হয়েছে। Approve হলে আপনি
                        Email-এ জানতে পারবেন।
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={() => router.push('/nurse/login')}
                            className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700"
                        >
                            🔓 Login করুন
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="flex-1 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                        >
                            🏠 হোমে ফিরুন
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    // ── Registration Form ──
    return (
        <main className="min-h-screen bg-gradient-to-br from-teal-900 to-teal-700 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="text-5xl mb-2">🧑‍⚕️</div>
                    <h1 className="text-2xl font-bold text-white">নার্স রেজিস্ট্রেশন</h1>
                    <p className="text-sm text-teal-100 mt-1">
                        নিচের তথ্য পূরণ করুন — Admin approve করলে login করতে পারবেন
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                নাম *
                            </label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="যেমন: মোছাঃ রেহানা পারভীন"
                            />
                        </div>

                        {/* Phone + Email */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    ফোন *
                                </label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({ ...formData, phone: e.target.value })
                                    }
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="017XXXXXXXX"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Email *
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                    placeholder="nurse@example.com"
                                />
                            </div>
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
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="কমপক্ষে ৬ অক্ষর"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                🔒 এই password দিয়ে আপনি login করবেন
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                ধরন *
                            </label>
                            <select
                                required
                                value={formData.category_code}
                                onChange={(e) =>
                                    setFormData({ ...formData, category_code: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
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
                                value={formData.hospital_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, hospital_id: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                {hospitals.map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Area */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                এলাকা *
                            </label>
                            <select
                                required
                                value={formData.area}
                                onChange={(e) =>
                                    setFormData({ ...formData, area: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                <option value="Uttara">Uttara</option>
                                <option value="Mirpur">Mirpur</option>
                                <option value="Dhanmondi">Dhanmondi</option>
                            </select>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                ঠিকানা
                            </label>
                            <textarea
                                rows={2}
                                value={formData.address}
                                onChange={(e) =>
                                    setFormData({ ...formData, address: e.target.value })
                                }
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
                                placeholder="বাসা নম্বর, রোড, এলাকা"
                            />
                        </div>

                        {/* Image URL */}
                        {/* Image Upload */}
                        <ImageUploader
                            label="ছবি"
                            folder="nurses"
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                        />

                        {error && (
                            <p className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                                ⚠️ {error}
                            </p>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-2 pt-2">
                            <Link
                                href="/nurse/login"
                                className="flex-1 py-2.5 text-center border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                            >
                                ← Login
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:bg-teal-300"
                            >
                                {loading ? 'প্রসেস হচ্ছে...' : '✅ রেজিস্ট্রেশন করুন'}
                            </button>
                        </div>
                    </form>

                    {/* Info Box */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 text-center">
                            ℹ️ রেজিস্ট্রেশনের পর Admin approve করলে আপনি Login করতে পারবেন
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}