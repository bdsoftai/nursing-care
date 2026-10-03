'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Nurse } from '@/types';
import AdminGuard from '@/components/AdminGuard';
import ImageUploader from '@/components/ImageUploader';
export default function AdminNursesPage() {
    return (
        <AdminGuard>
            <NursesContent />
        </AdminGuard>
    );
}

function NursesContent() {
    const [nurses, setNurses] = useState<Nurse[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
    const [search, setSearch] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingNurse, setEditingNurse] = useState<Nurse | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/nurses?filter=${filter}`);
            const data = await res.json();
            setNurses(data.nurses ?? []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, [filter]);

    const handleApprove = async (id: string) => {
        if (!confirm('এই নার্সকে অনুমোদন করবেন?')) return;

        try {
            const res = await fetch(`/api/admin/nurses/${id}/approve`, {
                method: 'POST',
            });
            const data = await res.json();

            if (data.success) {
                alert('✅ অনুমোদন সফল');
                load();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (err) {
            alert('❌ Network error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('এই নার্সকে delete করবেন? (soft delete)')) return;

        setDeletingId(id);
        try {
            const res = await fetch(`/api/admin/nurses/${id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (data.success) {
                alert('✅ Delete সফল');
                load();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Network error');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditClick = (nurse: Nurse) => {
        setEditingNurse(nurse);
        setShowModal(true);
    };

    const handleAddClick = () => {
        setEditingNurse(null);
        setShowModal(true);
    };

    const handleModalSuccess = () => {
        setShowModal(false);
        setEditingNurse(null);
        load();
    };

    const filtered = nurses.filter((n) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
            n.name?.toLowerCase().includes(s) ||
            n.phone?.includes(search) ||
            n.email?.toLowerCase().includes(s) ||
            n.nurseCode?.toLowerCase().includes(s)
        );
    });

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">🧑‍⚕️ নার্স ম্যানেজমেন্ট</h1>
                    <p className="text-sm text-gray-500">মোট: {nurses.length} জন</p>
                </div>
                <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                    ➕ নতুন নার্স
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                    type="text"
                    placeholder="🔍 নাম, ফোন, email খুঁজুন..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 border rounded-lg p-2.5 text-sm"
                />

                <div className="flex gap-2">
                    {(['all', 'pending', 'approved'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-xs rounded-lg font-medium whitespace-nowrap transition ${filter === f
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? 'সব' : f === 'pending' ? '⏳ অপেক্ষমাণ' : '✅ অনুমোদিত'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            {loading ? (
                <p className="text-center py-12 text-gray-500">লোড হচ্ছে...</p>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-4xl mb-2">📭</p>
                    <p className="text-sm text-gray-500">কোনো নার্স নেই</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map((nurse) => (
                        <div
                            key={nurse.id}
                            className="flex items-center gap-4 p-4 bg-white border rounded-xl hover:shadow-md transition"
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                                {nurse.name?.charAt(0)?.toUpperCase() ?? '?'}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold truncate">
                                    {nurse.name}
                                    <span className="ml-2 text-xs text-gray-400 font-normal">
                                        {nurse.nurseCode}
                                    </span>
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    📞 {nurse.phone} • ✉️ {nurse.email}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                    🏷️ {nurse.categoryCode ?? 'N/A'} • 📍 {nurse.area ?? 'N/A'}
                                </p>
                            </div>

                            {/* Status Badge */}
                            <span
                                className={`text-[10px] px-2 py-1 rounded-full font-semibold whitespace-nowrap ${nurse.isApproved
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-amber-100 text-amber-700'
                                    }`}
                            >
                                {nurse.isApproved ? '✅ Approved' : '⏳ Pending'}
                            </span>

                            {/* Actions */}
                            <div className="flex gap-1">
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
                                    onClick={() => handleEditClick(nurse)}
                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-600"
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(nurse.id)}
                                    disabled={deletingId === nurse.id}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-600 disabled:opacity-50"
                                    title="Delete"
                                >
                                    {deletingId === nurse.id ? '...' : '🗑️'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Add Modal */}
            {showModal && (
                <NurseModal
                    nurse={editingNurse}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleModalSuccess}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════
// Nurse Modal (Add + Edit)
// ═══════════════════════════════════════════
interface Category {
    code: string;
    name_bn: string;
}

interface Hospital {
    id: string;
    name: string;
}

function NurseModal({
    nurse,
    onClose,
    onSuccess,
}: {
    nurse: Nurse | null;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const isEdit = !!nurse;

    const [categories, setCategories] = useState<Category[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: nurse?.name ?? '',
        phone: nurse?.phone ?? '',
        email: nurse?.email ?? '',
        password: '',
        category_code: nurse?.categoryCode ?? '',
        hospital_id: nurse?.hospitalId ?? '',
        area: nurse?.area ?? '',
        address: nurse?.address ?? '',
        image_url: nurse?.imageUrl ?? '',
    });

    useEffect(() => {
        async function load() {
            const [catsRes, hospsRes] = await Promise.all([
                fetch('/api/categories'),
                fetch('/api/hospitals'),
            ]);
            const cats = await catsRes.json();
            const hosps = await hospsRes.json();
            setCategories(cats.categories ?? []);
            setHospitals(hosps.hospitals ?? []);
        }
        load();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const url = isEdit
                ? `/api/admin/nurses/${nurse!.id}`
                : '/api/admin/nurses';

            const method = isEdit ? 'PATCH' : 'POST';

            const payload: any = {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                category_code: formData.category_code,
                hospital_id: formData.hospital_id,
                area: formData.area,
                address: formData.address,
                image_url: formData.image_url,
            };

            if (!isEdit) {
                payload.password = formData.password || formData.name;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setLoading(false);

            if (data.success) {
                onSuccess();
            } else {
                setError(data.message);
            }
        } catch (err) {
            setLoading(false);
            setError('নেটওয়ার্ক সমস্যা');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white dark:bg-gray-900">
                    <h2 className="text-xl font-bold">
                        {isEdit ? '✏️ নার্স এডিট' : '➕ নতুন নার্স'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-2xl text-gray-400 hover:text-gray-600"
                    >
                        ×
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">নাম *</label>
                            <input
                                required
                                type="text"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">ফোন *</label>
                            <input
                                required
                                type="tel"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Email *</label>
                            <input
                                required
                                type="email"
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            />
                        </div>

                        {!isEdit && (
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Password
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="w-full border rounded-lg p-2.5"
                                    placeholder="খালি রাখলে নাম-ই password"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-1">ধরন *</label>
                            <select
                                required
                                value={formData.category_code}
                                onChange={(e) =>
                                    setFormData({ ...formData, category_code: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                {categories.map((c) => (
                                    <option key={c.code} value={c.code}>
                                        {c.name_bn}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">হাসপাতাল</label>
                            <select
                                value={formData.hospital_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, hospital_id: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                {hospitals.map((h) => (
                                    <option key={h.id} value={h.id}>
                                        {h.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">এলাকা *</label>
                            <select
                                required
                                value={formData.area}
                                onChange={(e) =>
                                    setFormData({ ...formData, area: e.target.value })
                                }
                                className="w-full border rounded-lg p-2.5"
                            >
                                <option value="">-- নির্বাচন করুন --</option>
                                <option value="Uttara">Uttara</option>
                                <option value="Mirpur">Mirpur</option>
                                <option value="Dhanmondi">Dhanmondi</option>
                            </select>
                        </div>

                        <ImageUploader
                            label="ছবি"
                            folder="nurses"
                            value={formData.image_url}
                            onChange={(url) => setFormData({ ...formData, image_url: url })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ঠিকানা</label>
                        <textarea
                            rows={2}
                            value={formData.address}
                            onChange={(e) =>
                                setFormData({ ...formData, address: e.target.value })
                            }
                            className="w-full border rounded-lg p-2.5 resize-none"
                        />
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 bg-red-50 p-3 rounded-lg">
                            ⚠️ {error}
                        </p>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 border rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                            বাতিল
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {loading ? 'সেভ হচ্ছে...' : isEdit ? '✅ আপডেট' : '✅ তৈরি করুন'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}