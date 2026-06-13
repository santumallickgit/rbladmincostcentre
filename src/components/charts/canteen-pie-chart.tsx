"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CATEGORIES = ["rice", "beef", "chicken", "fish", "veg", "oil", "spices", "flour", "dal", "sugar", "breadCake", "milk", "eggs", "others", "staffSalary"]
const COLORS = ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#6366f1", "#84cc16", "#06b6d4", "#d946ef", "#22d3ee", "#a1a1aa", "#64748b"]

function formatLabel(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
}

export default function CanteenPieChart({ data }: { data: { date: string; [key: string]: any }[] }) {
  const totals = CATEGORIES.map((cat) => ({
    name: formatLabel(cat),
    value: data.reduce((sum, d) => sum + (d[cat] || 0), 0),
  })).filter((d) => d.value > 0)

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader>
        <CardTitle className="text-white text-sm font-medium">Monthly Expense Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={totals}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={(entry) => `${entry.name}: ৳${entry.value.toFixed(0)}`}
                labelLine={false}
              >
                {totals.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `৳${value.toFixed(2)}`}
                contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px", color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
