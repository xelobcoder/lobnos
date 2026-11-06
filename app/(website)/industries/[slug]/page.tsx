import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "../../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../../website/components/ui/SectionHeading";
import { industries, solutions } from "../../../../website/data/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return industries.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  return industry ? { title: industry.title, description: industry.summary, alternates: { canonical: `/industries/${slug}` } } : {};
}

export default async function IndustryDetail({ params }: Props) {
  const { slug } = await params;
  const industry = industries.find((item) => item.slug === slug);
  if (!industry) notFound();
  return <>
    <PageIntro eyebrow="INDUSTRY WORKFLOW" title={industry.title} description={industry.intro} />
    <section className="section"><div className="wrap industry-detail-layout"><div><SectionHeading eyebrow="WORKFLOWS TO CONSIDER" title="Connect the steps that matter to your team." copy={industry.summary} /><ul className="check-list">{industry.workflows.map((workflow) => <li key={workflow}><span>✓</span>{workflow}</li>)}</ul><p className="disclaimer-box"><b>Fit and scope</b>{industry.considerations}</p></div><aside className="detail-aside"><span className="eyebrow">NEXT STEP</span><h2>Map your requirements with PLS.</h2><p>Discuss your service mix, roles, existing systems and implementation needs with the team.</p><Link className="button button-dark" href="/request-demo">Request a conversation <span aria-hidden="true">↗</span></Link></aside></div>
      <div className="wrap related-industries"><span className="eyebrow">RELEVANT SOLUTIONS</span>{solutions.slice(0, 4).map((solution) => <Link key={solution.slug} href={`/solutions/${solution.slug}`}>{solution.shortTitle}<span aria-hidden="true">↗</span></Link>)}</div>
    </section>
  </>;
}
