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
  title: "Data Governance Platform",
  description: "A comprehensive data governance application built with Next.js and shadcn/ui.",
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
