-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenDailyEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "beef" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "chicken" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fish" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "veg" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "oil" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spices" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "flour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sugar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breadCake" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "milk" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "eggs" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "others" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "staffSalary" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "breakfastToken" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lunchDinnerToken" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CanteenDailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CanteenMonthlySummary" (
    "id" TEXT NOT NULL,
    "monthYear" TEXT NOT NULL,
    "scrapSale" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalToken" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "CanteenMonthlySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolCar" (
    "id" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "costCenterName" TEXT NOT NULL,
    "costCenterCode" TEXT,
    "fuelType" TEXT NOT NULL DEFAULT 'OCTANE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "PoolCar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PoolCarDailyEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "carId" TEXT NOT NULL,
    "driverId" TEXT,
    "kmPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maintenanceCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "octaneCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "dieselCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cngCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lpgCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "othersCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "driverOtHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    CONSTRAINT "PoolCarDailyEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "CanteenDailyEntry_date_key" ON "CanteenDailyEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CanteenMonthlySummary_monthYear_key" ON "CanteenMonthlySummary"("monthYear");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_name_key" ON "Driver"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PoolCar_licensePlate_key" ON "PoolCar"("licensePlate");

-- CreateIndex
CREATE UNIQUE INDEX "PoolCarDailyEntry_date_carId_key" ON "PoolCarDailyEntry"("date", "carId");

-- AddForeignKey
ALTER TABLE "PoolCarDailyEntry" ADD CONSTRAINT "PoolCarDailyEntry_carId_fkey" FOREIGN KEY ("carId") REFERENCES "PoolCar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PoolCarDailyEntry" ADD CONSTRAINT "PoolCarDailyEntry_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
