import QueueDisplay from '../../../../components/queue/QueueDisplay';

export default function PublicQueueDisplayPage({ params }: { params: { slug: string } }) {
    return <QueueDisplay slug={params.slug} />;
}
