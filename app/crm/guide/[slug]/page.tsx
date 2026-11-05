import WorkspaceLearningCenter from '../../../../components/learning/WorkspaceLearningCenter';
export default async function GuideArticle({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; return <WorkspaceLearningCenter moduleId="crm" slug={slug}/>; }
