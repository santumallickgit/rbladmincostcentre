import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UtensilsCrossed, DollarSign, TrendingUp, Coins, Download, Sun, Moon } from "lucide-react"
import KpiCard from "@/components/charts/kpi-card"
import CanteenAreaChart from "@/components/charts/canteen-area-chart"
import CanteenStackedBar from "@/components/charts/canteen-stacked-bar"
import CanteenPieChart from "@/components/charts/canteen-pie-chart"
import CanteenTokenChart from "@/components/charts/canteen-token-chart"
import CanteenDailyExpenseChart from "@/components/charts/canteen-daily-expense-chart"
import MonthPicker from "@/components/charts/month-picker"
import { computeEffectiveTokens } from "@/lib/tokens"

export default async function CanteenDashboard(props: { searchParams?: Promise<{ month?: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const sp = await props.searchParams
  const month = sp?.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

  const summary = await prisma.canteenMonthlySummary.findUnique({ where: { monthYear: month } })
  const start = new Date(`${month}-01`)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
  const monthEntries = await prisma.canteenDailyEntry.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  })

  const totalExpense = monthEntries.reduce((s, e) =>
    s + e.rice + e.beef + e.chicken + e.fish + e.veg + e.oil + e.spices + e.flour + e.dal + e.sugar + e.breadCake + e.milk + e.eggs + e.others + e.staffSalary, 0)

  const scrapSale = summary?.scrapSale || 0
  const totalToken = computeEffectiveTokens(monthEntries) || 1
  const finalExpense = totalExpense - scrapSale
  const perMealCost = finalExpense / totalToken

  const totalBreakfast = monthEntries.reduce((s, e) => s + e.breakfastToken, 0)
  const totalLunchDinner = monthEntries.reduce((s, e) => s + e.lunchDinnerToken, 0)

  const areaData = monthEntries.map((e) => {
    const daySum = e.rice + e.beef + e.chicken + e.fish + e.veg + e.oil + e.spices + e.flour + e.dal + e.sugar + e.breadCake + e.milk + e.eggs + e.others + e.staffSalary
    const bt = e.breakfastToken
    const lt = e.lunchDinnerToken
    const extra = Math.max(0, bt - lt)
    const dailyEff = lt + extra * 0.25
    const dateLabel = e.date.toISOString().split("T")[0].slice(5)
    return { date: dateLabel, perMealCost: dailyEff > 0 ? +(daySum / dailyEff).toFixed(2) : 0 }
  })

  const barData = monthEntries.map((e) => {
    const d: any = { date: e.date.toISOString().split("T")[0].slice(5) }
    ;["rice", "beef", "chicken", "fish", "veg", "oil", "spices", "flour", "dal", "sugar", "breadCake", "milk", "eggs", "others", "staffSalary"].forEach((c) => d[c] = (e as any)[c])
    return d
  })

  const tokenData = monthEntries.map((e) => {
    const bt = e.breakfastToken
    const lt = e.lunchDinnerToken
    const extra = Math.max(0, bt - lt)
    return {
      date: e.date.toISOString().split("T")[0].slice(5),
      breakfast: bt,
      lunchDinner: lt,
      effective: lt + extra * 0.25,
    }
  })

  const expenseData = monthEntries.map((e) => {
    const daySum = e.rice + e.beef + e.chicken + e.fish + e.veg + e.oil + e.spices + e.flour + e.dal + e.sugar + e.breadCake + e.milk + e.eggs + e.others + e.staffSalary
    const bt = e.breakfastToken
    const lt = e.lunchDinnerToken
    const extra = Math.max(0, bt - lt)
    const dailyEff = lt + extra * 0.25
    return {
      date: e.date.toISOString().split("T")[0].slice(5),
      expense: daySum,
      perMealCost: dailyEff > 0 ? +(daySum / dailyEff).toFixed(2) : 0,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Canteen Dashboard</h1>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="w-36 h-9 bg-slate-800 rounded-md" />}>
            <MonthPicker />
          </Suspense>
          <a href={`/api/export?type=canteen&month=${month}`} download className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium whitespace-nowrap">
            <Download className="h-4 w-4" /> Export
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Monthly Expense" value={`৳${totalExpense.toFixed(2)}`} subtitle={`Net: ৳${finalExpense.toFixed(2)}`} color="blue" icon={<UtensilsCrossed className="h-4 w-4" />} />
        <KpiCard title="Per Meal Cost" value={`৳${perMealCost.toFixed(2)}`} subtitle={`${totalToken.toFixed(2)} effective tokens`} color="amber" icon={<TrendingUp className="h-4 w-4" />} />
        <KpiCard title="Total Tokens" value={`${totalToken.toFixed(2)}`} subtitle={`${totalBreakfast} B / ${totalLunchDinner} L`} color="green" icon={<Coins className="h-4 w-4" />} />
        <KpiCard title="Scrap Sale" value={`৳${scrapSale.toFixed(2)}`} subtitle="Deducted" color="red" icon={<DollarSign className="h-4 w-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CanteenAreaChart data={areaData} />
        <CanteenPieChart data={barData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CanteenTokenChart data={tokenData} />
        <CanteenDailyExpenseChart data={expenseData} />
      </div>
      <CanteenStackedBar data={barData} />
    </div>
  )
}
