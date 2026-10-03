'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';

export default function AdminDashboardPage() {
    const { admin, logout, loading } = useAdmin();
    const router = useRouter();

    // ✅ useEffect-এ redirect
    useEffect(() => {
        if (!loading && !admin) {
            console.log('🚫 No admin — redirecting to login');
            router.replace('/admin/login');
        }
    }, [admin, loading, router]);

    const handleLogout = () => {
        logout();
        router.push('/admin/login');
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
            </div>
        );
    }

    // No admin — return null (useEffect redirect করবে)
    if (!admin) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            <header className="max-w-7xl mx-auto flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">🔐 Admin Dashboard</h1>
                    <p className="text-sm text-gray-500">
                        {admin.name} • {admin.role}
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50"
                >
                    লগআউট
                </button>
            </header>

            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href="/admin/nurses"
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                    <div className="text-3xl mb-2">🧑‍⚕️</div>
                    <h3 className="font-bold">নার্স ম্যানেজমেন্ট</h3>
                    <p className="text-xs text-gray-500 mt-1">নতুন যোগ, অনুমোদন, এডিট</p>
                </Link>

                <Link
                    href="/admin/hospitals"
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                    <div className="text-3xl mb-2">🏥</div>
                    <h3 className="font-bold">হাসপাতাল</h3>
                    <p className="text-xs text-gray-500 mt-1">হাসপাতাল ম্যানেজমেন্ট</p>
                </Link>

                <Link
                    href="/admin/bookings"
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                    <div className="text-3xl mb-2">📋</div>
                    <h3 className="font-bold">বুকিং</h3>
                    <p className="text-xs text-gray-500 mt-1">সব বুকিং</p>
                </Link>

                <Link
                    href="/admin/customers"
                    className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
                >
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="font-bold">কাস্টমার</h3>
                    <p className="text-xs text-gray-500 mt-1">সব কাস্টমার</p>
                </Link>
            </div>
        </main>
    );
}