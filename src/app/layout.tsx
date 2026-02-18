import type { Metadata } from 'next'
import { DM_Sans, Space_Mono } from 'next/font/google'
import './globals.css'
import Providers from './providers'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'TakeLeave.sg',
  description: 'Personal PTO tracker and forecast for Singapore workers',
}

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="en"
    className={`${dmSans.variable} ${spaceMono.variable}`}
    suppressHydrationWarning
  >
    <body className="bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
      <Providers>{children}</Providers>
    </body>
  </html>
)

export default RootLayout
