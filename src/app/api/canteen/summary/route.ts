import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { computeEffectiveTokens } from "@/lib/tokens"

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month")

  if (month) {
    const summary = await prisma.canteenMonthlySummary.findUnique({
      where: { monthYear: month },
    })

    const start = new Date(`${month}-01`)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const entries = await prisma.canteenDailyEntry.findMany({
      where: { date: { gte: start, lte: end } },
    })

    const totalExpense = entries.reduce((sum, e) => {
      return sum + e.rice + e.beef + e.chicken + e.fish + e.veg + e.oil + e.spices + e.flour + e.dal + e.sugar + e.breadCake + e.milk + e.eggs + e.others + e.staffSalary
    }, 0)

    const scrapSale = summary?.scrapSale || 0
    const computedTotal = computeEffectiveTokens(entries)
    const totalToken = computedTotal || 1
    const finalExpense = totalExpense - scrapSale

    return NextResponse.json({
      monthYear: month,
      totalExpense,
      scrapSale,
      totalToken,
      computedTotal,
      manualTotal: summary?.totalToken || 0,
      finalExpense,
      perMealCost: finalExpense / totalToken,
      dailyEntries: entries,
    })
  }

  const summaries = await prisma.canteenMonthlySummary.findMany()
  return NextResponse.json(summaries)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const summary = await prisma.canteenMonthlySummary.upsert({
      where: { monthYear: body.monthYear },
      update: { scrapSale: body.scrapSale, totalToken: body.totalToken },
      create: { monthYear: body.monthYear, scrapSale: body.scrapSale, totalToken: body.totalToken },
    })
    return NextResponse.json(summary)
  } catch {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
