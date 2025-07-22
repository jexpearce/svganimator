import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Motif - The Tailwind of Motion',
  description: 'Convert SVGs and natural language into production-ready animation code',
  keywords: ['svg', 'animation', 'motion', 'web animations', 'react', 'vue'],
  authors: [{ name: 'Motif Team' }],
  openGraph: {
    title: 'Motif - The Tailwind of Motion',
    description: 'Convert SVGs and natural language into production-ready animation code',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
} 