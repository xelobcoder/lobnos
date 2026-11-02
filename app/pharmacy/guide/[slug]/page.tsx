import LearningCenter from '../LearningCenter';

export default async function PharmacyArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <LearningCenter slug={slug}/>;
}
