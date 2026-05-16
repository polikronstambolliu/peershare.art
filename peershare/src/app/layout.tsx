import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'

export const metadata: Metadata = {
  title: 'PeerShare — Filmmaker Community',
  description: 'Share gear, find crew, help each other make films.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  )
}
