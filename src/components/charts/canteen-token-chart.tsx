"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { data: { date: string; breakfast: number; lunchDinner: number; effective: number }[] }

export default function CanteenTokenChart({ data }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-sm font-medium">Daily Token Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
              <Bar dataKey="breakfast" fill="#f59e0b" name="Breakfast" radius={[2, 2, 0, 0]} />
              <Bar dataKey="lunchDinner" fill="#3b82f6" name="Lunch/Dinner" radius={[2, 2, 0, 0]} />
              <Bar dataKey="effective" fill="#10b981" name="Effective" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
