'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/context/CustomerContext';
import { getCurrentCustomer } from '@/services/customerService';

export default function CustomerGuard({ children }: { children: React.ReactNode }) {
    const { customer: contextCustomer, loading, refresh } = useCustomer();
    const [localCustomer, setLocalCustomer] = useState<ReturnType<typeof getCurrentCustomer>>(null);
    const [checking, setChecking] = useState(true);
    const router = useRouter();

    // ═══════════════════════════════════════════════
    // STEP 1: Check localStorage FIRST (before any redirect)
    // ═══════════════════════════════════════════════
    useEffect(() => {
        const checkStorage = () => {
            // 🔑 Always re-read from localStorage
            const stored = getCurrentCustomer();

            console.log('🛡️ CustomerGuard — stored:', stored?.id ?? 'null', 'context:', contextCustomer?.id ?? 'null');

            if (stored) {
                setLocalCustomer(stored);

                // Sync context
                if (!contextCustomer || contextCustomer.id !== stored.id) {
                    console.log('🔄 Syncing context with localStorage');
                    refresh();
                }
            } else if (contextCustomer) {
                // Context has data but storage doesn't
                setLocalCustomer(contextCustomer);
            }
        };

        checkStorage();

        // Small delay to ensure storage is written
        const timer = setTimeout(() => {
            checkStorage();
            setChecking(false);
        }, 50);

        return () => clearTimeout(timer);
    }, [contextCustomer, refresh]);

    // Customer to use
    const customer = contextCustomer ?? localCustomer;

    // ═══════════════════════════════════════════════
    // STEP 2: Redirect ONLY if really no customer
    // ═══════════════════════════════════════════════
    useEffect(() => {
        // Wait for all checks to complete
        if (loading || checking) return;

        // Only redirect if BOTH context and local are empty
        if (!customer) {
            console.log('🚫 No customer found — redirecting to /login');
            router.replace('/login?redirect=/dashboard');
        }
    }, [customer, loading, checking, router]);

    // ═══════════════════════════════════════════════
    // STEP 3: Loading screen
    // ═══════════════════════════════════════════════
    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
                <p className="text-sm text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
            </div>
        );
    }

    if (!customer) return null;

    return <>{children}</>;
}