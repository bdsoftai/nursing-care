import { Nurse, Booking } from '@/types';

const NURSE_SESSION_KEY = 'nh_nurse_session';
const NURSE_DATA_KEY = 'nh_nurse_data';

// ─── Session ───
export function getNurseSession(): Nurse | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(NURSE_DATA_KEY);
    if (!data) return null;
    try {
        return JSON.parse(data) as Nurse;
    } catch {
        return null;
    }
}

export function saveNurseSession(nurse: Nurse) {
    if (typeof window === 'undefined') return;
    const safe = { ...nurse };
    delete safe.passwordHash;
    localStorage.setItem(NURSE_SESSION_KEY, nurse.id);
    localStorage.setItem(NURSE_DATA_KEY, JSON.stringify(safe));
}

export function clearNurseSession() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(NURSE_SESSION_KEY);
    localStorage.removeItem(NURSE_DATA_KEY);
}

// ─── Login ───
export async function nurseLogin(email: string, password: string) {
    try {
        const res = await fetch('/api/auth/nurse', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.success || !data.nurse) {
            return { success: false, message: data.message };
        }
        saveNurseSession(data.nurse);
        return { success: true, nurse: data.nurse };
    } catch {
        return { success: false, message: 'নেটওয়ার্ক সমস্যা' };
    }
}

// ─── Logout ───
export function nurseLogout() {
    clearNurseSession();
}

// ─── Get my bookings ───
export async function fetchMyNurseBookings(): Promise<Booking[]> {
    const nurse = getNurseSession();
    if (!nurse) return [];

    try {
        const res = await fetch(`/api/nurse/bookings?nurseId=${nurse.id}`);
        const data = await res.json();
        return data.bookings ?? [];
    } catch {
        return [];
    }
}