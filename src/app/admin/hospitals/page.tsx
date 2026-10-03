'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Hospital } from '@/types';

export default function AdminHospitalsPage() {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInactive, setShowInactive] = useState(false);
    const [search, setSearch] = useState('');

    const load = async () => {
        setLoading(true);
        const res = await fetch(`/api/admin/hospitals?all=${showInactive}`);
        const data = await res.json();
        setHospitals(data.hospitals ?? []);
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, [showInactive]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" ডিলিট করবেন? (Soft delete — data থাকবে)`)) return;

        const res = await fetch(`/api/admin/hospitals/${id}`, {
            method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ ডিলিট হয়েছে');
            load();
        } else {
            alert('❌ ' + data.message);
        }
    };

    const handleToggle = async (id: string, isActive: boolean) => {
        const res = await fetch(`/api/admin/hospitals/${id}/toggle`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: !isActive }),
        });
        const data = await res.json();

        if (data.success) {
            load();
        }
    };

    const filtered = hospitals.filter((h) =>
        h.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">🏥 হাসপাতাল ম্যানেজমেন্ট</h1>
                    <p className="text-sm text-gray-500">
                        মোট: {hospitals.length} হাসপাতাল
                    </p>
                </div>
                <Link
                    href="/admin/hospitals/new"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    ➕ নতুন হাসপাতাল
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="🔍 নাম দিয়ে খুঁজুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border rounded-lg p-2.5 text-sm"
                />

                <label className="flex items-center gap-2 text-sm px-3 py-2 border rounded-lg cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showInactive}
                        onChange={(e) => setShowInactive(e.target.checked)}
                    />
                    নিষ্ক্রিয় দেখান
                </label>
            </div>

            {/* List */}
            {loading ? (
                <p className="text-center py-12 text-gray-500">লোড হচ্ছে...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-4xl mb-2">🏥</p>
                    <p className="text-sm text-gray-500">কোনো হাসপাতাল নেই</p>
                    <Link
                        href="/admin/hospitals/new"
                        className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
                    >
                        প্রথম হাসপাতাল যোগ করুন
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((hospital) => (
                        <div
                            key={hospital.id}
                            className={`flex items-center gap-4 p-4 border rounded-xl ${hospital.isActive ? 'bg-white' : 'bg-gray-100 opacity-60'
                                }`}
                        >
                            {/* Status indicator */}
                            <div className="flex items-center">
                                <div
                                    className={`w-2 h-2 rounded-full ${hospital.isActive ? 'bg-green-500' : 'bg-gray-400'
                                        }`}
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-800 truncate">
                                    {hospital.name}
                                    {hospital.nameEn && (
                                        <span className="text-sm font-normal text-gray-500 ml-2">
                                            ({hospital.nameEn})
                                        </span>
                                    )}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                                    {hospital.location && <span>📍 {hospital.location}</span>}
                                    {hospital.phone && <span>📞 {hospital.phone}</span>}
                                    {hospital.email && <span>✉️ {hospital.email}</span>}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleToggle(hospital.id, hospital.isActive)}
                                    className="p-2 text-sm hover:bg-gray-100 rounded-lg"
                                    title={hospital.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                >
                                    {hospital.isActive ? '🚫' : '✅'}
                                </button>

                                <Link
                                    href={`/admin/hospitals/${hospital.id}/edit`}
                                    className="p-2 text-sm hover:bg-gray-100 rounded-lg"
                                    title="এডিট"
                                >
                                    ✏️
                                </Link>

                                <button
                                    onClick={() => handleDelete(hospital.id, hospital.name)}
                                    className="p-2 text-sm hover:bg-red-50 rounded-lg text-red-500"
                                    title="ডিলিট"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}