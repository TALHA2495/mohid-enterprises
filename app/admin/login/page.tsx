import type { Metadata } from 'next'

import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const metadata: Metadata = {
  title: 'Admin sign-in | Mohid Enterprises',
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f7f8] p-5 text-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6">
        <h1 className="mb-1 text-lg font-semibold">Admin sign-in</h1>
        <p className="mb-5 text-xs font-normal text-black/60">
          Mohid Enterprises operations dashboard
        </p>
        <AdminLoginForm />
      </div>
    </main>
  )
}
