export default function AdminLoading() {
  return (
    <div className="space-y-6 py-2">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-black/10" />
      <div className="h-4 w-72 animate-pulse rounded-lg bg-black/10" />
      <div className="mt-6 space-y-3">
        <div className="h-12 animate-pulse rounded-xl bg-black/10" />
        <div className="h-12 animate-pulse rounded-xl bg-black/10" />
        <div className="h-12 animate-pulse rounded-xl bg-black/10" />
      </div>
    </div>
  )
}
