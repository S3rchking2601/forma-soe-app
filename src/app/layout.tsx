import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Forma by SOE Consulting',
  description: 'Find your people — SOE Consulting Recruitment Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
