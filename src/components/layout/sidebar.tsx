"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BatteryCharging, UtensilsCrossed, Car, LayoutDashboard, PlusCircle, Settings } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/canteen", label: "Canteen", icon: UtensilsCrossed },
  { href: "/dashboard/poolcar", label: "Pool Cars", icon: Car },
]

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-slate-900 border-r border-slate-800 h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/20">
            <BatteryCharging className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">RBL</p>
            <p className="text-xs text-slate-500">Cost Center</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}

        {role === "ADMIN" && (
          <>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider px-3 py-2 pt-6">Admin</p>
            <Link
              href="/admin/canteen"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname.startsWith("/admin/canteen")
                  ? "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              Canteen Entry
            </Link>
            <Link
              href="/admin/poolcar"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname.startsWith("/admin/poolcar")
                  ? "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <PlusCircle className="h-4 w-4" />
              Pool Car Entry
            </Link>
            <Link
              href="/admin/poolcar/cars"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                pathname.startsWith("/admin/poolcar/cars")
                  ? "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              )}
            >
              <Settings className="h-4 w-4" />
              Manage Cars
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">Rahimafrooz Batteries Ltd</p>
      </div>
    </aside>
  )
}
