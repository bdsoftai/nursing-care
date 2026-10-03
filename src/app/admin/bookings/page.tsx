'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Booking } from '@/types';

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                console.log('🔄 Loading bookings...');
                const res = await fetch('/api/admin/bookings');
                console.log('📥 Response status:', res.status);

                if (!res.ok) throw new Error(`HTTP ${res.status}`);

                const data = await res.json();
                console.log('✅ Data received:', data);

                setBookings(data.bookings ?? []);
            } catch (err) {
                console.error('❌ Load error:', err);
                setError('লোড ব্যর্থ');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = filter === 'all'
        ? bookings
        : bookings.filter((b) => b.status === filter);

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        confirmed: 'bg-green-100 text-green-700',
        completed: 'bg-blue-100 text-blue-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    const counts = {
        all: bookings.length,
        pending: bookings.filter(b => b.status === 'pending').length,
        confirmed: bookings.filter(b => b.status === 'confirmed').length,
        completed: bookings.filter(b => b.status === 'completed').length,
        cancelled: bookings.filter(b => b.status === 'cancelled').length,
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">📋 সকল বুকিং</h1>
                    <p className="text-sm text-gray-500">মোট: {bookings.length}</p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="text-sm text-gray-500 hover:text-blue-600"
                >
                    ← ড্যাশবোর্ড
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition ${filter === f
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {f === 'all' ? '📋 সব' :
                            f === 'pending' ? '⏳ অপেক্ষমাণ' :
                                f === 'confirmed' ? '✅ কনফার্মড' :
                                    f === 'completed' ? '🏁 সম্পন্ন' :
                                        '❌ বাতিল'} ({counts[f]})
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <p className="text-center py-12 text-gray-500">লোড হচ্ছে...</p>
            ) : error ? (
                <p className="text-center py-12 text-red-500">⚠️ {error}</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">
                        {filter === 'all' ? 'কোনো বুকিং নেই' : `কোনো ${filter} বুকিং নেই`}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((b) => (
                        <div
                            key={b.id}
                            className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition"
                        >
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">
                                    👤 {b.customerName}
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                        {b.bookingCode}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📞 {b.customerPhone}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    🧑‍⚕️ {b.nurseName} • 📞 {b.nursePhone}
                                </p>
                                <p className="text-xs text-gray-400 truncate">
                                    📍 {b.customerAddress}
                                </p>
                            </div>

                            {/* Status + Price + Date */}
                            <div className="text-right shrink-0 space-y-1">
                                <span
                                    className={`inline-block text-[10px] px-2 py-1 rounded-full font-semibold ${statusColors[b.status as keyof typeof statusColors] ?? 'bg-gray-100'
                                        }`}
                                >
                                    {b.status}
                                </span>
                                <p className="text-sm font-bold">৳ {b.price}</p>
                                <p className="text-[10px] text-gray-400">
                                    {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}