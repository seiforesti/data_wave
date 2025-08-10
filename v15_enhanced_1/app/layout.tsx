import type React from "react"
import { Inter } from "next/font/google"
import { cookies } from "next/headers"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { FixResizeObserver } from "@/components/fix-resize-observer"

import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: 'Enterprise Data Governance Platform',
  description: 'Advanced data governance platform with AI-powered insights and enterprise security',
  keywords: 'data governance, enterprise, AI, security, compliance, analytics',
  authors: [{ name: 'Data Governance Team' }],
  openGraph: {
    title: 'Enterprise Data Governance Platform',
    description: 'Advanced data governance platform with AI-powered insights',
    type: 'website'
  },
  generator: "v0.dev",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <FixResizeObserver />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
