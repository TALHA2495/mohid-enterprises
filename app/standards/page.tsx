import { StandardsPage } from '@/components/standards-page'

// The certificate gallery is DB-driven (certificates), so revalidate instead of
// freezing the page at build time — an admin edit appears within a minute.
export const revalidate = 60

export default function Page() { return <StandardsPage /> }
