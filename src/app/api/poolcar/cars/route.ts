import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const cars = await prisma.poolCar.findMany({ orderBy: { licensePlate: "asc" } })
  return NextResponse.json(cars)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  try {
    const body = await req.json()
    const car = await prisma.poolCar.upsert({ where: { licensePlate: body.licensePlate }, update: body, create: body })
    return NextResponse.json(car)
  } catch { return NextResponse.json({ error: "Failed" }, { status: 500 }) }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  await prisma.poolCarDailyEntry.deleteMany({ where: { carId: id } })
  await prisma.poolCar.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
