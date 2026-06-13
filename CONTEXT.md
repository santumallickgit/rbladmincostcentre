# RBL Cost Center - Project Context

## Tech Stack
- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v3 + Shadcn UI (base-ui)
- Prisma 6 + SQLite (DB at prisma/dev.db)
- Recharts (charts)
- jose (JWT auth, no NextAuth)
- xlsx (Excel export)

## Auth (hardcoded)
- Admin: rbl_admin / 12345678
- Viewer: rbl_users / 1234
- Simple JWT in httpOnly cookie, no NextAuth

## DB Schema (prisma/schema.prisma)
- User, CanteenDailyEntry, CanteenMonthlySummary
- Driver (name, color), PoolCar (fuelType, costCenterCode)
- PoolCarDailyEntry (driverId FK, date+carId unique)

## Seed data
- 15 real pool cars, 5 drivers (Sajib/Bijoy/Habib/Omar/Sahin with colors)
- 10 days of Apr-26 canteen entries matching Excel
- 15 days of pool car entries per car with random driver assignment

## Routes
### Pages
- /login - login form
- /dashboard - overview KPI cards
- /dashboard/canteen - area chart + stacked bar + 4 KPIs
- /dashboard/poolcar - multi-line + h-bar + scatter + driver color-coded cards
- /admin/canteen - daily entry form (15 item fields)
- /admin/poolcar - daily entry with car + driver + fuel fields
- /admin/poolcar/cars - CRUD table with fuel type

### API
- POST /api/auth/login - returns JWT cookie
- POST /api/auth/logout - clears cookie
- GET /api/auth/me - returns current user
- GET/POST /api/canteen/daily - CRUD daily entries
- GET/POST /api/canteen/summary - monthly summary + calculations
- GET/POST/DELETE /api/poolcar/cars - car CRUD
- GET/POST/DELETE /api/poolcar/daily - entry CRUD (includes driver)
- GET /api/poolcar/drivers - driver list
- GET /api/export?type=canteen|poolcar&month=2026-04 - returns .xlsx

## Export
- /api/export generates real .xlsx files matching the original Excel format
- Canteen: Summary sheet + Daily sheet
- Pool Car: Report sheet + per-car sheets with fuel/maintenance breakdown

## Run
```bash
cd F:\Work Files\costcenter
npm run dev
```

## Build
```bash
npm run build
```
