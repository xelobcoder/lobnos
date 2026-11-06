import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "../../../../website/components/ui/PageIntro";
import { resources } from "../../../../website/data/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return resources.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  return resource ? { title: resource.title, description: resource.summary, alternates: { canonical: `/resources/${slug}` }, openGraph: { type: "article", title: resource.title, description: resource.summary } } : {};
}

export default async function ResourceArticle({ params }: Props) {
  const { slug } = await params;
  const resource = resources.find((item) => item.slug === slug);
  if (!resource) notFound();
  return <>
    <PageIntro eyebrow={resource.category} title={resource.title} description={resource.summary} action={false} />
    <article className="section article-section"><div className="article-wrap"><p className="article-lede">Every laboratory has its own operating context. Use this guide to structure a conversation, gather the right information and make implementation assumptions visible.</p>{resource.sections.map((section, i) => <section key={section}><span className="eyebrow">0{i + 1} / PRACTICAL CONSIDERATION</span><h2>{section}</h2><p>{[
      "Begin by documenting who does each step, which information is needed, where decisions happen and how work moves to the next person. A clear current-state map creates a more useful basis for process change.",
      "Agree what each status means and who can move work forward. Shared definitions make hand-offs and operational review easier to understand.",
      "Confirm who can view, enter, review and authorize information. The chosen model should reflect facility policy and the application's supported controls.",
      "Use source records and agreed definitions when reviewing reports. Indicators are only as useful as their scope, data quality and interpretation.",
    ][i % 4]}</p></section>)}<div className="article-note">This material is general guidance. Technical compatibility, clinical governance, implementation scope and regulatory obligations require specific review.</div><Link href="/resources" className="text-link">← Back to resources</Link></div></article>
  </>;
}
