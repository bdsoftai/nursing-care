'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewHospitalPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        location: '',
        address: '',
        phone: '',
        email: '',
        website: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/hospitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                router.push('/admin/hospitals');
            } else {
                setError(data.message ?? 'ব্যর্থ হয়েছে');
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
                <Link href="/admin/hospitals" className="text-gray-500">
                    ← ফিরুন
                </Link>
                <h1 className="text-2xl font-bold">➕ নতুন হাসপাতাল</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name (Bengali) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        নাম (বাংলা) *
                    </label>
                    <input
                        required
                        type="text"
                        className="w-full border rounded-lg p-2.5"
                        placeholder="স্কয়ার হাসপাতাল"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>

                {/* Name (English) */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        নাম (English)
                    </label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5"
                        placeholder="Square Hospital"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    />
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-medium mb-1">লোকেশন</label>
                    <input
                        type="text"
                        className="w-full border rounded-lg p-2.5"
                        placeholder="Dhanmondi"
                        value={formData.location}
                        onChange={(e) =>
                            setFormData({ ...formData, location: e.target.value })
                        }
                    />
                </div>

                {/* Address */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        সম্পূর্ণ ঠিকানা
                    </label>
                    <textarea
                        rows={2}
                        className="w-full border rounded-lg p-2.5 resize-none"
                        value={formData.address}
                        onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                        }
                    />
                </div>

                {/* Phone + Email */}
                <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">ফোন</label>
                        <input
                            type="tel"
                            className="w-full border rounded-lg p-2.5"
                            placeholder="+880-2-xxxx-xxxx"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-lg p-2.5"
                            placeholder="info@hospital.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />
                    </div>
                </div>

                {/* Website */}
                <div>
                    <label className="block text-sm font-medium mb-1">ওয়েবসাইট</label>
                    <input
                        type="url"
                        className="w-full border rounded-lg p-2.5"
                        placeholder="https://hospital.com"
                        value={formData.website}
                        onChange={(e) =>
                            setFormData({ ...formData, website: e.target.value })
                        }
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                        ⚠️ {error}
                    </p>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                    <Link
                        href="/admin/hospitals"
                        className="flex-1 py-2.5 text-center border rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        বাতিল
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {loading ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
                    </button>
                </div>
            </form>
        </div>
    );
}