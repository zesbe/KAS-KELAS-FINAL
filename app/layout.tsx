import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ToastProvider from '@/components/providers/ToastProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KasKelas - Sistem Manajemen Kas Kelas Modern',
  description: 'Platform otomatis untuk mengelola kas kelas dengan fitur WhatsApp, pembayaran digital, dan laporan transparan',
  keywords: 'kas kelas, pembayaran digital, manajemen keuangan sekolah, WhatsApp otomatis, bendahara kelas',
  authors: [{ name: 'KasKelas Team' }],
  creator: 'KasKelas',
  publisher: 'KasKelas',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'KasKelas - Sistem Manajemen Kas Kelas Modern',
    description: 'Platform otomatis untuk mengelola kas kelas dengan fitur WhatsApp, pembayaran digital, dan laporan transparan',
    url: 'https://berbagiakun.com',
    siteName: 'KasKelas',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'KasKelas - Sistem Manajemen Kas Kelas Modern',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'KasKelas - Sistem Manajemen Kas Kelas Modern',
    description: 'Platform otomatis untuk mengelola kas kelas dengan fitur WhatsApp, pembayaran digital, dan laporan transparan',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <AuthProvider>
          <div id="root" className="min-h-screen flex flex-col">
            {children}
          </div>
          <div id="modal-root"></div>
          <ToastProvider />
        </AuthProvider>
      </body>
    </html>
  )
}