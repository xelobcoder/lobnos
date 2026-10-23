import { redirect } from 'next/navigation';
export default function LegacyLeadPage({ searchParams }: { searchParams: { id?: string } }) { redirect(searchParams.id ? '/crm/acquisition?prospect=' + encodeURIComponent(searchParams.id) : '/crm/acquisition?new=1'); }
