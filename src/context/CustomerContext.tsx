'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from 'react';
import { Customer, CustomerLoginInput } from '@/types';
import {
    loginOrRegister,
    getCurrentCustomer,
    logout as svcLogout,
} from '@/services/customerService';

interface CustomerContextValue {
    customer: Customer | null;
    loading: boolean;
    login: (input: CustomerLoginInput) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    refresh: () => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: ReactNode }) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState(true);

    // ── Load session on mount + listen to updates ──
    useEffect(() => {
        const load = () => {
            const stored = getCurrentCustomer();
            console.log('🔄 CustomerContext — loading:', stored?.id ?? 'null');
            setCustomer(stored);
        };

        load();
        setLoading(false);

        // Listen for same-tab updates
        const handleUpdate = () => {
            console.log('📢 customer-updated event received');
            load();
        };

        window.addEventListener('customer-updated', handleUpdate);
        window.addEventListener('storage', load);   // cross-tab

        return () => {
            window.removeEventListener('customer-updated', handleUpdate);
            window.removeEventListener('storage', load);
        };
    }, []);

    const login = async (input: CustomerLoginInput) => {
        console.log('🎬 Context.login called');
        const res = await loginOrRegister(input);

        if (res.success && res.customer) {
            setCustomer(res.customer);
            window.dispatchEvent(new Event('customer-updated'));
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        svcLogout();
        setCustomer(null);
    };

    const refresh = () => {
        const stored = getCurrentCustomer();
        console.log('🔄 Context.refresh:', stored?.id ?? 'null');
        setCustomer(stored);
    };

    return (
        <CustomerContext.Provider value={{ customer, loading, login, logout, refresh }}>
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const ctx = useContext(CustomerContext);
    if (!ctx) throw new Error('useCustomer must be used inside CustomerProvider');
    return ctx;
}