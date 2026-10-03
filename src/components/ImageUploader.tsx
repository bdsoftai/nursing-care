'use client';

import { useRef, useState } from 'react';

interface Props {
    value: string;
    onChange: (url: string) => void;
    folder?: string;
    label?: string;
}

export default function ImageUploader({
    value,
    onChange,
    folder = 'nurses',
    label = 'ছবি',
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [preview, setPreview] = useState(value);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');
        setUploading(true);

        // Local preview
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            setUploading(false);

            if (data.success) {
                onChange(data.url);
                setPreview(data.url);
            } else {
                setError(data.message ?? 'আপলোড ব্যর্থ');
                setPreview(value);
            }
        } catch {
            setUploading(false);
            setError('নেটওয়ার্ক সমস্যা');
            setPreview(value);
        }
    };

    const handleRemove = () => {
        onChange('');
        setPreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <label className="block text-sm font-medium mb-1">{label}</label>

            <div className="flex items-start gap-3">
                {/* Preview */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center shrink-0">
                    {preview ? (
                        <>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                            {!uploading && (
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                                >
                                    ×
                                </button>
                            )}
                        </>
                    ) : (
                        <span className="text-3xl text-gray-400">📷</span>
                    )}

                    {uploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {uploading ? '⏳ আপলোড হচ্ছে...' : '📤 ছবি নির্বাচন করুন'}
                    </button>
                    <p className="text-[10px] text-gray-400 mt-2">
                        JPG, PNG, WebP • সর্বোচ্চ 5MB
                    </p>

                    {error && (
                        <p className="text-xs text-red-600 mt-2">⚠️ {error}</p>
                    )}
                </div>
            </div>
        </div>
    );
}