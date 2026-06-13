export type UserRole = "ADMIN" | "VIEWER"

export type CanteenDailyEntry = {
  id: string
  date: string
  rice: number
  beef: number
  chicken: number
  fish: number
  veg: number
  oil: number
  spices: number
  flour: number
  dal: number
  sugar: number
  breadCake: number
  milk: number
  eggs: number
  others: number
  staffSalary: number
  breakfastToken: number
  lunchDinnerToken: number
}

export type CanteenMonthlySummary = {
  id: string
  monthYear: string
  scrapSale: number
  totalToken: number
}

export type Driver = {
  id: string
  name: string
  color: string
  isActive: boolean
}

export type PoolCar = {
  id: string
  licensePlate: string
  costCenterName: string
  costCenterCode: string | null
  fuelType: string
  isActive: boolean
}

export type PoolCarDailyEntry = {
  id: string
  date: string
  carId: string
  car?: PoolCar
  driverId?: string | null
  driver?: Driver | null
  kmPerDay: number
  maintenanceCost: number
  octaneCost: number
  dieselCost: number
  cngCost: number
  lpgCost: number
  othersCost: number
  driverOtHours: number
}
