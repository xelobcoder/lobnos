import PublicQueueCheckIn from '../../../components/queue/PublicQueueCheckIn';

export default function QueueCheckInPage({ params }: { params: { slug: string } }) {
    return <PublicQueueCheckIn slug={params.slug} />;
}
