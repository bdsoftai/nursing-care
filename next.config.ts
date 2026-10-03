import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // ─── Supabase Storage (nurse images) ───
      {
        protocol: 'https',
        hostname: 'zwcfqjnngejtbfefvpzl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      // ─── Fallback avatar ───
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;