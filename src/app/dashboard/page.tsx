'use client';

import { useMemo, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/context/CustomerContext';
import { fetchMyBookings } from '@/services/bookingService';   // 👈 fetchMyBookings
import { Booking } from '@/types';
import CustomerGuard from '@/components/CustomerGuard';
import ThemeToggle from '@/components/ThemeToggle';

export default function DashboardPage() {
    return (
        <CustomerGuard>
            <DashboardContent />
        </CustomerGuard>
    );
}

function DashboardContent() {
    const { customer, logout } = useCustomer();
    const router = useRouter();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Load bookings from API ──
    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                const data = await fetchMyBookings();
                if (mounted) setBookings(data);
            } catch (err) {
                console.error('Failed to load bookings:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    const stats = useMemo(
        () => ({
            total: bookings.length,
            pending: bookings.filter((b) => b.status === 'pending').length,
            confirmed: bookings.filter((b) => b.status === 'confirmed').length,
            completed: bookings.filter((b) => b.status === 'completed').length,
        }),
        [bookings]
    );

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <main className="max-w-5xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <Link
                    href="/"
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                    ← হোম
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="text-xs px-3 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950 transition"
                    >
                        লগআউট
                    </button>
                </div>
            </header>

            {/* Profile */}
            <div className="bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-800 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                        {customer?.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-lg font-bold">{customer?.name}</h1>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            📞 {customer?.phone}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            📍 {customer?.address}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard label="মোট সার্ভিস" value={stats.total} color="blue" icon="📋" />
                <StatCard label="অপেক্ষমাণ" value={stats.pending} color="amber" icon="⏳" />
                <StatCard label="কনফার্মড" value={stats.confirmed} color="green" icon="✅" />
                <StatCard label="সম্পন্ন" value={stats.completed} color="purple" icon="🏁" />
            </div>

            {/* Bookings */}
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                🩺 আমার সার্ভিসসমূহ
            </h2>

            {loading ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <p className="text-sm text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        এখনো কোনো বুকিং নেই
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        নার্স খুঁজুন
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map((booking) => (
                        <Link
                            key={booking.id}
                            href={`/booking/${booking.id}`}
                            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition"
                        >
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                                <Image
                                    src={booking.nurseImage}
                                    alt={booking.nurseName}
                                    fill
                                    sizes="64px"
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{booking.nurseName}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    🆔 {booking.id}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    📅 {new Date(booking.createdAt).toLocaleDateString('bn-BD')}
                                </p>
                            </div>
                            <StatusBadge status={booking.status} />
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}

// ─────────────────────────────────────────────
// Stat Card
// ─────────────────────────────────────────────
function StatCard({
    label,
    value,
    color,
    icon,
}: {
    label: string;
    value: number;
    color: 'blue' | 'amber' | 'green' | 'purple';
    icon: string;
}) {
    const colorClass = {
        blue: 'text-blue-600 dark:text-blue-400',
        amber: 'text-amber-600 dark:text-amber-400',
        green: 'text-green-600 dark:text-green-400',
        purple: 'text-purple-600 dark:text-purple-400',
    }[color];

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
            <p className="text-lg mb-1">{icon}</p>
            <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
            <p className="text-[10px] uppercase font-semibold text-gray-500 dark:text-gray-400">
                {label}
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; className: string }> = {
        pending: {
            label: '⏳ অপেক্ষমাণ',
            className:
                'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        },
        confirmed: {
            label: '✅ কনফার্মড',
            className:
                'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        },
        completed: {
            label: '🏁 সম্পন্ন',
            className:
                'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        },
        cancelled: {
            label: '❌ বাতিল',
            className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        },
    };

    const info = map[status] ?? map.pending;
    return (
        <span
            className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${info.className}`}
        >
            {info.label}
        </span>
    );
}