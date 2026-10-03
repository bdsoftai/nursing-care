'use client';

import { useEffect, useState } from 'react';

export type SaveTarget = 'local' | 'database' | 'error';
export type SaveAction = 'customer' | 'booking' | 'login' | 'logout';

interface ToastData {
    id: string;
    target: SaveTarget;
    action: SaveAction;
    message?: string;
}

// ═══════════════════════════════════════════════════
// 🔑 Toast trigger functions (service layer থেকে call হবে)
// ═══════════════════════════════════════════════════

export function showSaveToast(
    target: SaveTarget,
    action: SaveAction,
    message?: string
) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent('save-toast', {
            detail: { target, action, message, id: Date.now().toString() },
        })
    );
}

export function notifyLocalSave(action: SaveAction, message?: string) {
    showSaveToast('local', action, message);
    console.log(`💾 [LOCAL] Saved: ${action}`);
}

export function notifyDatabaseSave(action: SaveAction, message?: string) {
    showSaveToast('database', action, message);
    console.log(`☁️ [DATABASE] Saved: ${action}`);
}

export function notifyError(action: SaveAction, message: string) {
    showSaveToast('error', action, message);
    console.error(`❌ [ERROR] ${action}: ${message}`);
}

// ═══════════════════════════════════════════════════
// 🎨 Toast Container Component
// ═══════════════════════════════════════════════════

export default function SaveToastContainer() {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    useEffect(() => {
        const handler = (e: Event) => {
            const custom = e as CustomEvent<ToastData>;
            const toast = custom.detail;

            setToasts((prev) => [...prev, toast]);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }, 3000);
        };

        window.addEventListener('save-toast', handler);
        return () => window.removeEventListener('save-toast', handler);
    }, []);

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    );
}

// ═══════════════════════════════════════════════════
// 🎨 Individual Toast Item
// ═══════════════════════════════════════════════════

function ToastItem({ toast }: { toast: ToastData }) {
    const config = {
        database: {
            icon: '☁️',
            bg: 'bg-green-600',
            label: 'Database-এ সেভ হয়েছে',
            action: {
                customer: 'কাস্টমার',
                booking: 'বুকিং',
                login: 'লগইন',
                logout: 'লগআউট',
            }[toast.action],
        },
        local: {
            icon: '💾',
            bg: 'bg-amber-600',
            label: 'Local-এ সেভ',
            action: {
                customer: 'কাস্টমার',
                booking: 'বুকিং',
                login: 'লগইন',
                logout: 'লগআউট',
            }[toast.action],
        },
        error: {
            icon: '❌',
            bg: 'bg-red-600',
            label: 'Error',
            action: toast.message ?? 'কিছু ভুল হয়েছে',
        },
    }[toast.target];

    return (
        <div
            className={`${config.bg} text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[240px] animate-slide-in`}
        >
            <span className="text-xl shrink-0">{config.icon}</span>
            <div className="min-w-0">
                <p className="text-xs font-bold">{config.label}</p>
                <p className="text-[11px] opacity-90">{config.action}</p>
            </div>
        </div>
    );
}