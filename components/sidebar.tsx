"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, Users, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Sessions", href: "/sessions", icon: Calendar },
  { name: "Students", href: "/students", icon: Users },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-primary-foreground">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-primary-foreground/10 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-foreground/10">
          <GraduationCap className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold">Presentifi</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-foreground/10 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/5 hover:text-primary-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-primary-foreground/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/10 text-sm font-semibold">
            N
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">Rahul Dev Singh</p>
            <p className="text-xs text-primary-foreground/70">instructor@school.edu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
