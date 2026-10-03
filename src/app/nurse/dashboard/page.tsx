'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNurse } from '@/context/NurseContext';
import { fetchMyNurseBookings, getNurseSession } from '@/services/nurseService';
import { Booking } from '@/types';
import NurseGuard from '@/components/NurseGuard';

export default function NurseDashboardPage() {
    return (
        <NurseGuard>
            <DashboardContent />
        </NurseGuard>
    );
}

function DashboardContent() {
    const { logout } = useNurse();
    const router = useRouter();
    const nurse = getNurseSession();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchMyNurseBookings();
                setBookings(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const handleLogout = () => {
        logout();
        router.push('/nurse/login');
    };

    const stats = {
        total: bookings.length,
        pending: bookings.filter((b) => b.status === 'pending').length,
        confirmed: bookings.filter((b) => b.status === 'confirmed').length,
        completed: bookings.filter((b) => b.status === 'completed').length,
    };

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🧑‍⚕️</span>
                        <div>
                            <h1 className="font-bold text-lg">Nurse Panel</h1>
                            <p className="text-xs text-gray-500">
                                {nurse?.name} • {nurse?.nurseCode}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Link
                            href="/nurse/profile"
                            className="text-xs px-3 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            👤 প্রোফাইল
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-xs px-3 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                        >
                            লগআউট
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto p-4">
                {/* Profile Card */}
                <div className="bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
                            {nurse?.name?.charAt(0) ?? '?'}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold">{nurse?.name}</h2>
                            <p className="text-sm opacity-90">{nurse?.categoryCode}</p>
                            <p className="text-xs opacity-75 mt-1">
                                📞 {nurse?.phone} • 📍 {nurse?.area}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-bold">⭐ {nurse?.rating}</p>
                            <p className="text-xs opacity-75">রেটিং</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <StatCard icon="📋" label="মোট" value={stats.total} color="blue" />
                    <StatCard icon="⏳" label="অপেক্ষমাণ" value={stats.pending} color="amber" />
                    <StatCard icon="✅" label="কনফার্মড" value={stats.confirmed} color="green" />
                    <StatCard icon="🏁" label="সম্পন্ন" value={stats.completed} color="purple" />
                </div>

                {/* Bookings */}
                <h2 className="text-lg font-bold mb-3">📋 আমার অ্যাসাইনমেন্ট</h2>

                {loading ? (
                    <p className="text-center py-12 text-gray-500">লোড হচ্ছে...</p>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl">
                        <p className="text-4xl mb-2">📭</p>
                        <p className="text-sm text-gray-500">এখনো কোনো অ্যাসাইনমেন্ট নেই</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {bookings.map((b) => (
                            <div
                                key={b.id}
                                className="bg-white rounded-xl p-4 border flex items-center gap-4"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">
                                        👤 {b.customerName}
                                        <span className="ml-2 text-xs text-gray-400 font-normal">
                                            {b.bookingCode}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📞 {b.customerPhone}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📍 {b.customerAddress}
                                    </p>
                                </div>
                                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                    {b.status}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: number;
    color: string;
}) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700',
        amber: 'bg-amber-50 text-amber-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
    };

    return (
        <div className={`rounded-xl p-4 ${colors[color]}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] uppercase font-semibold opacity-80">
                {label}
            </div>
        </div>
    );
}