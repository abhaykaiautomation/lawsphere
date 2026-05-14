import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/common/providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: {
    default: 'LawSphere — AI-Powered Legal Marketplace',
    template: '%s | LawSphere',
  },
  description:
    'Connect with verified lawyers, get instant AI legal guidance, and resolve your legal matters with confidence.',
  keywords: ['lawyer', 'legal advice', 'legal consultation', 'law firm', 'AI legal assistant'],
  openGraph: {
    type: 'website',
    siteName: 'LawSphere',
    title: 'LawSphere — AI-Powered Legal Marketplace',
    description: 'Find the right lawyer with AI-powered matching.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
