import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Seed users
  await prisma.user.upsert({ where: { username: "rbl_admin" }, update: {}, create: { username: "rbl_admin", password: "12345678", role: "ADMIN" } })
  await prisma.user.upsert({ where: { username: "rbl_users" }, update: {}, create: { username: "rbl_users", password: "1234", role: "VIEWER" } })

  // Seed drivers
  const drivers = [
    { name: "Sajib", color: "#3b82f6" },
    { name: "Bijoy", color: "#10b981" },
    { name: "Habib", color: "#f59e0b" },
    { name: "Omar", color: "#ef4444" },
    { name: "Sahin", color: "#8b5cf6" },
  ]
  const driverIds: Record<string, string> = {}
  for (const d of drivers) {
    const dr = await prisma.driver.upsert({ where: { name: d.name }, update: {}, create: d })
    driverIds[dr.name] = dr.id
  }

  // Seed pool cars (15 real cars from the Excel)
  const cars = [
    { licensePlate: "Dhaka-Metro-Tha 11-5612", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Ma 11-2995", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "DIESEL" },
    { licensePlate: "Dhaka-Metro-Ma 11-1024", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Tha 11-8814", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-AU 14-1547", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "DIESEL" },
    { licensePlate: "Dhaka-Metro-NA 12-5279", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "DIESEL" },
    { licensePlate: "Dhaka-Metro-NA 12-6817", costCenterName: "W & L", costCenterCode: "1204406007", fuelType: "DIESEL" },
    { licensePlate: "Dhaka-Metro-Cha 13-5325", costCenterName: "HR & Admin", costCenterCode: "1201103002", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Cha 53-4474", costCenterName: "HR & Admin", costCenterCode: "1201103002", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Cha 53-8652", costCenterName: "HR & Admin", costCenterCode: "1201103002", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Ga-22-6508", costCenterName: "HR & Admin", costCenterCode: "1201103002", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Cha 52-3570", costCenterName: "HR & Admin", costCenterCode: "1201103002", fuelType: "LPG" },
    { licensePlate: "Dhaka-Metro-Ma 11-1025", costCenterName: "WSM", costCenterCode: "1201105001", fuelType: "CNG" },
    { licensePlate: "Dhaka-Metro-Ma 11-2997", costCenterName: "WSM", costCenterCode: "1201105001", fuelType: "DIESEL" },
    { licensePlate: "Dhaka-Metro-Cha 51-8412", costCenterName: "WSM", costCenterCode: "1201105001", fuelType: "CNG" },
  ]
  for (const c of cars) {
    await prisma.poolCar.upsert({ where: { licensePlate: c.licensePlate }, update: {}, create: c })
  }

  // Seed canteen daily entries (Apr-26 data, first 10 days)
  const dates: Date[] = []
  const startDate = new Date("2026-04-01")
  for (let i = 0; i < 10; i++) {
    dates.push(new Date(startDate.getTime() + i * 86400000))
  }
  const entryData = [
    { rice: 42000, beef: 40600, chicken: 9828.5, fish: 4030, veg: 4060, oil: 16962, spices: 7500, flour: 9600, dal: 1530, sugar: 7720, breadCake: 11280, milk: 8600, eggs: 990, others: 579, staffSalary: 200000, breakfastToken: 35, lunchDinnerToken: 62 },
    { rice: 35000, beef: 40600, chicken: 10728, fish: 5065, veg: 2220, oil: 16962, spices: 23750, flour: 2340, dal: 1640, sugar: 1305, breadCake: 0, milk: 0, eggs: 589, others: 579, staffSalary: 200000, breakfastToken: 40, lunchDinnerToken: 58 },
    { rice: 0, beef: 0, chicken: 6187.5, fish: 3205, veg: 1310, oil: 31500, spices: 0, flour: 0, dal: 0, sugar: 765, breadCake: 0, milk: 0, eggs: 465, others: 440, staffSalary: 0, breakfastToken: 28, lunchDinnerToken: 45 },
    { rice: 0, beef: 0, chicken: 7362, fish: 4838, veg: 1175, oil: 0, spices: 410, flour: 0, dal: 0, sugar: 540, breadCake: 0, milk: 0, eggs: 299, others: 278, staffSalary: 0, breakfastToken: 32, lunchDinnerToken: 50 },
    { rice: 0, beef: 0, chicken: 10152, fish: 4540, veg: 1550, oil: 0, spices: 3060, flour: 820, dal: 0, sugar: 8500, breadCake: 1620, milk: 0, eggs: 552, others: 535, staffSalary: 0, breakfastToken: 30, lunchDinnerToken: 55 },
    { rice: 0, beef: 0, chicken: 12656, fish: 6175, veg: 1385, oil: 0, spices: 1000, flour: 0, dal: 0, sugar: 1080, breadCake: 0, milk: 0, eggs: 557, others: 539, staffSalary: 0, breakfastToken: 38, lunchDinnerToken: 60 },
    { rice: 0, beef: 0, chicken: 9009, fish: 5760, veg: 1550, oil: 0, spices: 1770, flour: 0, dal: 0, sugar: 1845, breadCake: 0, milk: 0, eggs: 587, others: 557, staffSalary: 0, breakfastToken: 42, lunchDinnerToken: 48 },
    { rice: 0, beef: 0, chicken: 12000, fish: 4630, veg: 11850, oil: 0, spices: 5936, flour: 0, dal: 0, sugar: 8600, breadCake: 900, milk: 0, eggs: 564, others: 543, staffSalary: 0, breakfastToken: 36, lunchDinnerToken: 52 },
    { rice: 0, beef: 42000, chicken: 7140, fish: 1610, veg: 2134, oil: 0, spices: 3700, flour: 820, dal: 0, sugar: 1575, breadCake: 0, milk: 0, eggs: 593, others: 586, staffSalary: 0, breakfastToken: 33, lunchDinnerToken: 55 },
    { rice: 0, beef: 0, chicken: 5110, fish: 0, veg: 1608, oil: 0, spices: 0, flour: 0, dal: 0, sugar: 8600, breadCake: 900, milk: 0, eggs: 563, others: 533, staffSalary: 0, breakfastToken: 29, lunchDinnerToken: 47 },
  ]
  for (let i = 0; i < dates.length && i < entryData.length; i++) {
    await prisma.canteenDailyEntry.upsert({ where: { date: dates[i] }, update: {}, create: { date: dates[i], ...entryData[i] } })
  }

  // Seed monthly summary for Apr-26
  await prisma.canteenMonthlySummary.upsert({ where: { monthYear: "2026-04" }, update: {}, create: { monthYear: "2026-04", scrapSale: 15040, totalToken: 15954.25 } })

  // Seed pool car daily entries with driver assignments
  const dbCars = await prisma.poolCar.findMany()
  const driverList = ["Sajib", "Bijoy", "Habib", "Omar", "Sahin"]
  const monthDays = 30
  const poolDates = Array.from({ length: monthDays }, (_, i) => new Date("2026-04-01T00:00:00Z").getTime() + i * 86400000)

  for (const car of dbCars) {
    for (const ts of poolDates.slice(0, 15)) { // 15 days of entries
      const day = new Date(ts)
      const driverName = driverList[Math.floor(Math.random() * driverList.length)]
      await prisma.poolCarDailyEntry.upsert({
        where: { date_carId: { date: day, carId: car.id } },
        update: {},
        create: {
          date: day,
          carId: car.id,
          driverId: driverIds[driverName],
          kmPerDay: Math.floor(Math.random() * 60) + 10,
          maintenanceCost: Math.floor(Math.random() * 3000) + 200,
          octaneCost: car.fuelType === "OCTANE" ? Math.floor(Math.random() * 5000) + 500 : 0,
          dieselCost: car.fuelType === "DIESEL" ? Math.floor(Math.random() * 8000) + 1000 : 0,
          cngCost: car.fuelType === "CNG" ? Math.floor(Math.random() * 2000) + 200 : 0,
          lpgCost: car.fuelType === "LPG" ? Math.floor(Math.random() * 3000) + 300 : 0,
          othersCost: Math.floor(Math.random() * 500) + 50,
          driverOtHours: Math.floor(Math.random() * 4) + 1,
        },
      })
    }
  }

  console.log("Seed complete - 15 cars, 5 drivers, Apr-26 data")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })
