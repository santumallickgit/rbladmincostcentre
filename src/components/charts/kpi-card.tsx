import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type KpiCardProps = {
  title: string
  value: string
  subtitle?: string
  trend?: "up" | "down"
  icon?: React.ReactNode
  color?: "blue" | "green" | "red" | "amber"
}

export default function KpiCard({ title, value, subtitle, trend, icon, color = "blue" }: KpiCardProps) {
  const colors = {
    blue: "from-blue-600/10 to-blue-600/5 border-blue-500/20",
    green: "from-green-600/10 to-green-600/5 border-green-500/20",
    red: "from-red-600/10 to-red-600/5 border-red-500/20",
    amber: "from-amber-600/10 to-amber-600/5 border-amber-500/20",
  }

  return (
    <Card className={cn("bg-gradient-to-br border bg-slate-900", colors[color])}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          {icon && <div className="text-slate-500">{icon}</div>}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && (
          <div className="flex items-center gap-1.5 mt-1">
            {trend && (
              <span className={cn("text-xs font-medium", trend === "up" ? "text-red-400" : "text-green-400")}>
                {trend === "up" ? "↑" : "↓"}
              </span>
            )}
            <span className="text-xs text-slate-500">{subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
