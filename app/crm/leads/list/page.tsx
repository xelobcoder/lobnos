import { redirect } from 'next/navigation';


export default async function LegacyLeadPage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  redirect(searchParams.id ? '/crm/acquisition?prospect=' + encodeURIComponent(searchParams.id) : '/crm/acquisition?tab=prospects');
}
