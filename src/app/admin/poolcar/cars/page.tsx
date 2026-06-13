"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trash2 } from "lucide-react"

type Car = { id: string; licensePlate: string; costCenterName: string; costCenterCode: string | null; fuelType: string; isActive: boolean }

const FUEL_TYPES = ["OCTANE", "DIESEL", "CNG", "LPG"]
const COST_CENTERS = ["W & L", "HR & Admin", "WSM"]

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [form, setForm] = useState({ licensePlate: "", costCenterName: "W & L", costCenterCode: "", fuelType: "OCTANE" })

  useEffect(() => { fetchCars() }, [])

  async function fetchCars() { setCars(await (await fetch("/api/poolcar/cars")).json()) }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await fetch("/api/poolcar/cars", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
    setForm({ licensePlate: "", costCenterName: "W & L", costCenterCode: "", fuelType: "OCTANE" })
    fetchCars()
  }

  async function deleteCar(id: string) {
    await fetch(`/api/poolcar/cars?id=${id}`, { method: "DELETE" })
    fetchCars()
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Manage Cars</h1>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-lg">Add Car</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div><Label className="text-slate-400 text-xs">License Plate</Label><Input value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} className="bg-slate-800 border-slate-700 text-white h-9" required /></div>
            <div><Label className="text-slate-400 text-xs">Cost Center</Label>
              <Select value={form.costCenterName} onValueChange={(v) => setForm({ ...form, costCenterName: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">{COST_CENTERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label className="text-slate-400 text-xs">SAP GL Code</Label><Input value={form.costCenterCode} onChange={(e) => setForm({ ...form, costCenterCode: e.target.value })} className="bg-slate-800 border-slate-700 text-white h-9" /></div>
            <div><Label className="text-slate-400 text-xs">Fuel Type</Label>
              <Select value={form.fuelType} onValueChange={(v) => setForm({ ...form, fuelType: v })}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white h-9"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">{FUEL_TYPES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="col-span-full bg-blue-600 hover:bg-blue-700">Save Car</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader><CardTitle className="text-white text-lg">All Cars ({cars.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow className="border-slate-800">
              <TableHead className="text-slate-400">License Plate</TableHead>
              <TableHead className="text-slate-400">Cost Center</TableHead>
              <TableHead className="text-slate-400">SAP GL</TableHead>
              <TableHead className="text-slate-400">Fuel</TableHead>
              <TableHead className="text-slate-400"></TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {cars.map((c) => (<TableRow key={c.id} className="border-slate-800">
                <TableCell className="text-white font-mono text-xs">{c.licensePlate}</TableCell>
                <TableCell className="text-slate-300">{c.costCenterName}</TableCell>
                <TableCell className="text-slate-300">{c.costCenterCode || "-"}</TableCell>
                <TableCell><span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">{c.fuelType}</span></TableCell>
                <TableCell><button onClick={() => deleteCar(c.id)} className="text-red-400 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></TableCell>
              </TableRow>))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
