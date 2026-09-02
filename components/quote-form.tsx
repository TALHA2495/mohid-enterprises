'use client'

import { useState } from 'react'

export function QuoteForm() {
  const [sent, setSent] = useState(false)
  return <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="grid gap-4">
    <label className="grid gap-1 text-xs font-medium">Inquiry details<textarea required rows={4} placeholder="Tell us about your material, width, color, or trimming specifications..." className="mt-1 resize-none rounded-lg border border-[#cbd8d5] bg-white p-3 text-sm font-normal outline-none focus:border-emerald-500" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-xs font-medium">Company name<input required className="rounded-lg border border-[#cbd8d5] bg-white p-3 text-sm font-normal outline-none focus:border-emerald-500" /></label><label className="grid gap-1 text-xs font-medium">Work email<input required type="email" className="rounded-lg border border-[#cbd8d5] bg-white p-3 text-sm font-normal outline-none focus:border-emerald-500" /></label></div>
    <label className="grid gap-1 text-xs font-medium">Additional notes<textarea rows={3} className="resize-none rounded-lg border border-[#cbd8d5] bg-white p-3 text-sm font-normal outline-none focus:border-emerald-500" /></label>
    <button type="submit" className="rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-black hover:bg-emerald-400">{sent ? 'Request received' : 'Submit request'}</button>
  </form>
}
