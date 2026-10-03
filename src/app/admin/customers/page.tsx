'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Customer } from '@/types';

export default function AdminCustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        async function load() {
            try {
                console.log('🔄 Loading customers...');
                const res = await fetch('/api/admin/customers');
                console.log('📥 Response status:', res.status);

                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                console.log('✅ Data received:', data);

                setCustomers(data.customers ?? []);
            } catch (err) {
                console.error('❌ Load error:', err);
                setError('লোড ব্যর্থ');
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const filtered = customers.filter(
        (c) =>
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search) ||
            c.customerCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">👥 কাস্টমার ম্যানেজমেন্ট</h1>
                    <p className="text-sm text-gray-500">
                        মোট: {customers.length} জন
                    </p>
                </div>
                <Link
                    href="/admin/dashboard"
                    className="text-sm text-gray-500 hover:text-blue-600"
                >
                    ← ড্যাশবোর্ড
                </Link>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="🔍 নাম, ফোন বা ID দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg p-3 text-sm mb-4"
            />

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">
                    <p>লোড হচ্ছে...</p>
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">
                    <p>⚠️ {error}</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">
                        {search ? 'কোনো মিল নেই' : 'কোনো কাস্টমার নেই'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                                {c.name?.charAt(0).toUpperCase() ?? '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">
                                    {c.name}
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                        {c.customerCode}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📞 {c.phone}
                                    {c.email && ` • ✉️ ${c.email}`}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📍 {c.address}
                                </p>
                            </div>

                            {/* Date */}
                            <div className="text-right shrink-0">
                                <p className="text-xs text-gray-400">
                                    {new Date(c.createdAt).toLocaleDateString('bn-BD')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}