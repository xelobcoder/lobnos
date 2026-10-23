import SpecimenLifecycleWorkspace from '../../../../components/phelobotomy/SpecimenLifecycleWorkspace';


export default async function SpecimenStoragePage(props: { searchParams?: Promise<{ sampleId?: string; action?: string }> }) {
    const searchParams = await props.searchParams;
    const sampleId = Number(searchParams?.sampleId);
    return <SpecimenLifecycleWorkspace initialSampleId={Number.isSafeInteger(sampleId) && sampleId > 0 ? sampleId : undefined} initialAction={searchParams?.action === 'store' ? 'store' : undefined} />;
}
