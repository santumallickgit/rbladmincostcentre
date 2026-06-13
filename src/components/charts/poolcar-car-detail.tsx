"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Entry = {
  date: string
  kmPerDay: number
  maintenanceCost: number
  octaneCost: number
  dieselCost: number
  cngCost: number
  lpgCost: number
  othersCost: number
  fuelCost: number
  totalCost: number
}

export default function PoolCarCarDetail({ entries, cars }: { entries: { date: string; carId: string; licensePlate: string; kmPerDay: number; maintenanceCost: number; octaneCost: number; dieselCost: number; cngCost: number; lpgCost: number; othersCost: number }[]; cars: { id: string; licensePlate: string; fuelType: string }[] }) {
  const [carId, setCarId] = useState(cars[0]?.id || "")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filtered = useMemo(() => {
    return entries
      .filter((e) => e.carId === carId)
      .filter((e) => {
        if (!startDate && !endDate) return true
        const d = e.date
        if (startDate && d < startDate) return false
        if (endDate && d > endDate) return false
        return true
      })
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => {
        const fuel = e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost
        return { ...e, fuelCost: fuel, totalCost: fuel + e.maintenanceCost + e.othersCost }
      })
  }, [entries, carId, startDate, endDate])

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, e) => {
        acc.km += e.kmPerDay
        acc.fuel += e.fuelCost
        acc.maint += e.maintenanceCost
        acc.others += e.othersCost
        acc.total += e.totalCost
        return acc
      },
      { km: 0, fuel: 0, maint: 0, others: 0, total: 0 }
    )
  }, [filtered])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="w-48">
          <Label className="text-slate-400 text-xs">Select Car</Label>
          <Select value={carId} onValueChange={(v: string | null) => setCarId(v || "")}>
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white truncate">
              <span className="flex-1 text-left truncate">{carId ? cars.find(c => c.id === carId)?.licensePlate || "Select car" : "Select car"}</span>
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {cars.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.licensePlate}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-slate-400 text-xs">From</Label>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-slate-800 border-slate-700 text-white h-9 w-40" />
        </div>
        <div>
          <Label className="text-slate-400 text-xs">To</Label>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-slate-800 border-slate-700 text-white h-9 w-40" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-slate-400 text-sm">No entries found for selected criteria.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Entries", value: filtered.length },
              { label: "Total KM", value: `${totals.km.toFixed(0)} km` },
              { label: "Fuel", value: `৳${totals.fuel.toFixed(2)}` },
              { label: "Maintenance", value: `৳${totals.maint.toFixed(2)}` },
              { label: "Total", value: `৳${totals.total.toFixed(2)}` },
            ].map((s) => (
              <div key={s.label} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                <p className="text-xs text-slate-400">{s.label}</p>
                <p className="text-white font-semibold text-sm">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-white text-sm font-medium">Daily Cost Trend</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                      <Line type="monotone" dataKey="fuelCost" stroke="#f59e0b" strokeWidth={2} dot={false} name="Fuel Cost" />
                      <Line type="monotone" dataKey="maintenanceCost" stroke="#3b82f6" strokeWidth={2} dot={false} name="Maintenance" />
                      <Line type="monotone" dataKey="othersCost" stroke="#10b981" strokeWidth={2} dot={false} name="Others" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader><CardTitle className="text-white text-sm font-medium">Daily KM vs Total Cost</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filtered}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
                      <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
                      <Bar yAxisId="left" dataKey="kmPerDay" fill="#3b82f6" name="KM" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="totalCost" fill="#ef4444" name="Total Cost" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
