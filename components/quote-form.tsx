'use client'

import { useState } from 'react'

export function QuoteForm() {
  const [sent, setSent] = useState(false)
  return <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="grid gap-4">
    <label className="grid gap-1 text-xs font-medium text-white/90">Inquiry details<textarea required rows={4} placeholder="Tell us about your material, width, color, or trimming specifications..." className="mt-1 resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-normal text-white outline-none placeholder:text-white/35 focus:border-[#00c853]" /></label>
    <div className="grid gap-4 sm:grid-cols-2"><label className="grid gap-1 text-xs font-medium text-white/80">Company name<input required className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-normal text-white outline-none focus:border-[#00c853]" /></label><label className="grid gap-1 text-xs font-medium text-white/80">Work email<input required type="email" className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-normal text-white outline-none focus:border-[#00c853]" /></label></div>
    <label className="grid gap-1 text-xs font-medium text-white/90">Additional notes<textarea rows={3} className="resize-none rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm font-normal text-white outline-none focus:border-[#00c853]" /></label>
    <button type="submit" className="rounded-lg bg-[#01aa3f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#00ff59]">{sent ? 'Request received' : 'Submit request'}</button>
  </form>
}