import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import './globals.css'

const ppNeueMontreal = localFont({
  src: [
    { path: '../fonts/PPNeueMontreal-Book.otf', weight: '400', style: 'normal' },
    { path: '../fonts/PPNeueMontreal-Italic.otf', weight: '400', style: 'italic' },
    { path: '../fonts/PPNeueMontreal-Medium.otf', weight: '500', style: 'normal' },
    { path: '../fonts/PPNeueMontreal-Bold.otf', weight: '700', style: 'normal' },
    { path: '../fonts/PPNeueMontreal-Thin.otf', weight: '100', style: 'normal' },
    { path: '../fonts/PPNeueMontreal-SemiBolditalic.otf', weight: '600', style: 'italic' },
  ],
  variable: '--font-pp-neue-montreal',
  display: 'swap',
})

const ppSupplySans = localFont({
  src: [
    { path: '../fonts/PPSupplySans-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/PPSupplySans-Ultralight.otf', weight: '200', style: 'normal' },
  ],
  variable: '--font-pp-supply-sans',
  display: 'swap',
})

const ppSupplyMono = localFont({
  src: [
    { path: '../fonts/PPSupplyMono-Regular.otf', weight: '400', style: 'normal' },
    { path: '../fonts/PPSupplyMono-Ultralight.otf', weight: '200', style: 'normal' },
  ],
  variable: '--font-pp-supply-mono',
  display: 'swap',
})

// Note: To use custom fonts, add the font files to web/fonts/ directory
// See web/fonts/README.md for instructions

export const metadata: Metadata = {
  title: 'PolkaAds - Advertiser Dashboard',
  description: 'Decentralized advertisement platform on Polkadot',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${ppNeueMontreal.variable} ${ppSupplySans.variable} ${ppSupplyMono.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
