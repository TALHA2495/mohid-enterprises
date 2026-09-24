import type { Metadata } from 'next'
import Image from 'next/image'
import { Lock } from 'lucide-react'

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
    <main id="main" className="flex min-h-screen items-center justify-center bg-[#f4f7f8] p-5 text-black">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-black/10 bg-white shadow-xl">
        <div aria-hidden="true" className="h-1.5 w-full bg-gradient-to-r from-[#01aa3f] to-[#00ff59]" />
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/images/LOGO MOHID.webp"
              alt="Mohid Enterprises logo"
              width={96}
              height={26}
              priority
              className="h-7 w-auto"
            />
          </div>
          <div className="mb-4 flex items-center gap-2 text-[#01aa3f]">
            <Lock aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            <p className="font-sans text-[10px] uppercase tracking-[0.15em] text-[#007a2b]">Restricted</p>
          </div>
          <h1 className="font-sans mb-1 text-2xl text-black">Admin sign-in</h1>
          <p className="mb-5 text-xs text-black/60">Mohid Enterprises operations dashboard</p>
          {adminConfigured ? null : (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-normal text-red-800">
              <p className="font-semibold">ADMIN_PASSWORD is not set in this environment.</p>
              <p className="mt-1 text-red-700">
                Add it in Vercel under Settings, Environment Variables (tick Production and Preview) and redeploy, or
                set it in <code className="font-sans">.env.local</code> for local development.
              </p>
            </div>
          )}
          <AdminLoginForm />
        </div>
      </div>
    </main>
  )
}
