'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { STATIC_NURSES } from '@/data/nurses';
import { Nurse } from '@/types';
import QuickBookingModal from '@/components/QuickBookingModal';
import ThemeToggle from '@/components/ThemeToggle';

export default function NurseDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [selectedNurse, setSelectedNurse] = useState<Nurse | null>(null);

    // Static data থেকে nurse খুঁজুন
    const staticNurse = STATIC_NURSES.find((n) => n.id === params.id);

    // StaticNurse → Nurse type-এ convert
    const nurse: Nurse | null = staticNurse
        ? {
            id: staticNurse.id,
            nurseCode: staticNurse.id,
            name: staticNurse.name,
            phone: staticNurse.phone,
            email: '',
            categoryCode: staticNurse.category,
            hospitalId: staticNurse.hospitalName,
            area: staticNurse.area,
            address: staticNurse.address,
            rating: staticNurse.rating,
            imageUrl: staticNurse.image,
            isApproved: true,
            isAvailable: staticNurse.isAvailable,
            isActive: true,
            createdAt: new Date().toISOString(),
        }
        : null;

    // ── Not found ──
    if (!nurse) {
        return (
            <main className="max-w-4xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
                <div className="text-center py-20">
                    <p className="text-6xl mb-4">🔍</p>
                    <h1 className="text-2xl font-bold mb-2">নার্স খুঁজে পাওয়া যায়নি</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        আইডি:{' '}
                        <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {String(params.id)}
                        </code>
                    </p>
                    <Link
                        href="/"
                        className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                    >
                        ← হোম পেজে ফিরে যান
                    </Link>
                </div>
            </main>
        );
    }

    const whatsappLink = `https://wa.me/88${nurse.phone}?text=${encodeURIComponent(
        `Hello ${nurse.name}, I got your profile from Nurse Helping Home.`
    )}`;

    return (
        <main className="max-w-5xl mx-auto p-4 min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
            {/* Header */}
            <header className="flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                    ← ফিরে যান
                </button>
                <ThemeToggle />
            </header>

            {/* Hero Card */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm mb-6">
                <div className="grid md:grid-cols-3 gap-0">
                    {/* Left: Image */}
                    <div className="relative w-full aspect-square md:aspect-auto md:min-h-[320px] bg-gray-100 dark:bg-gray-800">
                        <Image
                            src={
                                nurse.imageUrl ||
                                `https://i.pravatar.cc/150?u=${nurse.id}`
                            }
                            alt={nurse.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            preload
                        />
                        <span
                            className={`absolute top-4 left-4 text-xs px-3 py-1 rounded-full font-semibold shadow ${nurse.isAvailable
                                    ? 'bg-green-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}
                        >
                            {nurse.isAvailable ? '● Available' : '● Busy'}
                        </span>
                    </div>

                    {/* Right: Info */}
                    <div className="md:col-span-2 p-6 md:p-8 flex flex-col justify-between">
                        <div>
                            {/* Name + Rating */}
                            <div className="flex justify-between items-start gap-3 mb-3">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                                    {nurse.name}
                                </h1>
                                <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm px-3 py-1 rounded-lg font-semibold whitespace-nowrap">
                                    ⭐ {nurse.rating}
                                </span>
                            </div>

                            {/* Info Grid */}
                            <div className="grid sm:grid-cols-2 gap-3 mb-6">
                                <InfoRow
                                    icon="🏷️"
                                    label="ধরন"
                                    value={nurse.categoryCode ?? 'N/A'}
                                    accent="purple"
                                />
                                <InfoRow
                                    icon="🏥"
                                    label="হাসপাতাল"
                                    value={nurse.hospitalId ?? 'ফ্রিল্যান্স নার্স'}
                                    accent="teal"
                                />
                                <InfoRow
                                    icon="📍"
                                    label="এলাকা"
                                    value={nurse.area ?? 'N/A'}
                                    accent="blue"
                                />
                                <InfoRow
                                    icon="📞"
                                    label="ফোন"
                                    value={nurse.phone}
                                    accent="green"
                                />
                            </div>

                            {/* Address */}
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                                    📌 সম্পূর্ণ ঠিকানা
                                </p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {nurse.address}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <a
                                href={whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 py-3 text-center border-2 border-green-600 text-green-700 dark:text-green-400 dark:border-green-500 rounded-xl font-semibold hover:bg-green-50 dark:hover:bg-green-950 transition flex items-center justify-center gap-2"
                            >
                                💬 হোয়াটসঅ্যাপে নক করুন
                            </a>
                            <button
                                onClick={() => setSelectedNurse(nurse)}
                                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                            >
                                📋 বুক করুন
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Sections */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* About */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        ℹ️ পরিচিতি
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {nurse.name} একজন {categoryLabel(nurse.categoryCode)} নার্স হিসেবে
                        কর্মরত আছেন।{' '}
                        {nurse.hospitalId
                            ? `${nurse.hospitalId}-এ তার দীর্ঘ অভিজ্ঞতা রয়েছে। `
                            : 'তিনি স্বাধীনভাবে রোগী সেবা প্রদান করেন। '}
                        রোগীর যত্ন, ঔষধ ব্যবস্থাপনা এবং জরুরি সেবায় তিনি দক্ষ। বর্তমানে{' '}
                        <span
                            className={
                                nurse.isAvailable
                                    ? 'text-green-600 dark:text-green-400 font-semibold'
                                    : 'text-red-600 dark:text-red-400 font-semibold'
                            }
                        >
                            {nurse.isAvailable ? 'সেবা প্রদানে উপলব্ধ' : 'ব্যস্ত রয়েছেন'}
                        </span>
                        ।
                    </p>
                </div>

                {/* Services */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
                    <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        🩺 সেবাসমূহ
                    </h2>
                    <ul className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-center gap-2">✅ ইনজেকশন</li>
                        <li className="flex items-center gap-2">✅ ড্রেসিং</li>
                        <li className="flex items-center gap-2">✅ BP মাপা</li>
                        <li className="flex items-center gap-2">✅ স্যালাইন</li>
                        <li className="flex items-center gap-2">✅ ঔষধ সেবন</li>
                        <li className="flex items-center gap-2">✅ রাতের সেবা</li>
                    </ul>
                </div>
            </div>

            {/* Modal */}
            <QuickBookingModal
                nurse={selectedNurse}
                onClose={() => setSelectedNurse(null)}
            />
        </main>
    );
}

// ─────────────────────────────────────────────
// Info Row
// ─────────────────────────────────────────────
function InfoRow({
    icon,
    label,
    value,
    accent,
}: {
    icon: string;
    label: string;
    value: string;
    accent: 'purple' | 'teal' | 'blue' | 'green';
}) {
    const accentClass = {
        purple: 'text-purple-600 dark:text-purple-400',
        teal: 'text-teal-600 dark:text-teal-400',
        blue: 'text-blue-600 dark:text-blue-400',
        green: 'text-green-600 dark:text-green-400',
    }[accent];

    return (
        <div className="flex items-start gap-2">
            <span className="text-lg shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[10px] uppercase font-semibold text-gray-400 dark:text-gray-500">
                    {label}
                </p>
                <p className={`text-sm font-medium ${accentClass} truncate`}>{value}</p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Category label
// ─────────────────────────────────────────────
function categoryLabel(cat?: string) {
    switch (cat) {
        case 'Hospital-Affiliated':
            return 'হাসপাতাল-সংযুক্ত';
        case 'Hospital-Exclusive':
            return 'হাসপাতাল-এক্সক্লুসিভ';
        case 'Independent':
            return 'স্বাধীন';
        default:
            return cat ?? 'নার্স';
    }
}