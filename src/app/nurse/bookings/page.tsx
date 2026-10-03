'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyNurseBookings } from '@/services/nurseService';
import { Booking } from '@/types';
import NurseGuard from '@/components/NurseGuard';

export default function NurseBookingsPage() {
    return (
        <NurseGuard>
            <BookingsContent />
        </NurseGuard>
    );
}

function BookingsContent() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

    useEffect(() => {
        async function load() {
            const data = await fetchMyNurseBookings();
            setBookings(data);
            setLoading(false);
        }
        load();
    }, []);

    const filtered = filter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href="/nurse/dashboard"
                        className="text-sm text-gray-500 hover:text-teal-600"
                    >
                        ← ড্যাশবোর্ড
                    </Link>
                    <h1 className="text-xl font-bold">📋 আমার বুকিং</h1>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto">
                    {(['all', 'pending', 'confirmed', 'completed'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition ${filter === f
                                    ? 'bg-teal-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f === 'all' ? 'সব' : f === 'pending' ? '⏳ অপেক্ষমাণ' : f === 'confirmed' ? '✅ কনফার্মড' : '🏁 সম্পন্ন'}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <p className="text-center py-12 text-gray-500">লোড হচ্ছে...</p>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="text-sm text-gray-500">কোনো বুকিং নেই</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((b) => (
                            <div key={b.id} className="bg-white rounded-xl p-4 border">
                                <p className="font-bold mb-1">👤 {b.customerName}</p>
                                <p className="text-xs text-gray-500">📞 {b.customerPhone}</p>
                                <p className="text-xs text-gray-500">📍 {b.customerAddress}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}