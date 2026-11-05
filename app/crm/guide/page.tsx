import WorkspaceLearningCenter from '../../../components/learning/WorkspaceLearningCenter';
export default async function GuidePage({searchParams}:{searchParams:Promise<{view?:string}>}) {
    const params=await searchParams;
    return <WorkspaceLearningCenter moduleId="crm" view={params.view==='guides'?'guides':'manual'}/>;
}
