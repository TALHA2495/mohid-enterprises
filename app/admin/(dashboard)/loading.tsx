export default function AdminLoading() {
  return (
    <main className="min-h-screen bg-[#f4f7f8] p-8 text-black">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-black/10" />
        <div className="h-4 w-72 animate-pulse rounded-lg bg-black/10" />
        <div className="mt-6 space-y-3">
          <div className="h-12 animate-pulse rounded-xl bg-black/10" />
          <div className="h-12 animate-pulse rounded-xl bg-black/10" />
          <div className="h-12 animate-pulse rounded-xl bg-black/10" />
        </div>
      </div>
    </main>
  )
}
