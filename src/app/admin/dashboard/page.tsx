'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { getAdminSession, adminLogout } from '@/services/adminService';
import AdminGuard from '@/components/AdminGuard';
import { Nurse, Hospital, Booking, Customer } from '@/types';
import ImageUploader from '@/components/ImageUploader';

type Section = 'overview' | 'nurses' | 'hospitals' | 'bookings' | 'customers';

export default function AdminDashboardPage() {
    return (
        <AdminGuard>
            <DashboardContent />
        </AdminGuard>
    );
}

function DashboardContent() {
    const router = useRouter();
    const admin = getAdminSession();

    const [section, setSection] = useState<Section>('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Data
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    // ── Load all data ──
    const loadAll = async () => {
        setLoading(true);
        try {
            const [nursesRes, hospitalsRes, bookingsRes, customersRes] =
                await Promise.all([
                    fetch('/api/admin/nurses?filter=all'),
                    fetch('/api/admin/hospitals'),        // 👈 'all=true' সরান
                    fetch('/api/admin/bookings'),
                    fetch('/api/admin/customers'),
                ]);

            const nursesData = await nursesRes.json();
            const hospitalsData = await hospitalsRes.json();
            const bookingsData = await bookingsRes.json();
            const customersData = await customersRes.json();

            setNurses(nursesData.nurses ?? []);
            setHospitals(hospitalsData.hospitals ?? []);
            setBookings(bookingsData.bookings ?? []);
            setCustomers(customersData.customers ?? []);
        } catch (err) {
            console.error('Load error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleLogout = () => {
        adminLogout();
        router.push('/admin/login');
    };

    // ── Stats ──
    const stats = {
        totalCustomers: customers.length,
        totalNurses: nurses.length,
        pendingNurses: nurses.filter((n) => !n.isApproved).length,
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b) => b.status === 'pending').length,
        totalHospitals: hospitals.filter((h) => h.isActive).length,
    };

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
            {/* ═══════════════ HEADER ═══════════════ */}
            <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm sticky top-0 z-40">
                <div className="px-4 py-3 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {/* Mobile menu */}
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            ☰
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-2xl">🔐</span>
                            <div>
                                <h1 className="font-bold text-base text-gray-900 dark:text-gray-100">
                                    Admin Panel
                                </h1>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {admin?.name} •{' '}
                                    {admin?.role === 'super_admin'
                                        ? 'সুপার অ্যাডমিন'
                                        : 'অপারেশনস'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 items-center">
                        <Link
                            href="/"
                            className="text-xs px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                        >
                            🏠 হোম
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="text-xs px-3 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                        >
                            লগআউট
                        </button>
                    </div>
                </div>
            </header>

            {/* ═══════════════ BODY ═══════════════ */}
            <div className="flex-1 flex">
                {/* ─── SIDEBAR ─── */}
                <aside
                    className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform pt-16 lg:pt-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                        }`}
                >
                    <nav className="p-3 space-y-1">
                        <SidebarLink
                            icon="📊"
                            label="ওভারভিউ"
                            active={section === 'overview'}
                            onClick={() => {
                                setSection('overview');
                                setSidebarOpen(false);
                            }}
                        />
                        <SidebarLink
                            icon="🧑‍⚕️"
                            label={`নার্স (${stats.totalNurses})`}
                            active={section === 'nurses'}
                            badge={stats.pendingNurses > 0 ? stats.pendingNurses : undefined}
                            onClick={() => {
                                setSection('nurses');
                                setSidebarOpen(false);
                            }}
                        />
                        <SidebarLink
                            icon="🏥"
                            label={`হাসপাতাল (${stats.totalHospitals})`}
                            active={section === 'hospitals'}
                            onClick={() => {
                                setSection('hospitals');
                                setSidebarOpen(false);
                            }}
                        />
                        <SidebarLink
                            icon="📋"
                            label={`বুকিং (${stats.totalBookings})`}
                            active={section === 'bookings'}
                            badge={
                                stats.pendingBookings > 0 ? stats.pendingBookings : undefined
                            }
                            onClick={() => {
                                setSection('bookings');
                                setSidebarOpen(false);
                            }}
                        />
                        <SidebarLink
                            icon="👥"
                            label={`কাস্টমার (${stats.totalCustomers})`}
                            active={section === 'customers'}
                            onClick={() => {
                                setSection('customers');
                                setSidebarOpen(false);
                            }}
                        />
                    </nav>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/50 z-20"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* ─── MAIN CONTENT ─── */}
                <section className="flex-1 p-4 lg:p-6 overflow-x-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <>
                            {section === 'overview' && (
                                <OverviewSection
                                    stats={stats}
                                    onNavigate={setSection}
                                />
                            )}
                            {section === 'nurses' && (
                                <NursesSection
                                    nurses={nurses}
                                    onRefresh={loadAll}
                                />
                            )}
                            {section === 'hospitals' && (
                                <HospitalsSection
                                    hospitals={hospitals}
                                    onRefresh={loadAll}
                                />
                            )}
                                {section === 'bookings' && (
                                    <BookingsSection bookings={bookings} onRefresh={loadAll} />
                                )}
                            {section === 'customers' && (
                                <CustomersSection customers={customers} />
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    );
}

// ═══════════════════════════════════════════
// SIDEBAR LINK
// ═══════════════════════════════════════════
function SidebarLink({
    icon,
    label,
    active,
    badge,
    onClick,
}: {
    icon: string;
    label: string;
    active: boolean;
    badge?: number;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${active
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
        >
            <span className="text-lg">{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {badge !== undefined && (
                <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${active ? 'bg-white/20' : 'bg-red-500 text-white'
                        }`}
                >
                    {badge}
                </span>
            )}
        </button>
    );
}

// ═══════════════════════════════════════════
// OVERVIEW SECTION
// ═══════════════════════════════════════════
function OverviewSection({
    stats,
    onNavigate,
}: {
    stats: {
        totalCustomers: number;
        totalNurses: number;
        pendingNurses: number;
        totalBookings: number;
        pendingBookings: number;
        totalHospitals: number;
    };
    onNavigate: (s: any) => void;
}) {
    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                📊 ওভারভিউ
            </h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                <StatCard
                    icon="👥"
                    label="কাস্টমার"
                    value={stats.totalCustomers}
                    color="blue"
                    onClick={() => onNavigate('customers')}
                />
                <StatCard
                    icon="🧑‍⚕️"
                    label="নার্স"
                    value={stats.totalNurses}
                    color="teal"
                    onClick={() => onNavigate('nurses')}
                />
                <StatCard
                    icon="⏳"
                    label="Pending Nurses"
                    value={stats.pendingNurses}
                    color="amber"
                    onClick={() => onNavigate('nurses')}
                />
                <StatCard
                    icon="📋"
                    label="বুকিং"
                    value={stats.totalBookings}
                    color="purple"
                    onClick={() => onNavigate('bookings')}
                />
                <StatCard
                    icon="⏰"
                    label="Pending Bookings"
                    value={stats.pendingBookings}
                    color="orange"
                    onClick={() => onNavigate('bookings')}
                />
                <StatCard
                    icon="🏥"
                    label="হাসপাতাল"
                    value={stats.totalHospitals}
                    color="green"
                    onClick={() => onNavigate('hospitals')}
                />
            </div>

            {/* Quick Info */}
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 rounded-xl p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Sidebar</strong> থেকে যেকোনো section-এ যান
                </p>
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
    onClick,
}: {
    icon: string;
    label: string;
    value: number;
    color: string;
    onClick?: () => void;
}) {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
        teal: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300',
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
        purple:
            'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
        orange:
            'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300',
        green: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300',
    };

    return (
        <button
            onClick={onClick}
            className={`rounded-xl p-3 ${colors[color]} text-left hover:scale-105 transition-transform`}
        >
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-[10px] uppercase font-semibold opacity-80">
                {label}
            </div>
        </button>
    );
}

// ═══════════════════════════════════════════
// NURSES SECTION
// ═══════════════════════════════════════════
function NursesSection({
    nurses,
    onRefresh,
}: {
    nurses: Nurse[];
    onRefresh: () => void;
}) {
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [search, setSearch] = useState('');

    const filtered = nurses.filter((n) => {
        const statusOk =
            filter === 'all' ||
            (filter === 'pending' && !n.isApproved) ||
            (filter === 'approved' && n.isApproved);

        const searchOk =
            !search ||
            n.name?.toLowerCase().includes(search.toLowerCase()) ||
            n.phone?.includes(search) ||
            n.email?.toLowerCase().includes(search.toLowerCase());

        return statusOk && searchOk;
    });

    const handleApprove = async (id: string) => {
        if (!confirm('এই নার্সকে অনুমোদন করবেন?')) return;

        const res = await fetch(`/api/admin/nurses/${id}/approve`, {
            method: 'POST',
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ অনুমোদন সফল');
            onRefresh();
        } else {
            alert('❌ ' + data.message);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('নার্স delete করবেন?')) return;

        const res = await fetch(`/api/admin/nurses/${id}`, {
            method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ Delete সফল');
            onRefresh();
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                🧑‍⚕️ নার্স ম্যানেজমেন্ট
            </h2>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="🔍 নাম, ফোন, email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border rounded-lg p-2.5 text-sm"
                />
                <div className="flex gap-2">
                    {(['all', 'pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                        >
                            {f === 'all' ? 'সব' : f === 'pending' ? '⏳ অপেক্ষমাণ' : '✅ অনুমোদিত'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">কোনো নার্স নেই</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((nurse) => (
                        <div
                            key={nurse.id}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border rounded-xl"
                        >
                            {/* Image */}
                            {nurse.imageUrl ? (
                                <img
                                    src={nurse.imageUrl}
                                    alt={nurse.name}
                                    className="w-12 h-12 rounded-full object-cover shrink-0"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                                    {nurse.name?.charAt(0)}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                    {nurse.name}
                                    <span className="ml-2 text-[10px] text-gray-400 font-normal">
                                        {nurse.nurseCode}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📞 {nurse.phone} • ✉️ {nurse.email}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    🏷️ {nurse.categoryCode ?? 'N/A'} • 📍{' '}
                                    {nurse.area ?? 'N/A'}
                                </p>
                            </div>

                            {/* Status */}
                            <span
                                className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${nurse.isApproved
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                            >
                                {nurse.isApproved ? '✅ Approved' : '⏳ Pending'}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-1 shrink-0">
                                {!nurse.isApproved && (
                                    <button
                                        onClick={() => handleApprove(nurse.id)}
                                        className="p-2 hover:bg-green-50 rounded-lg text-green-600"
                                        title="Approve"
                                    >
                                        ✅
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(nurse.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600"
                                    title="Delete"
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

// ═══════════════════════════════════════════
// HOSPITALS SECTION
// ═══════════════════════════════════════════
function HospitalsSection({
    hospitals,
    onRefresh,
}: {
    hospitals: Hospital[];
    onRefresh: () => void;
}) {
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`"${name}" delete করবেন?`)) return;

        const res = await fetch(`/api/admin/hospitals/${id}`, {
            method: 'DELETE',
        });
        const data = await res.json();

        if (data.success) {
            alert('✅ Delete সফল');
            onRefresh();
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    🏥 হাসপাতাল ম্যানেজমেন্ট
                </h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                    ➕ নতুন
                </button>
            </div>

            {hospitals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-4xl mb-2">🏥</p>
                    <p className="text-sm text-gray-500">কোনো হাসপাতাল নেই</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {hospitals.map((h) => (
                        <div
                            key={h.id}
                            className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border rounded-xl ${!h.isActive ? 'opacity-60' : ''
                                }`}
                        >
                            <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">{h.name}</p>
                                <p className="text-xs text-gray-500">
                                    📍 {h.location ?? 'N/A'} • 📞 {h.phone ?? 'N/A'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(h.id, h.name)}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 shrink-0"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <HospitalModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        setShowModal(false);
                        onRefresh();
                    }}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// BOOKINGS SECTION
// ═══════════════════════════════════════════
function BookingsSection({
    bookings,
    onRefresh,
}: {
    bookings: Booking[];
    onRefresh: () => void;
}) {
    const [filter, setFilter] = useState<
        'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
    >('all');
    const [updating, setUpdating] = useState<string | null>(null);

    const filtered =
        filter === 'all'
            ? bookings
            : bookings.filter((b) => b.status === filter);

    // ═══════════════════════════════════════════
    // UPDATE STATUS
    // ═══════════════════════════════════════════
    const handleStatusChange = async (id: string, newStatus: string) => {
        setUpdating(id);

        try {
            const res = await fetch(`/api/admin/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();

            if (data.success) {
                console.log(`✅ Booking ${id} → ${newStatus}`);
                onRefresh();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Network error');
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                📋 সকল বুকিং
                <span className="ml-2 text-sm font-normal text-gray-500">
                    ({bookings.length})
                </span>
            </h2>

            {/* Filter Tabs */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                {(
                    ['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const
                ).map((f) => {
                    const count =
                        f === 'all'
                            ? bookings.length
                            : bookings.filter((b) => b.status === f).length;

                    return (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition ${filter === f
                                    ? 'bg-blue-600 text-white shadow'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all'
                                ? '📋 সব'
                                : f === 'pending'
                                    ? '⏳ অপেক্ষমাণ'
                                    : f === 'confirmed'
                                        ? '✅ কনফার্মড'
                                        : f === 'completed'
                                            ? '🏁 সম্পন্ন'
                                            : '❌ বাতিল'}{' '}
                            ({count})
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">
                        {filter === 'all'
                            ? 'কোনো বুকিং নেই'
                            : `কোনো ${filter} বুকিং নেই`}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((b) => (
                        <div
                            key={b.id}
                            className="p-3 bg-white dark:bg-gray-900 border rounded-xl"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">
                                        👤 {b.customerName}
                                        <span className="ml-2 text-[10px] text-gray-400 font-normal">
                                            {b.bookingCode}
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        📞 {b.customerPhone} • 🧑‍⚕️ {b.nurseName}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        📍 {b.customerAddress}
                                    </p>
                                </div>
                                <span className="text-sm font-bold shrink-0">৳ {b.price}</span>
                            </div>

                            {/* Status Update Buttons */}
                            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <p className="text-[10px] text-gray-400 w-full mb-1">
                                    🎯 Status পরিবর্তন করুন:
                                </p>

                                <StatusButton
                                    label="⏳ অপেক্ষমাণ"
                                    active={b.status === 'pending'}
                                    loading={updating === b.id}
                                    color="amber"
                                    onClick={() => handleStatusChange(b.id, 'pending')}
                                />
                                <StatusButton
                                    label="✅ কনফার্মড"
                                    active={b.status === 'confirmed'}
                                    loading={updating === b.id}
                                    color="green"
                                    onClick={() => handleStatusChange(b.id, 'confirmed')}
                                />
                                <StatusButton
                                    label="🏁 সম্পন্ন"
                                    active={b.status === 'completed'}
                                    loading={updating === b.id}
                                    color="blue"
                                    onClick={() => handleStatusChange(b.id, 'completed')}
                                />
                                <StatusButton
                                    label="❌ বাতিল"
                                    active={b.status === 'cancelled'}
                                    loading={updating === b.id}
                                    color="red"
                                    onClick={() => handleStatusChange(b.id, 'cancelled')}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// STATUS BUTTON
// ═══════════════════════════════════════════
function StatusButton({
    label,
    active,
    loading,
    color,
    onClick,
}: {
    label: string;
    active: boolean;
    loading: boolean;
    color: 'amber' | 'green' | 'blue' | 'red';
    onClick: () => void;
}) {
    const colors = {
        amber: {
            active: 'bg-amber-600 text-white',
            inactive:
                'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 hover:bg-amber-100',
        },
        green: {
            active: 'bg-green-600 text-white',
            inactive:
                'bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 hover:bg-green-100',
        },
        blue: {
            active: 'bg-blue-600 text-white',
            inactive:
                'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 hover:bg-blue-100',
        },
        red: {
            active: 'bg-red-600 text-white',
            inactive:
                'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 hover:bg-red-100',
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={loading || active}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-60 ${active ? colors[color].active : colors[color].inactive
                }`}
        >
            {loading ? '...' : label}
        </button>
    );
}

// ═══════════════════════════════════════════
// CUSTOMERS SECTION
// ═══════════════════════════════════════════
function CustomersSection({ customers }: { customers: Customer[] }) {
    const [search, setSearch] = useState('');

    const filtered = customers.filter(
        (c) =>
            !search ||
            c.name?.toLowerCase().includes(search.toLowerCase()) ||
            c.phone?.includes(search) ||
            c.customerCode?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                👥 কাস্টমার ম্যানেজমেন্ট
            </h2>

            <input
                type="text"
                placeholder="🔍 নাম, ফোন, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm mb-4"
            />

            {filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">কোনো কাস্টমার নেই</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((c) => (
                        <div
                            key={c.id}
                            className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 border rounded-xl"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                                {c.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm truncate">
                                    {c.name}
                                    <span className="ml-2 text-[10px] text-gray-400 font-normal">
                                        {c.customerCode}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📞 {c.phone} • 📍 {c.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// HOSPITAL MODAL
// ═══════════════════════════════════════════
function HospitalModal({
    onClose,
    onSuccess,
}: {
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: '',
        nameEn: '',
        location: '',
        address: '',
        phone: '',
        email: '',
        website: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
                onSuccess();
            } else {
                setError(data.message);
            }
        } catch {
            setLoading(false);
            setError('নেটওয়ার্ক সমস্যা');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b">
                    <h3 className="font-bold text-lg">➕ নতুন হাসপাতাল</h3>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            নাম (বাংলা) *
                        </label>
                        <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full border rounded-lg p-2.5 text-sm"
                            placeholder="স্কয়ার হাসপাতাল"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            নাম (English)
                        </label>
                        <input
                            type="text"
                            value={formData.nameEn}
                            onChange={(e) =>
                                setFormData({ ...formData, nameEn: e.target.value })
                            }
                            className="w-full border rounded-lg p-2.5 text-sm"
                            placeholder="Square Hospital"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">লোকেশন</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={(e) =>
                                setFormData({ ...formData, location: e.target.value })
                            }
                            className="w-full border rounded-lg p-2.5 text-sm"
                            placeholder="Dhanmondi"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ফোন</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            className="w-full border rounded-lg p-2.5 text-sm"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                            ⚠️ {error}
                        </p>
                    )}

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border rounded-lg text-sm"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:bg-blue-300"
                        >
                            {loading ? 'সেভ হচ্ছে...' : '✅ সেভ করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}