import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const date = searchParams.get("date")
  const month = searchParams.get("month")

  if (date) {
    const entry = await prisma.canteenDailyEntry.findUnique({
      where: { date: new Date(date) },
    })
    return NextResponse.json(entry || {})
  }

  if (month) {
    const start = new Date(`${month}-01`)
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0)
    const entries = await prisma.canteenDailyEntry.findMany({
      where: { date: { gte: start, lte: end } },
      orderBy: { date: "asc" },
    })
    return NextResponse.json(entries)
  }

  const entries = await prisma.canteenDailyEntry.findMany({ orderBy: { date: "desc" } })
  return NextResponse.json(entries)
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { date, ...data } = body

    const entry = await prisma.canteenDailyEntry.upsert({
      where: { date: new Date(date) },
      update: data,
      create: { date: new Date(date), ...data },
    })
    return NextResponse.json(entry)
  } catch (e) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  const session = await getSession()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 })

  await prisma.canteenDailyEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
