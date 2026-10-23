import { redirect } from 'next/navigation';
export default function FollowupsPage({ params }: { params: { id: string } }) { redirect('/crm/acquisition?prospect=' + encodeURIComponent(params.id)); }
