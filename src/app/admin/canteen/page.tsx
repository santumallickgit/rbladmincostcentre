import CanteenDailyForm from "@/components/admin/CanteenDailyForm"

export default function AdminCanteenPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Canteen Data Entry</h1>
      <CanteenDailyForm />
    </div>
  )
}
