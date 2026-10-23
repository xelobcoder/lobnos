import { redirect } from 'next/navigation';


export default async function FollowupsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  redirect('/crm/acquisition?prospect=' + encodeURIComponent(params.id));
}
