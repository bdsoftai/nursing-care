'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdmin } from '@/context/AdminContext';
import { getAdminSession } from '@/services/adminService';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { admin: contextAdmin, loading } = useAdmin();
    const [localAdmin, setLocalAdmin] = useState<ReturnType<typeof getAdminSession>>(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const stored = getAdminSession();
        console.log('🛡️ AdminGuard — stored:', stored?.id ?? 'null');
        setLocalAdmin(stored);
        setChecking(false);
    }, [contextAdmin]);

    const admin = contextAdmin ?? localAdmin;

    useEffect(() => {
        if (!loading && !checking && !admin) {
            console.log('🚫 No admin — redirecting to login');
            router.replace('/admin/login');
        }
    }, [admin, loading, checking, router]);

    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <p className="text-sm text-gray-400">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (!admin) return null;

    return <>{children}</>;
}