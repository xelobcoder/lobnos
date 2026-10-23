import PublicQueueCheckIn from '../../../components/queue/PublicQueueCheckIn';


export default async function QueueCheckInPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    return <PublicQueueCheckIn slug={params.slug} />;
}
