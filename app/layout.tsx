import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'EmailAction - 邮件待办自动同步',
  description: 'AI 识别邮件中的待办事项，一键同步到飞书 / Notion / Todoist',
  icons: {
    icon: '/logo/logo-icon.svg',
    shortcut: '/logo/logo-icon.svg',
    apple: '/logo/logo-icon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
