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
        <footer style={{
          borderTop: '1px solid #2E2A26',
          background: '#111009',
          padding: '20px 24px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: '13px',
            color: '#4A453E',
            marginBottom: '10px',
          }}>
            PeerShare.art is free and community-run. No investors, no ads.
          </p>
          <a
            href="https://ko-fi.com/peershare"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'monospace',
              fontSize: '9px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#C24B1E',
              textDecoration: 'none',
              border: '1px solid #C24B1E',
              padding: '6px 14px',
              borderRadius: '2px',
            }}
          >
            ▶ Support the Node
          </a>
        </footer>
      </body>
    </html>
  )
}
