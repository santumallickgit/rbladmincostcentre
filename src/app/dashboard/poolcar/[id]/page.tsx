import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Car, DollarSign, Gauge, Wrench } from "lucide-react"
import KpiCard from "@/components/charts/kpi-card"
import PoolCarCarDetail from "@/components/charts/poolcar-car-detail"

export default async function PoolCarDetailPage(props: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) redirect("/login")

  const { id } = await props.params
  const car = await prisma.poolCar.findUnique({ where: { id } })
  if (!car) notFound()

  const entries = await prisma.poolCarDailyEntry.findMany({
    where: { carId: id },
    include: { driver: true },
    orderBy: { date: "asc" },
  })

  const totalFuel = entries.reduce((s, e) => s + e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost, 0)
  const totalMaint = entries.reduce((s, e) => s + e.maintenanceCost, 0)
  const totalKm = entries.reduce((s, e) => s + e.kmPerDay, 0)
  const totalCost = totalFuel + totalMaint + entries.reduce((s, e) => s + e.othersCost, 0)

  const clientEntries = entries.map((e) => ({
    date: e.date.toISOString().split("T")[0],
    carId: e.carId,
    licensePlate: car.licensePlate,
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
      <div className="flex items-center gap-4">
        <Link href="/dashboard/poolcar" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{car.licensePlate}</h1>
          <p className="text-sm text-slate-400">{car.costCenterName} · {car.fuelType} · {car.costCenterCode || "No GL code"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Cost" value={`৳${totalCost.toFixed(2)}`} subtitle={`${entries.length} entries`} color="blue" icon={<Car className="h-4 w-4" />} />
        <KpiCard title="Fuel Cost" value={`৳${totalFuel.toFixed(2)}`} subtitle={car.fuelType} color="red" icon={<DollarSign className="h-4 w-4" />} />
        <KpiCard title="Maintenance" value={`৳${totalMaint.toFixed(2)}`} subtitle="Total" color="amber" icon={<Wrench className="h-4 w-4" />} />
        <KpiCard title="Distance" value={`${totalKm.toFixed(0)} km`} subtitle={`Avg ${totalKm > 0 ? (totalKm / entries.length).toFixed(1) : 0} km/day`} color="green" icon={<Gauge className="h-4 w-4" />} />
      </div>

      <PoolCarCarDetail
        entries={clientEntries}
        cars={[{ id: car.id, licensePlate: car.licensePlate, fuelType: car.fuelType }]}
      />
    </div>
  )
}
