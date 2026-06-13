import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const carId = searchParams.get("carId")
  const month = searchParams.get("month")
  const where: any = {}
  if (date) where.date = new Date(date)
  if (carId) where.carId = carId
  if (month) {
    const start = new Date(`${month}-01`)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    where.date = { gte: start, lte: end }
  }
  const entries = await prisma.poolCarDailyEntry.findMany({ where, include: { car: true, driver: true }, orderBy: { date: "desc" } })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await req.json()
    const { date, carId, ...data } = body
    const entry = await prisma.poolCarDailyEntry.upsert({
      where: { date_carId: { date: new Date(date), carId } },
      update: { ...data, driverId: data.driverId || null },
      create: { date: new Date(date), carId, ...data, driverId: data.driverId || null },
    })
    return NextResponse.json(entry)
  } catch (e) { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await prisma.poolCarDailyEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
