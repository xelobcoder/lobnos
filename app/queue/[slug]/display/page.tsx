import QueueDisplay from '../../../../components/queue/QueueDisplay';


export default async function PublicQueueDisplayPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    return <QueueDisplay slug={params.slug} />;
}
