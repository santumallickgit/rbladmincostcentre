import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import * as XLSX from "xlsx"
import { computeEffectiveTokens } from "@/lib/tokens"

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const month = searchParams.get("month") || "2026-04"

  if (type === "canteen") return genCanteen(month)
  if (type === "poolcar") return genPoolCar(month)
  return NextResponse.json({ error: "Invalid type" }, { status: 400 })
}

function xlResp(wb: XLSX.WorkBook, name: string) {
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })
  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${name}-${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  })
}

async function genCanteen(month: string) {
  const entries = await prisma.canteenDailyEntry.findMany({ orderBy: { date: "asc" } })
  const summary = await prisma.canteenMonthlySummary.findUnique({ where: { monthYear: month } })

  const cats = ["rice","beef","chicken","fish","veg","oil","spices","flour","dal","sugar","breadCake","milk","eggs","others","staffSalary"] as const
  const catLabels = ["Rice","Beef","Staff","Chicken","Fish","Veg","Oil","Spices","Flour","Dal","Sugar","Bread/Cake","Milk","Eggs","Others"]
  const totals = cats.map((c) => entries.reduce((s, e) => s + e[c], 0))
  const grandTotal = totals.reduce((s, v) => s + v, 0)
  const scrapSale = summary?.scrapSale || 0
  const totalToken = computeEffectiveTokens(entries)
  const finalExpense = grandTotal - scrapSale
  const perMealCost = totalToken > 0 ? finalExpense / totalToken : 0

  const totalBreakfast = entries.reduce((s, e) => s + e.breakfastToken, 0)
  const totalLunchDinner = entries.reduce((s, e) => s + e.lunchDinnerToken, 0)

  // Summary sheet
  const summaryRows: any[] = []
  summaryRows.push(["s/n", "Items", "Amount"])
  catLabels.forEach((l, i) => summaryRows.push([String(i + 1).padStart(2, "0"), l, totals[i]]))
  summaryRows.push([])
  summaryRows.push([""])
  summaryRows.push(["Breakfast Token", "", totalBreakfast])
  summaryRows.push(["Lunch/Dinner Token", "", totalLunchDinner])
  summaryRows.push(["Effective Token", "", totalToken])
  summaryRows.push(["Scrap sale", "", scrapSale])
  summaryRows.push(["Total Expense", "", finalExpense])
  summaryRows.push(["Total Token", "", totalToken])
  summaryRows.push(["Per Meal Cost", "", perMealCost])

  // Daily sheet
  const dailyRows: any[] = [["Date", "Breakfast Token", "Lunch/Dinner Token", "Effective Token", ...catLabels]]
  entries.forEach((e) => {
    const bt = e.breakfastToken
    const lt = e.lunchDinnerToken
    const extra = Math.max(0, bt - lt)
    const eff = lt + extra * 0.25
    dailyRows.push([e.date.toISOString().split("T")[0], bt, lt, eff, ...cats.map((c) => e[c])])
  })

  const wb = XLSX.utils.book_new()
  const ws1 = XLSX.utils.aoa_to_sheet(summaryRows)
  const ws2 = XLSX.utils.aoa_to_sheet(dailyRows)
  XLSX.utils.book_append_sheet(wb, ws1, "Summary")
  XLSX.utils.book_append_sheet(wb, ws2, "Daily")
  return xlResp(wb, `Canteen-Cost-${month}`)
}

async function genPoolCar(month: string) {
  const cars = await prisma.poolCar.findMany({ orderBy: { licensePlate: "asc" } })
  const entries = await prisma.poolCarDailyEntry.findMany({
    include: { car: true, driver: true },
    orderBy: [{ car: { licensePlate: "asc" } }, { date: "asc" }],
  })

  const wb = XLSX.utils.book_new()

  // Report sheet
  const reportRows: any[] = [["Pool Car Number", "Cost Centre name", "Cost Centre Code", "", "", "", "SAP GL #", "SAP GL Code Name"]]
  // Fuel + maintenance summary per car
  const fuelTypes = ["OCTANE", "DIESEL", "CNG", "LPG"]
  for (const car of cars) {
    const carEntries = entries.filter((e) => e.carId === car.id)
    const totalFuel = carEntries.reduce((s, e) => s + e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost, 0)
    const totalMaint = carEntries.reduce((s, e) => s + e.maintenanceCost, 0)
    const totalOthers = carEntries.reduce((s, e) => s + e.othersCost, 0)
    const totalKm = carEntries.reduce((s, e) => s + e.kmPerDay, 0)
    reportRows.push([car.licensePlate, car.costCenterName, car.costCenterCode || "", "", "", "", "", ""])
    reportRows.push(["", "", "", "", "", "Fuel Cost (Total)", "", totalFuel])
    reportRows.push(["", "", "", "", "", "Maintenance Cost", "", totalMaint])
    reportRows.push(["", "", "", "", "", "Others Cost", "", totalOthers])
    reportRows.push(["", "", "", "", "", "Total Km", "", totalKm])
    reportRows.push([])
  }
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(reportRows), "Report")

  // Per-car sheets
  for (const car of cars) {
    const carEntries = entries.filter((e) => e.carId === car.id).sort((a, b) => a.date.getTime() - b.date.getTime())
    const fuelCol = car.fuelType === "DIESEL" ? 4 : car.fuelType === "CNG" ? 4 : car.fuelType === "LPG" ? 4 : 3
    const fuelLabel = car.fuelType === "OCTANE" ? "Octane Cost" : car.fuelType === "DIESEL" ? "Diesel Cost" : car.fuelType === "CNG" ? "CNG Cost" : "LPG Cost"

    const rows: any[] = [
      ["RAHIMAFROOZ BATTERIES LTD."],
      ["Cost calculation sheet for pool cars"],
      [car.licensePlate],
      [],
      ["Date", "Km/Day", "Maintenance Cost", "Octane Cost", fuelLabel, "", "", "Others Cost", "Drivers OT hrs", "Driver", "Signature"],
      [],
    ]
    for (const e of carEntries) {
      const dateStr = e.date.toISOString().split("T")[0]
      const row: any[] = [dateStr, e.kmPerDay, e.maintenanceCost, e.octaneCost, 0, "", "", e.othersCost, e.driverOtHours, e.driver?.name || "", ""]
      if (car.fuelType === "DIESEL") row[4] = e.dieselCost
      else if (car.fuelType === "CNG") row[4] = e.cngCost
      else if (car.fuelType === "LPG") row[4] = e.lpgCost
      rows.push(row)
    }

    rows.push([])
    const totalFuel = carEntries.reduce((s, e) => s + e.octaneCost + e.dieselCost + e.cngCost + e.lpgCost, 0)
    const totalMaint = carEntries.reduce((s, e) => s + e.maintenanceCost, 0)
    const totalOthers = carEntries.reduce((s, e) => s + e.othersCost, 0)
    rows.push(["", "", "", "", "", "", "", "", ""])
    rows.push(["", "", 0, 0, totalFuel, 0, 0, totalOthers, 0])
    rows.push([])
    rows.push(["", "", "", "Maintenance cost", "", "", totalMaint])
    rows.push(["", "", "", "Octane Cost", "", "", carEntries.reduce((s, e) => s + e.octaneCost, 0)])
    rows.push(["", "", "", `${car.fuelType} Cost`, "", "", totalFuel])
    rows.push(["", "", "", "Others Cost", "", "", totalOthers])
    rows.push(["", "", "", "Grand Total", "", "", totalFuel + totalMaint + totalOthers])

    const ws = XLSX.utils.aoa_to_sheet(rows)
    // Sheet name = last part of plate (max 31 chars for Excel)
    const parts = car.licensePlate.split(" ")
    const sheetName = parts[parts.length - 1].replace(/[\[\]:*?\/\\]/g, "").slice(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, sheetName || "Car")
  }

  return xlResp(wb, `Pool-Car-Cost-${month}`)
}
