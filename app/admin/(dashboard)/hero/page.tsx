import type { Metadata } from 'next'

import HeroSectionsAdminClient from '@/components/admin/hero-sections-admin-client'
import { missingAdminEnvVars, supabaseAdmin } from '@/lib/supabase-admin.server'
import type { HeroSectionRow } from '@/lib/showroom'

export const metadata: Metadata = {
  title: 'Hero cards | Mohid Enterprises Admin',
}

export const dynamic = 'force-dynamic'

export default async function AdminHeroPage() {
  if (!supabaseAdmin) {
    return (
      <div>
        <p className="rounded-2xl border border-black/10 bg-white p-6 text-sm font-normal">
          <span className="font-semibold">Supabase is not configured.</span>
          {missingAdminEnvVars.length > 0 && (
            <>
              {' '}
              Missing: <code className="font-sans">{missingAdminEnvVars.join(', ')}</code>.
            </>
          )}
        </p>
      </div>
    )
  }

    const { data, error } = await supabaseAdmin
    .from('hero_sections')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return (
      <div>
        <p role="alert" className="rounded-2xl border border-[#c62828]/30 bg-[#c62828]/[0.04] p-6 text-sm font-normal text-[#c62828]">
          Failed to load hero cards: {error.message}
        </p>
      </div>
    )
  }

  const hero = (data ?? []) as HeroSectionRow[]

  return (
    <div>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="section-label mb-4">Hero cards</p>
            <h1 className="font-sans text-4xl leading-tight">Hero cards</h1>
            <p className="mt-2 text-sm font-normal text-black/60">
              {hero.length} card{hero.length === 1 ? '' : 's'} shown on the home page hero. Drag to reorder, or use a
              card's menu to edit or remove it.
            </p>
          </div>
        </div>
        <HeroSectionsAdminClient hero={hero} />
      </div>
  )
}
