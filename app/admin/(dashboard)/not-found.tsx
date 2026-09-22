import Link from 'next/link'

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center py-10">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-8 text-center">
        <h1 className="mb-2 text-3xl font-semibold">404</h1>
        <p className="mb-6 text-sm font-normal text-black/60">
          This admin page does not exist yet — or it moved.
        </p>
        <Link
          href="/admin"
          className="inline-block rounded-full bg-[#01aa3f] px-6 py-2.5 text-sm font-medium text-black transition-colors hover:bg-[#00ff59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00c853]"
        >
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}
