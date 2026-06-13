import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Car, UtensilsCrossed, DollarSign, TrendingUp } from "lucide-react"
import KpiCard from "@/components/charts/kpi-card"
import { computeEffectiveTokens } from "@/lib/tokens"

export default async function DashboardOverview() {
  const session = await getSession()
  if (!session) redirect("/login")

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const summary = await prisma.canteenMonthlySummary.findUnique({ where: { monthYear: month } })
  const entries = await prisma.canteenDailyEntry.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } } })
  const poolEntries = await prisma.poolCarDailyEntry.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } }, include: { car: true } })
  const cars = await prisma.poolCar.findMany()

  const totalExpense = entries.reduce((s, e) => s + e.rice + e.beef + e.chicken + e.fish + e.veg + e.oil + e.spices + e.flour + e.dal + e.sugar + e.breadCake + e.milk + e.eggs + e.others + e.staffSalary, 0)
  const scrapSale = summary?.scrapSale || 0
  const totalToken = computeEffectiveTokens(entries) || 1
  const finalExpense = totalExpense - scrapSale

  const totalFuel = poolEntries.reduce((s, e) => s + e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost, 0)
  const totalMaint = poolEntries.reduce((s, e) => s + e.maintenanceCost, 0)
  const totalKm = poolEntries.reduce((s, e) => s + e.kmPerDay, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Monthly Expense" value={`৳${finalExpense.toFixed(2)}`} subtitle="Canteen" color="blue" icon={<UtensilsCrossed className="h-4 w-4" />} />
        <KpiCard title="Per Meal Cost" value={`৳${(finalExpense / totalToken).toFixed(2)}`} subtitle={`${totalToken.toFixed(2)} effective tokens`} color="amber" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard title="Fleet Fuel Cost" value={`৳${totalFuel.toFixed(2)}`} subtitle={`${cars.length} cars`} color="red" icon={<Car className="h-4 w-4" />} />
        <KpiCard title="Fleet Distance" value={`${totalKm.toFixed(0)} km`} subtitle="Total driven" color="green" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-white text-sm font-medium mb-3">Canteen Quick Stats</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between"><span>Total Entries</span><span className="text-white font-medium">{entries.length}</span></div>
            <div className="flex justify-between"><span>Scrap Sale</span><span className="text-white font-medium">৳${scrapSale.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Effective Tokens</span><span className="text-white font-medium">{totalToken.toFixed(2)}</span></div>
          </div>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-white text-sm font-medium mb-3">Pool Car Quick Stats</h3>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex justify-between"><span>Total Cars</span><span className="text-white font-medium">{cars.length}</span></div>
            <div className="flex justify-between"><span>Total Entries</span><span className="text-white font-medium">{poolEntries.length}</span></div>
            <div className="flex justify-between"><span>Total Maintenance</span><span className="text-white font-medium">৳${totalMaint.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
