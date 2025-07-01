import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'XANGDIGITAL.ASIA',
  description: 'Xangdigital Music Platform',
  generator: 'v0.dev',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
