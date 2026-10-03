'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Admin } from '@/types';
import {
    adminLogin as svcLogin,
    adminLogout as svcLogout,
    getAdminSession,
} from '@/services/adminService';

interface AdminContextValue {
    admin: Admin | null;
    loading: boolean;
    login: (
        email: string,
        password: string,
        adminCode: string
    ) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setAdmin(getAdminSession());
        setLoading(false);
    }, []);

    const login = async (email: string, password: string, adminCode: string) => {
        const res = await svcLogin(email, password, adminCode);
        if (res.success && res.admin) {
            setAdmin(res.admin);
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        svcLogout();
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const ctx = useContext(AdminContext);
    if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
    return ctx;
}