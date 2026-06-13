"use client"

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { data: { km: number; maintenance: number; car: string }[] }

export default function PoolCarScatter({ data }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-sm font-medium">Km Driven vs Maintenance Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="km" name="Km Driven" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis dataKey="maintenance" name="Maintenance Cost" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip formatter={(value: number, name: string) => [name === "maintenance" ? `৳${value.toFixed(2)}` : value, name === "maintenance" ? "Maintenance Cost" : "Km Driven"]} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={data} fill="#3b82f6" opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
