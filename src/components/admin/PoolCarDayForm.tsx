"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle, Trash2, Car } from "lucide-react"

const fields = ["kmPerDay", "maintenanceCost", "octaneCost", "dieselCost", "cngCost", "lpgCost", "othersCost", "driverOtHours"] as const

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
}

type Car = { id: string; licensePlate: string; fuelType: string }
type Driver = { id: string; name: string; color: string }

type Entry = {
  id: string
  date: string
  carId: string
  driverId: string | null
  kmPerDay: number
  maintenanceCost: number
  octaneCost: number
  dieselCost: number
  cngCost: number
  lpgCost: number
  othersCost: number
  driverOtHours: number
  driver?: { name: string }
  car?: { licensePlate: string; fuelType: string }
}

const emptyForm: Record<string, string> = {
  date: new Date().toISOString().split("T")[0],
  ...Object.fromEntries(fields.map((f) => [f, ""])),
}

export default function PoolCarDayForm() {
  const [cars, setCars] = useState<Car[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [carId, setCarId] = useState("")
  const [driverId, setDriverId] = useState("")
  const [form, setForm] = useState<Record<string, string>>({ ...emptyForm })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  const monthParam = form.date.slice(0, 7)

  useEffect(() => {
    fetch("/api/poolcar/cars").then((r) => r.json()).then(setCars)
    fetch("/api/poolcar/drivers").then((r) => r.json()).then(setDrivers)
    fetchMonthlyEntries(monthParam)
  }, [monthParam])

  useEffect(() => {
    if (carId && form.date) {
      fetchDayEntry(form.date, carId)
    }
  }, [form.date, carId])

  async function fetchMonthlyEntries(month: string) {
    const res = await fetch(`/api/poolcar/daily?month=${month}`)
    if (res.ok) setEntries(await res.json())
  }

  async function fetchDayEntry(date: string, cid: string) {
    const res = await fetch(`/api/poolcar/daily?date=${date}&carId=${cid}`)
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const e = data[0]
      const next: Record<string, string> = { date }
      for (const f of fields) next[f] = String(e[f] ?? "")
      setForm(next)
      setDriverId(e.driverId || "")
    } else {
      setForm((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, ""])) }))
      setDriverId("")
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!carId) { setMsg({ ok: false, text: "Select a car" }); return }
    setMsg(null)
    setLoading(true)
    const body: Record<string, any> = { date: form.date, carId, driverId: driverId || null }
    for (const f of fields) body[f] = parseFloat(form[f]) || 0
    const res = await fetch("/api/poolcar/daily", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
    setLoading(false)
    if (res.ok) {
      setMsg({ ok: true, text: "Entry saved!" })
      fetchMonthlyEntries(monthParam)
    } else {
      setMsg({ ok: false, text: "Failed to save" })
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return
    await fetch(`/api/poolcar/daily?id=${id}`, { method: "DELETE" })
    fetchMonthlyEntries(monthParam)
    if (carId) fetchDayEntry(form.date, carId)
  }

  const totalToday = (parseFloat(form.octaneCost) || 0) +
    (parseFloat(form.dieselCost) || 0) +
    (parseFloat(form.cngCost) || 0) +
    (parseFloat(form.lpgCost) || 0) +
    (parseFloat(form.maintenanceCost) || 0) +
    (parseFloat(form.othersCost) || 0)

  const selectedCar = cars.find((c) => c.id === carId)

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Car className="h-5 w-5 text-blue-400" />
            Pool Car Daily Entry
          </CardTitle>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400 whitespace-nowrap">{form.date} Total</p>
            <p className="text-white font-bold">৳{totalToday.toFixed(2)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {msg && <Alert variant={msg.ok ? "default" : "destructive"} className={msg.ok ? "bg-green-950/50 border-green-800" : ""}>
              {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{msg.text}</AlertDescription>
            </Alert>}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-slate-300">Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="bg-slate-800 border-slate-700 text-white" required />
              </div>
              <div>
                <Label className="text-slate-300">Car</Label>
                <Select value={carId} onValueChange={(v: string | null) => setCarId(v || "")}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white truncate">
                    <span className="flex-1 text-left truncate">
                      {carId ? (() => { const c = cars.find(c => c.id === carId); return c ? c.licensePlate.split(" ").slice(-2).join(" ") + " (" + c.fuelType + ")" : "Select car" })() : "Select car"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {cars.map((c) => {
                      const short = c.licensePlate.split(" ").slice(-2).join(" ")
                      return (<SelectItem key={c.id} value={c.id} className="truncate">{short} ({c.fuelType})</SelectItem>)
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-300">Driver</Label>
                <Select value={driverId} onValueChange={(v: string | null) => setDriverId(v || "")}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <span className="flex-1 text-left">{driverId ? drivers.find(d => d.id === driverId)?.name || "Select driver" : "Select driver"}</span>
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    {drivers.map((d) => (<SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {fields.map((f) => {
                const isFuel = f === "octaneCost" || f === "dieselCost" || f === "cngCost" || f === "lpgCost"
                const hideFuel = isFuel && selectedCar &&
                  ((f === "octaneCost" && selectedCar.fuelType !== "OCTANE") ||
                   (f === "dieselCost" && selectedCar.fuelType !== "DIESEL") ||
                   (f === "cngCost" && selectedCar.fuelType !== "CNG") ||
                   (f === "lpgCost" && selectedCar.fuelType !== "LPG"))
                return (
                  <div key={f} className={hideFuel ? "hidden" : ""}>
                    <Label className="text-slate-400 text-xs">{formatLabel(f)}</Label>
                    <Input type="number" step="0.01" value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} className="bg-slate-800 border-slate-700 text-white h-9" placeholder="0" />
                  </div>
                )
              })}
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Saving..." : "Save Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Monthly entries table */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white text-sm font-medium">
            {monthParam} Entries ({entries.length} records)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400 whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-slate-400 whitespace-nowrap">Car</TableHead>
                  <TableHead className="text-slate-400 whitespace-nowrap">Driver</TableHead>
                  <TableHead className="text-slate-400 text-right whitespace-nowrap">KM</TableHead>
                  <TableHead className="text-slate-400 text-right whitespace-nowrap">Fuel</TableHead>
                  <TableHead className="text-slate-400 text-right whitespace-nowrap">Maint</TableHead>
                  <TableHead className="text-slate-400 text-right whitespace-nowrap">Total</TableHead>
                  <TableHead className="text-slate-400 w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 && (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={8} className="text-slate-500 text-center py-6">No entries this month</TableCell>
                  </TableRow>
                )}
                {entries.map((entry) => {
                  const fuel = entry.octaneCost + entry.dieselCost + entry.cngCost + entry.lpgCost
                  const total = fuel + entry.maintenanceCost + entry.othersCost
                  const shortPlate = entry.car?.licensePlate?.split(" ").slice(-2).join(" ") || "-"
                  return (
                    <TableRow key={entry.id} className="border-slate-800">
                      <TableCell className="text-white text-xs whitespace-nowrap">{entry.date.slice(0, 10)}</TableCell>
                      <TableCell className="text-slate-300 text-xs whitespace-nowrap font-mono" title={entry.car?.licensePlate}>{shortPlate}</TableCell>
                      <TableCell className="text-slate-300 text-xs whitespace-nowrap">{entry.driver?.name || "-"}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right whitespace-nowrap">{entry.kmPerDay}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right whitespace-nowrap">৳{fuel.toFixed(0)}</TableCell>
                      <TableCell className="text-slate-300 text-xs text-right whitespace-nowrap">৳{entry.maintenanceCost.toFixed(0)}</TableCell>
                      <TableCell className="text-white font-medium text-xs text-right whitespace-nowrap">৳{total.toFixed(2)}</TableCell>
                      <TableCell>
                        <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
