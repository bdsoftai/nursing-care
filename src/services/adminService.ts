import { Admin, AdminLoginInput } from '@/types';

const ADMIN_SESSION_KEY = 'nh_admin_session';
const ADMIN_DATA_KEY = 'nh_admin_data';

export function getAdminSession(): Admin | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(ADMIN_DATA_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as Admin;
    } catch {
        return null;
    }
}

export function saveAdminSession(admin: Admin) {
    if (typeof window === 'undefined') return;
    const safe = { ...admin };
    delete safe.passwordHash;
    localStorage.setItem(ADMIN_SESSION_KEY, admin.id);
    localStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(safe));
}

export function clearAdminSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem(ADMIN_DATA_KEY);
}

export async function adminLogin(input: AdminLoginInput) {
    try {
        const res = await fetch('/api/auth/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });
        const data = await res.json();
        if (!data.success || !data.admin) {
            return { success: false, message: data.message };
        }
        saveAdminSession(data.admin);
        return { success: true, admin: data.admin };
    } catch {
        return { success: false, message: 'নেটওয়ার্ক সমস্যা' };
    }
}

export function adminLogout() {
    clearAdminSession();
}