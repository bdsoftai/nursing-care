'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchBookingById } from '@/services/bookingService';   // 👈 fetch, not get
import { Booking } from '@/types';
import { StatusBadge } from '@/app/dashboard/page';
import CustomerGuard from '@/components/CustomerGuard';
import ThemeToggle from '@/components/ThemeToggle';

export default function BookingDetailsPage() {
    return (
        <CustomerGuard>
            <BookingContent />
        </CustomerGuard>
    );
}

function BookingContent() {
    const params = useParams();
    const router = useRouter();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        async function load() {
            const data = await fetchBookingById(String(params.id));
            if (mounted) {
                setBooking(data);
                setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, [params.id]);

    if (loading) {
        return (
            <main className="max-w-3xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950">
                <p className="text-center py-20 text-sm text-gray-500">লোড হচ্ছে...</p>
            </main>
        );
    }

    if (!booking) {
        return (
            <main className="max-w-3xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <div className="text-center py-20">
                    <p className="text-5xl mb-3">🔍</p>
                    <h1 className="text-xl font-bold mb-2">বুকিং পাওয়া যায়নি</h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                        অথবা এটি আপনার নয়
                    </p>
                    <Link
                        href="/dashboard"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        ← ড্যাশবোর্ডে ফিরে যান
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-3xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
            <header className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600"
                >
                    ← ফিরে যান
                </button>
                <ThemeToggle />
            </header>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 mb-4">
                <div className="flex items-start gap-4 mb-6">
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                        <Image
                            src={booking.nurseImage}
                            alt={booking.nurseName}
                            fill
                            sizes="80px"
                            className="object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold mb-1">{booking.nurseName}</h1>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            🆔 {booking.id}
                        </p>
                        <StatusBadge status={booking.status} />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                    <InfoBox icon="📞" label="নার্স ফোন" value={booking.nursePhone} />
                    <InfoBox
                        icon="📅"
                        label="বুকিং তারিখ"
                        value={new Date(booking.createdAt).toLocaleString('bn-BD')}
                    />
                    <InfoBox icon="👤" label="রোগীর নাম" value={booking.customerName} />
                    <InfoBox icon="📱" label="রোগীর ফোন" value={booking.customerPhone} />
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4">
                    <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1">
                        📍 সেবার ঠিকানা
                    </p>
                    <p className="text-sm">{booking.customerAddress}</p>
                </div>
            </div>

            <a
                href={`https://wa.me/88${booking.nursePhone}?text=${encodeURIComponent(
                    `Hello ${booking.nurseName}, regarding booking ${booking.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 text-center bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
            >
                💬 নার্সের সাথে যোগাযোগ করুন
            </a>

            <p className="text-[10px] text-center text-gray-400 mt-4">
                ℹ️ বুকিং বাতিল বা ডিলিট করার সুবিধা নেই। সহায়তার জন্য আমাদের সাথে যোগাযোগ করুন।
            </p>
        </main>
    );
}

function InfoBox({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: string;
}) {
    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase mb-0.5">
                {icon} {label}
            </p>
            <p className="text-sm font-medium truncate">{value}</p>
        </div>
    );
}