'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useNurse } from '@/context/NurseContext';
import { usePathname } from 'next/navigation';

export default function NurseMenu() {
    const { nurse } = useNurse();
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    // Don't show on nurse pages (already there)
    if (pathname?.startsWith('/nurse')) return null;

    return (
        <div
            className="relative"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            {/* Trigger Button */}
            <button
                className={`text-xs px-3 py-2 rounded-lg font-medium transition flex items-center gap-1 ${nurse
                        ? 'bg-teal-600 text-white hover:bg-teal-700 shadow'
                        : 'border border-teal-600 text-teal-600 dark:text-teal-400 dark:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950'
                    }`}
            >
                🧑‍⚕️ {nurse ? nurse.name.split(' ')[0] : 'নার্স'}
                <span className="text-[10px]">▼</span>
            </button>

            {/* Dropdown */}
            {open && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50">
                    {nurse ? (
                        <>
                            {/* Logged In Menu */}
                            <div className="px-3 py-2 bg-teal-50 dark:bg-teal-950 border-b border-teal-100 dark:border-teal-900">
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                                    লগইন করা আছে
                                </p>
                                <p className="text-xs font-bold text-teal-800 dark:text-teal-200 truncate">
                                    {nurse.name}
                                </p>
                            </div>

                            <Link
                                href="/nurse/dashboard"
                                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                📊 ড্যাশবোর্ড
                            </Link>
                            <Link
                                href="/nurse/profile"
                                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                👤 প্রোফাইল
                            </Link>
                            <Link
                                href="/nurse/bookings"
                                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                📋 আমার বুকিং
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Not Logged In Menu */}
                            <div className="px-3 py-2 bg-teal-50 dark:bg-teal-950 border-b border-teal-100 dark:border-teal-900">
                                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">
                                    নার্স প্যানেল
                                </p>
                            </div>

                            <Link
                                href="/nurse/login"
                                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                🔓 লগইন করুন
                            </Link>
                            <Link
                                href="/nurse/register"
                                className="flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                            >
                                📝 রেজিস্ট্রেশন করুন
                            </Link>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}