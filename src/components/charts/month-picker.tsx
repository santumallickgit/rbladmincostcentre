"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MonthPicker() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get("month") || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`

  const months: string[] = []
  const now = new Date()
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }

  return (
    <Select
      value={current}
      onValueChange={(v: string | null) => {
        if (v) router.push(`?month=${v}`)
      }}
    >
      <SelectTrigger className="w-36 bg-slate-800 border-slate-700 text-white h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-slate-700 text-white">
        {months.map((m) => (
          <SelectItem key={m} value={m}>{m}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
