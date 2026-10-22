import SpecimenLifecycleWorkspace from '../../../../components/phelobotomy/SpecimenLifecycleWorkspace';

export default function SpecimenStoragePage({ searchParams }: { searchParams?: { sampleId?: string; action?: string } }) {
    const sampleId = Number(searchParams?.sampleId);
    return <SpecimenLifecycleWorkspace initialSampleId={Number.isSafeInteger(sampleId) && sampleId > 0 ? sampleId : undefined} initialAction={searchParams?.action === 'store' ? 'store' : undefined} />;
}
