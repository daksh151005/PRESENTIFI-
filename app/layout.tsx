import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Sidebar } from "@/components/sidebar"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Suspense } from "react"
import "./globals.css"

export const metadata: Metadata = {
  title: "Presentifi - Attendance Monitoring System",
  description: "Smart attendance monitoring and analytics for colleges",
  generator: "v0.app",
}

export const viewport = "width=device-width, initial-scale=1"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Header */}
              <header className="flex h-16 items-center justify-end border-b bg-card px-6">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
              </header>
              {/* Main Content */}
              <main className="flex-1 overflow-y-auto bg-background p-6">{children}</main>
            </div>
          </div>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
