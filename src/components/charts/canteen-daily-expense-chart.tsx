"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Line } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Props = { data: { date: string; expense: number; perMealCost: number }[] }

export default function CanteenDailyExpenseChart({ data }: Props) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-sm font-medium">Daily Expense vs Per-Meal Cost</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }} />
              <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
              <Bar yAxisId="left" dataKey="expense" fill="#6366f1" name="Daily Expense" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="perMealCost" stroke="#ef4444" strokeWidth={2} dot={false} name="Per-Meal Cost" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
