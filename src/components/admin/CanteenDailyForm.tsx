"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle2, AlertCircle, Trash2, UtensilsCrossed } from "lucide-react"

const fields = [
  "rice", "beef", "chicken", "fish", "veg", "oil", "spices",
  "flour", "dal", "sugar", "breadCake", "milk", "eggs", "others", "staffSalary"
] as const

const tokenFields = ["breakfastToken", "lunchDinnerToken"] as const

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
}

function getMonthParam(dateStr: string) {
  return dateStr.slice(0, 7)
}

type Entry = {
  id: string
  date: string
  rice: number
  beef: number
  chicken: number
  fish: number
  veg: number
  oil: number
  spices: number
  flour: number
  dal: number
  sugar: number
  breadCake: number
  milk: number
  eggs: number
  others: number
  staffSalary: number
  breakfastToken: number
  lunchDinnerToken: number
}

const emptyForm: Record<string, string> = {
  date: new Date().toISOString().split("T")[0],
  ...Object.fromEntries(fields.map((f) => [f, ""])),
  ...Object.fromEntries(tokenFields.map((f) => [f, ""])),
}

export default function CanteenDailyForm() {
  const [form, setForm] = useState<Record<string, string>>({ ...emptyForm })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)

  const monthParam = getMonthParam(form.date)

  useEffect(() => {
    fetchMonthlyEntries(monthParam)
  }, [monthParam])

  useEffect(() => {
    fetchDayEntry(form.date)
  }, [form.date])

  async function fetchMonthlyEntries(month: string) {
    const res = await fetch(`/api/canteen/daily?month=${month}`)
    if (res.ok) setEntries(await res.json())
  }

  async function fetchDayEntry(date: string) {
    const res = await fetch(`/api/canteen/daily?date=${date}`)
    if (!res.ok) return
    const data = await res.json()
    if (data && data.id) {
      const next: Record<string, string> = { date }
      for (const f of fields) next[f] = String(data[f] ?? "")
      for (const f of tokenFields) next[f] = String(data[f] ?? "")
      setForm(next)
    } else {
      setForm((prev) => ({ ...prev, ...Object.fromEntries(fields.map((f) => [f, ""])), ...Object.fromEntries(tokenFields.map((f) => [f, ""])) }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    const body: Record<string, any> = { date: form.date }
    for (const f of fields) body[f] = parseFloat(form[f]) || 0
    for (const f of tokenFields) body[f] = parseFloat(form[f]) || 0

    const res = await fetch("/api/canteen/daily", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    setLoading(false)
    if (res.ok) {
      setMsg({ ok: true, text: "Entry saved!" })
      fetchMonthlyEntries(getMonthParam(form.date))
    } else {
      setMsg({ ok: false, text: "Failed to save" })
    }
  }

  async function deleteEntry(id: string) {
    if (!confirm("Delete this entry?")) return
    await fetch(`/api/canteen/daily?id=${id}`, { method: "DELETE" })
    fetchMonthlyEntries(monthParam)
    fetchDayEntry(form.date)
  }

  const totalToday = fields.reduce((sum, f) => sum + (parseFloat(form[f]) || 0), 0)

  return (
    <div className="space-y-6">
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-blue-400" />
            Canteen Daily Entry
          </CardTitle>
          <div className="text-right shrink-0">
            <p className="text-xs text-slate-400 whitespace-nowrap">{form.date} Total</p>
            <p className="text-white font-bold text-right">৳{totalToday.toFixed(2)}</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {msg && (
              <Alert variant={msg.ok ? "default" : "destructive"} className={msg.ok ? "bg-green-950/50 border-green-800" : ""}>
                {msg.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertDescription>{msg.text}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label className="text-slate-300">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="border border-slate-700/50 rounded-lg p-3 bg-slate-800/50">
              <p className="text-xs font-medium text-slate-400 mb-2">Token Entry</p>
              <div className="grid grid-cols-2 gap-3">
                {tokenFields.map((f) => (
                  <div key={f}>
                    <Label className="text-slate-400 text-xs">{f === "breakfastToken" ? "Breakfast Token" : "Lunch/Dinner Token"}</Label>
                    <Input
                      type="number"
                      step="1"
                      value={form[f]}
                      onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white h-9"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              {(() => {
                const bt = parseFloat(form.breakfastToken) || 0
                const lt = parseFloat(form.lunchDinnerToken) || 0
                const extra = Math.max(0, bt - lt)
                const effective = lt + extra * 0.25
                return (
                  <p className="text-xs text-slate-500 mt-2">
                    Effective tokens today: <span className="text-amber-400 font-medium">{effective}</span>
                    {extra > 0 && <span className="text-slate-500"> ({extra} extra breakfast × ¼)</span>}
                  </p>
                )
              })()}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fields.map((f) => (
                <div key={f}>
                  <Label className="text-slate-400 text-xs">{formatLabel(f)}</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form[f]}
                    onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white h-9"
                    placeholder="0"
                  />
                </div>
              ))}
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
            {monthParam} Entries ({entries.length} days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-800">
                  <TableHead className="text-slate-400 whitespace-nowrap">Date</TableHead>
                  <TableHead className="text-slate-400 text-xs whitespace-nowrap">Bkfst Tkn</TableHead>
                  <TableHead className="text-slate-400 text-xs whitespace-nowrap">Lnch/Dnr Tkn</TableHead>
                  <TableHead className="text-slate-400 text-xs whitespace-nowrap">Eff Tkn</TableHead>
                  {fields.slice(0, 6).map((f) => (
                    <TableHead key={f} className="text-slate-400 text-xs whitespace-nowrap">{formatLabel(f)}</TableHead>
                  ))}
                  <TableHead className="text-slate-400 text-right whitespace-nowrap">Total</TableHead>
                  <TableHead className="text-slate-400 w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 && (
                  <TableRow className="border-slate-800">
                    <TableCell colSpan={12} className="text-slate-500 text-center py-6">No entries this month</TableCell>
                  </TableRow>
                )}
                {entries.map((entry) => {
                  const total = fields.reduce((s, f) => s + ((entry as any)[f] || 0), 0)
                  const bt = (entry as any).breakfastToken || 0
                  const lt = (entry as any).lunchDinnerToken || 0
                  const extra = Math.max(0, bt - lt)
                  const eff = lt + extra * 0.25
                  return (
                    <TableRow key={entry.id} className="border-slate-800">
                      <TableCell className="text-white text-xs whitespace-nowrap">{entry.date.slice(0, 10)}</TableCell>
                      <TableCell className="text-slate-300 text-xs whitespace-nowrap">{bt}</TableCell>
                      <TableCell className="text-slate-300 text-xs whitespace-nowrap">{lt}</TableCell>
                      <TableCell className="text-amber-400 text-xs font-medium whitespace-nowrap">{eff}</TableCell>
                      {fields.slice(0, 6).map((f) => (
                        <TableCell key={f} className="text-slate-300 text-xs whitespace-nowrap">
                          {((entry as any)[f] || 0).toFixed(0)}
                        </TableCell>
                      ))}
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
