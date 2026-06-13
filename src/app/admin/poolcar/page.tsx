import PoolCarDayForm from "@/components/admin/PoolCarDayForm"

export default function AdminPoolCarPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Pool Car Data Entry</h1>
      <PoolCarDayForm />
    </div>
  )
}
