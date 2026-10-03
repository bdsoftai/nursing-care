'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminGuard from '@/components/AdminGuard';
import { Hospital } from '@/types';

export default function NewNursePage() {
    return (
        <AdminGuard>
            <NewNurseContent />
        </AdminGuard>
    );
}

interface Category {
    code: string;
    name_bn: string;
}

function NewNurseContent() {
    const router = useRouter();

    const [categories, setCategories] = useState<Category[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        category_code: '',
        hospital_id: '',
        area: '',
        address: '',
        image_url: '',
    });

    // Load categories + hospitals
    useEffect(() => {
        async function load() {
            const [catsRes, hospsRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/hospitals'),
            ]);
            const cats = await catsRes.json();
            const hosps = await hospsRes.json();
            setCategories(cats.categories ?? []);
            setHospitals(hosps.hospitals ?? []);
        }
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/nurses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            setLoading(false);

            if (data.success) {
                alert(`✅ নার্স তৈরি হয়েছে\nCode: ${data.nurse.nurseCode}`);
                router.push('/admin/nurses');
            } else {
                setError(data.message);
            }
        } catch (err) {
            setLoading(false);
            setError('নেটওয়ার্ক সমস্যা');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/nurses" className="text-gray-500 hover:text-blue-600">
                    ← ফিরুন
                </Link>
                <h1 className="text-2xl font-bold">➕ নতুন নার্স</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow">
                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-1">নাম *</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="যেমন: মোছাঃ রেহানা পারভীন"
                    />
                </div>

                {/* Phone */}
                <div>
                    <label className="block text-sm font-medium mb-1">ফোন *</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="017XXXXXXXX"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="nurse@example.com"
                    />
                </div>

                {/* Password */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Password *
                    </label>
                    <input
                        required
                        type="text"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="কমপক্ষে ৬ অক্ষর"
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                        নার্স এই password দিয়ে login করবে
                    </p>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-1">ধরন *</label>
                    <select
                        required
                        value={formData.category_code}
                        onChange={(e) => setFormData({ ...formData, category_code: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
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
                    <label className="block text-sm font-medium mb-1">হাসপাতাল</label>
                    <select
                        value={formData.hospital_id}
                        onChange={(e) => setFormData({ ...formData, hospital_id: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
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
                    <label className="block text-sm font-medium mb-1">এলাকা *</label>
                    <select
                        required
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                    >
                        <option value="">-- নির্বাচন করুন --</option>
                        <option value="Uttara">Uttara</option>
                        <option value="Mirpur">Mirpur</option>
                        <option value="Dhanmondi">Dhanmondi</option>
                    </select>
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium mb-1">ঠিকানা</label>
                    <textarea
                        rows={2}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full border rounded-lg p-2.5 resize-none"
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium mb-1">ছবি URL</label>
                    <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full border rounded-lg p-2.5"
                        placeholder="https://..."
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">⚠️ {error}</p>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                    <Link
                        href="/admin/nurses"
                        className="flex-1 py-2.5 text-center border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        বাতিল
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'সেভ হচ্ছে...' : '✅ তৈরি করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
}