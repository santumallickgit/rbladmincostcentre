import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Car, DollarSign, Gauge, Wrench, Download, ExternalLink, Fuel, Cog } from "lucide-react"
import KpiCard from "@/components/charts/kpi-card"
import PoolCarMultiLine from "@/components/charts/poolcar-multi-line"
import PoolCarHorizontalBar from "@/components/charts/poolcar-horizontal-bar"
import PoolCarScatter from "@/components/charts/poolcar-scatter"
import PoolCarCarDetail from "@/components/charts/poolcar-car-detail"
import MonthPicker from "@/components/charts/month-picker"

export default async function PoolCarDashboard(props: { searchParams?: Promise<{ month?: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const sp = await props.searchParams
  const month = sp?.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`
  const start = new Date(`${month}-01`)
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)

  const entries = await prisma.poolCarDailyEntry.findMany({
    where: { date: { gte: start, lte: end } },
    include: { car: true, driver: true },
    orderBy: { date: "asc" },
  })
  const cars = await prisma.poolCar.findMany()

  const totalFuel = entries.reduce((s, e) => s + e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost, 0)
  const totalMaint = entries.reduce((s, e) => s + e.maintenanceCost, 0)
  const totalKm = entries.reduce((s, e) => s + e.kmPerDay, 0)
  const totalOthers = entries.reduce((s, e) => s + e.othersCost, 0)
  const totalCost = totalFuel + totalMaint + totalOthers

  // Per-car total cost
  const carCostMap = new Map<string, { id: string; plate: string; fuel: string; cost: number; km: number; entries: number }>()
  for (const car of cars) {
    carCostMap.set(car.id, { id: car.id, plate: car.licensePlate, fuel: car.fuelType, cost: 0, km: 0, entries: 0 })
  }
  for (const e of entries) {
    const cur = carCostMap.get(e.carId)
    if (cur) {
      cur.cost += e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost + e.maintenanceCost + e.othersCost
      cur.km += e.kmPerDay
      cur.entries++
    }
  }
  const carStats = Array.from(carCostMap.values()).sort((a, b) => b.cost - a.cost)

  const dateMap = new Map<string, { fuelCost: number; maintenanceCost: number }>()
  for (const e of entries) {
    const key = e.date.toISOString().split("T")[0].slice(5)
    const cur = dateMap.get(key) || { fuelCost: 0, maintenanceCost: 0 }
    cur.fuelCost += e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost
    cur.maintenanceCost += e.maintenanceCost
    dateMap.set(key, cur)
  }
  const lineData = Array.from(dateMap.entries()).map(([date, v]) => ({ date, ...v }))

  const topCars = carStats.slice(0, 5).map((c) => ({ name: c.plate, totalCost: c.cost }))

  const scatterData = entries.map((e) => ({
    km: e.kmPerDay,
    maintenance: e.maintenanceCost,
    car: e.car.licensePlate,
  }))

  const driverMap = new Map<string, { name: string; color: string; cost: number; km: number; cars: Set<string> }>()
  for (const e of entries) {
    if (!e.driver) continue
    const key = e.driver.name
    const cur = driverMap.get(key) || { name: e.driver.name, color: e.driver.color, cost: 0, km: 0, cars: new Set() }
    cur.cost += e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost + e.maintenanceCost + e.othersCost
    cur.km += e.kmPerDay
    cur.cars.add(e.car.licensePlate)
    driverMap.set(key, cur)
  }
  const driverStats = Array.from(driverMap.values())

  const clientEntries = entries.map((e) => ({
    date: e.date.toISOString().split("T")[0],
    carId: e.carId,
    licensePlate: e.car.licensePlate,
    kmPerDay: e.kmPerDay,
    maintenanceCost: e.maintenanceCost,
    octaneCost: e.octaneCost,
    dieselCost: e.dieselCost,
    cngCost: e.cngCost,
    lpgCost: e.lpgCost,
    othersCost: e.othersCost,
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-white">Pool Car Dashboard</h1>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="w-36 h-9 bg-slate-800 rounded-md" />}>
            <MonthPicker />
          </Suspense>
          <a href={`/api/export?type=poolcar&month=${month}`} download className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium whitespace-nowrap">
            <Download className="h-4 w-4" /> Export
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Fleet Maintenance" value={`৳${totalMaint.toFixed(2)}`} subtitle={`${cars.length} cars`} color="blue" icon={<Wrench className="h-4 w-4" />} />
        <KpiCard title="Fleet Fuel Cost" value={`৳${totalFuel.toFixed(2)}`} subtitle="All vehicles" color="red" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard title="Total Distance" value={`${totalKm.toFixed(0)} km`} subtitle="Fleet total" color="green" icon={<Gauge className="h-4 w-4" />} />
        <KpiCard title="Avg Cost / Km" value={`৳${(totalKm > 0 ? totalCost / totalKm : 0).toFixed(3)}`} subtitle="Per kilometer" color="amber" icon={<Car className="h-4 w-4" />} />
      </div>

      {/* Per-Car Cards with Navigation */}
      {carStats.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-white text-sm font-medium mb-4">Per-Car Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {carStats.map((c) => (
              <div key={c.id} className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car className="h-4 w-4 text-blue-400 shrink-0" />
                    <span className="text-white text-sm font-medium truncate">{c.plate}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-slate-300 shrink-0">{c.fuel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-slate-500">Cost</p>
                    <p className="text-white font-semibold">৳{c.cost.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">KM</p>
                    <p className="text-white font-semibold">{c.km.toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Entries</p>
                    <p className="text-white font-semibold">{c.entries}</p>
                  </div>
                </div>
                <Link
                  href={`/dashboard/poolcar/${c.id}`}
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-md bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium transition-colors"
                >
                  View Details <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Driver Breakdown - Color Coded */}
      {driverStats.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
          <h3 className="text-white text-sm font-medium mb-4">Driver Cost Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {driverStats.map((d) => (
              <div key={d.name} className="rounded-lg p-4 border" style={{ borderColor: d.color + "40", backgroundColor: d.color + "10" }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-white font-medium text-sm">{d.name}</span>
                </div>
                <p className="text-lg font-bold text-white">৳{d.cost.toFixed(2)}</p>
                <p className="text-xs text-slate-400">{d.km} km | {d.cars.size} cars</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-car Detail Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-5">
        <h3 className="text-white text-sm font-medium mb-4">Per-Car Analysis</h3>
        <PoolCarCarDetail entries={clientEntries} cars={cars.map((c) => ({ id: c.id, licensePlate: c.licensePlate, fuelType: c.fuelType }))} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PoolCarMultiLine data={lineData} />
        <PoolCarHorizontalBar data={topCars} />
      </div>
      <PoolCarScatter data={scatterData} />
    </div>
  )
}
