import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Evan Flow - Jazz / Funk / Hip Hop',
  description: 'Official website of Evan Flow - Jazz, Funk, and Hip Hop artist. Find all my music and social media links here.',
  keywords: 'Evan Flow, Jazz, Funk, Hip Hop, Music, Artist',
  authors: [{ name: 'Evan Flow' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
