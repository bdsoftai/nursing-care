'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNurse } from '@/context/NurseContext';
import { getNurseSession } from '@/services/nurseService';

export default function NurseGuard({ children }: { children: React.ReactNode }) {
    const { nurse: contextNurse, loading } = useNurse();
    const [localNurse, setLocalNurse] = useState<ReturnType<typeof getNurseSession>>(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = getNurseSession();
        console.log('🛡️ NurseGuard — stored:', stored?.id ?? 'null');
        setLocalNurse(stored);
        setChecking(false);
    }, [contextNurse]);

    const nurse = contextNurse ?? localNurse;

    useEffect(() => {
        if (!loading && !checking && !nurse) {
            console.log('🚫 No nurse — redirecting to login');
            router.replace('/nurse/login');
        }
    }, [nurse, loading, checking, router]);

    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-sm text-gray-500">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (!nurse) return null;

    // ⚠️ isApproved check
    if (!nurse.isApproved) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md text-center bg-white rounded-2xl p-8 shadow-lg">
                    <div className="text-5xl mb-3">⏳</div>
                    <h1 className="text-xl font-bold mb-2">অনুমোদনের অপেক্ষায়</h1>
                    <p className="text-sm text-gray-500 mb-4">
                        আপনার প্রোফাইল এখনো Admin-এর অনুমোদনের জন্য অপেক্ষা করছে।
                        অনুমোদনের পরে আপনি লগইন করতে পারবেন।
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('nh_nurse_session');
                            localStorage.removeItem('nh_nurse_data');
                            router.push('/nurse/login');
                        }}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm"
                    >
                        লগআউট
                    </button>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}