import './globals.css'
import type { Metadata } from 'next'
import Header from '@/src/components/Header'
import Footer from '@/src/components/Footer'

export const metadata: Metadata = {
  title: 'Chiado Construtora',
  description: 'Construção e incorporação com padrão premium.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  )
}
