import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'StatsMonit - Real-time System Monitoring Dashboard',
  description: 'Real-time system monitoring dashboard with CPU, RAM, disk usage tracking',
}

export const viewport: Viewport = {
  themeColor: '#1e2235',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>"
        />
      </head>
      <body className="min-h-screen font-sans">
        {children}
      </body>
    </html>
  )
}
