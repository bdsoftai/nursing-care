import type { Metadata } from 'next';
import { Noto_Sans_Bengali } from 'next/font/google';
import { CustomerProvider } from '@/context/CustomerContext';
import { AdminProvider } from '@/context/AdminContext';    // 👈 এই ২টা line যোগ
import './globals.css';

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'Nurse Helping Home',
  description: 'জরুরি প্রয়োজনে সরাসরি নার্স বেছে নিন',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bn" className={notoBengali.variable}>
      <body>
        <CustomerProvider>
          <AdminProvider>                 {/* 👈 যোগ */}
            {children}
          </AdminProvider>                {/* 👈 যোগ */}
        </CustomerProvider>
      </body>
    </html>
  );
}