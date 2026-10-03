'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Nurse {
    id: string;
    nurse_code: string;
    name: string;
    phone: string;
    email: string;
    category_code: string;
    hospital_name?: string;
    area: string;
    is_approved: boolean;
    created_at: string;
}

export default function AdminNursesPage() {
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await fetch(`/api/admin/nurses?filter=${filter}`);
            const data = await res.json();
            setNurses(data.nurses ?? []);
            setLoading(false);
        }
        load();
    }, [filter]);

    const handleApprove = async (id: string) => {
        const res = await fetch(`/api/admin/nurses/${id}/approve`, {
            method: 'POST',
        });
        const data = await res.json();
        if (data.success) {
            setNurses(nurses.filter((n) => n.id !== id));
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between mb-6">
                <h1 className="text-2xl font-bold">নার্স ম্যানেজমেন্ট</h1>
                <Link href="/admin/nurses/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                    ➕ নতুন নার্স
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4">
                {(['pending', 'approved', 'all'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100'
                            }`}
                    >
                        {f === 'pending' ? '⏳ অপেক্ষমাণ' : f === 'approved' ? '✅ অনুমোদিত' : 'সকল'}
                    </button>
                ))}
            </div>

            {loading ? (
                <p>লোড হচ্ছে...</p>
            ) : nurses.length === 0 ? (
                <p className="text-center py-12 text-gray-400">কোনো নার্স নেই</p>
            ) : (
                <div className="space-y-3">
                    {nurses.map((nurse) => (
                        <div
                            key={nurse.id}
                            className="flex items-center gap-4 p-4 border rounded-xl"
                        >
                            <div className="flex-1">
                                <p className="font-bold">{nurse.name}</p>
                                <p className="text-xs text-gray-500">
                                    {nurse.nurse_code} • {nurse.phone}
                                </p>
                                <p className="text-xs text-gray-500">
                                    🏷️ {nurse.category_code} • 🏥 {nurse.hospital_name ?? 'N/A'}
                                </p>
                            </div>

                            {!nurse.is_approved ? (
                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/nurses/${nurse.id}/edit`}
                                        className="px-3 py-1.5 border rounded-lg text-sm"
                                    >
                                        ✏️ এডিট
                                    </Link>
                                    <button
                                        onClick={() => handleApprove(nurse.id)}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm"
                                    >
                                        ✅ Approve
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href={`/admin/nurses/${nurse.id}/edit`}
                                    className="px-3 py-1.5 border rounded-lg text-sm"
                                >
                                    ✏️ এডিট
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}