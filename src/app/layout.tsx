import type { Metadata } from 'next'
import { Inter_Tight, JetBrains_Mono, Instrument_Serif } from 'next/font/google'
import { Navbar } from '@/components/layout/Navbar'
import './globals.css'

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ui',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Developer Portal',
  description: 'On-device inference playground and model diff view',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${interTight.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}>
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  )
}
