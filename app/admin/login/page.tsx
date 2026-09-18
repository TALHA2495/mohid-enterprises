import type { Metadata } from 'next'

import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = {
  title: 'Admin sign-in | Mohid Enterprises',
}

// Read ADMIN_PASSWORD per request. A statically prerendered page would freeze
// the build-time state and hide a variable that is missing at runtime.
export const dynamic = 'force-dynamic'

export default function AdminLoginPage() {
  const adminConfigured = Boolean(process.env.ADMIN_PASSWORD)

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f8] p-5 text-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="mb-1 text-lg font-semibold">Admin sign-in</h1>
        <p className="mb-5 text-xs font-normal text-black/60">
          Mohid Enterprises operations dashboard
        </p>
        {adminConfigured ? null : (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-normal text-red-800">
            <p className="font-semibold">ADMIN_PASSWORD is not set in this environment.</p>
            <p className="mt-1 text-red-700">
              Add it in Vercel under Settings, Environment Variables (tick Production and Preview) and redeploy, or set
              it in <code className="font-mono">.env.local</code> for local development.
            </p>
          </div>
        )}
        <AdminLoginForm />
      </div>
    </main>
  )
}
