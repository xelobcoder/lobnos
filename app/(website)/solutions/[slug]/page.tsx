import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "../../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../../website/components/ui/SectionHeading";
import { features, solutions } from "../../../../website/data/content";
import Image from "next/image";
import { productScreens } from "../../../../website/data/product-screens";
import { AnalyticsShowcase } from "../../../../website/components/marketing/AnalyticsShowcase";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return solutions.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) return {};
  return { title: solution.shortTitle, description: solution.summary, alternates: { canonical: `/solutions/${slug}` }, openGraph: { title: solution.shortTitle, description: solution.summary, type: "website" } };
}

export default async function SolutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const solution = solutions.find((item) => item.slug === slug);
  if (!solution) notFound();
  const otherSolutions = solutions.filter((item) => item.slug !== slug).slice(0, 3);
  const relatedFeatures = features.filter(feature => solution.featureNumbers?.includes(feature.number));
  const screen = productScreens.find(item => item.solutions.includes(slug));
  return <>
    <PageIntro eyebrow={solution.eyebrow} title={solution.title} description={solution.intro} />
    {slug === "laboratory-analytics" && <AnalyticsShowcase />}
    <section className="section"><div className="wrap detail-layout"><div className="detail-main"><SectionHeading eyebrow="WORKFLOWS TO EXPLORE" title="See where this fits in your day-to-day." copy={solution.summary} /><ul className="check-list">{solution.workflows.map((workflow) => <li key={workflow}><span>✓</span>{workflow}</li>)}</ul>{solution.caveat && <p className="disclaimer-box"><b>Scope note</b>{solution.caveat}</p>}</div><aside className="detail-aside"><span className="eyebrow">OPERATIONAL VALUE</span><h2>Make everyday activity easier to follow.</h2><ul>{solution.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul><Link className="button button-dark" href="/request-demo">Discuss your requirements <span aria-hidden="true">↗</span></Link></aside></div></section>
    {relatedFeatures.length > 0 && <section className="section"><div className="wrap"><SectionHeading eyebrow="INSIDE THE SOFTWARE" title="Explore the supporting workflows and benefits." /><div className="capability-jump-links">{relatedFeatures.map(feature => <Link key={feature.number} href={`/features#capability-${feature.number}`}>{feature.title}</Link>)}</div></div></section>}
    {screen && <section className="section solution-product-screen"><div className="wrap"><SectionHeading eyebrow="ACTUAL PLS INTERFACE" title={screen.title} copy={screen.description} /><Link href={`/product-tour#screen-${screen.id}`}><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 850px) 100vw, 80vw" /></Link><p className="section-footnote">{screen.provenance}</p></div></section>}
    <section className="section"><div className="wrap"><Link className="text-link" href="/features#software-capabilities">Explore the complete software catalog <span aria-hidden="true">→</span></Link></div></section>
    <section className="section related-section"><div className="wrap"><div className="section-topline"><SectionHeading eyebrow="RELATED CAPABILITIES" title="More of the platform." /><Link className="text-link" href="/solutions">All solutions →</Link></div><div className="related-grid">{otherSolutions.map((item) => <Link key={item.slug} href={`/solutions/${item.slug}`}><span>{item.eyebrow}</span><b>{item.shortTitle}</b><span aria-hidden="true">↗</span></Link>)}</div></div></section>
  </>;
}
