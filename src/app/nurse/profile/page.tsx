'use client';

import Link from 'next/link';
import { getNurseSession } from '@/services/nurseService';
import NurseGuard from '@/components/NurseGuard';

export default function NurseProfilePage() {
    return (
        <NurseGuard>
            <ProfileContent />
        </NurseGuard>
    );
}

function ProfileContent() {
    const nurse = getNurseSession();

    if (!nurse) return null;

    return (
        <main className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <Link
                        href="/nurse/dashboard"
                        className="text-sm text-gray-500 hover:text-teal-600"
                    >
                        ← ড্যাশবোর্ড
                    </Link>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow">
                    <h1 className="text-2xl font-bold mb-6">👤 আমার প্রোফাইল</h1>

                    <div className="space-y-4">
                        <InfoRow label="নাম" value={nurse.name} />
                        <InfoRow label="নার্স কোড" value={nurse.nurseCode} />
                        <InfoRow label="ফোন" value={nurse.phone} />
                        <InfoRow label="Email" value={nurse.email} />
                        <InfoRow label="ধরন" value={nurse.categoryCode ?? 'N/A'} />
                        <InfoRow label="এলাকা" value={nurse.area ?? 'N/A'} />
                        <InfoRow label="ঠিকানা" value={nurse.address ?? 'N/A'} />
                        <InfoRow label="রেটিং" value={`⭐ ${nurse.rating}`} />
                        <InfoRow
                            label="অনুমোদন"
                            value={nurse.isApproved ? '✅ অনুমোদিত' : '⏳ অপেক্ষমাণ'}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-900">{value}</span>
        </div>
    );
}