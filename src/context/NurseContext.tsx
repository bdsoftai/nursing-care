'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Nurse } from '@/types';
import {
    nurseLogin as svcLogin,
    nurseLogout as svcLogout,
    getNurseSession,
} from '@/services/nurseService';

interface NurseContextValue {
    nurse: Nurse | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
}

const NurseContext = createContext<NurseContextValue | null>(null);

export function NurseProvider({ children }: { children: ReactNode }) {
    const [nurse, setNurse] = useState<Nurse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setNurse(getNurseSession());
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const res = await svcLogin(email, password);
        if (res.success && res.nurse) {
            setNurse(res.nurse);
            return { success: true };
        }
        return { success: false, message: res.message };
    };

    const logout = () => {
        svcLogout();
        setNurse(null);
    };

    return (
        <NurseContext.Provider value={{ nurse, loading, login, logout }}>
            {children}
        </NurseContext.Provider>
    );
}

export function useNurse() {
    const ctx = useContext(NurseContext);
    if (!ctx) throw new Error('useNurse must be used inside NurseProvider');
    return ctx;
}