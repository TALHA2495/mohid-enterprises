import { FactoryPage } from '@/components/factory-page'

// The page renders DB-driven photo tiles (factory_sections), so it cannot be
// frozen at build time — otherwise an admin edit would stay invisible until the
// next deploy. 60s keeps ISR cheap while edits propagate within a minute.
export const revalidate = 60

export default function Page() { return <FactoryPage /> }
