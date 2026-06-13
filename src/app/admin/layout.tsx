import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import Sidebar from "@/components/layout/sidebar"
import Topbar from "@/components/layout/topbar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/login")
  if (session.role !== "ADMIN") redirect("/dashboard")

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar role={session.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar username={session.username} role={session.role} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
