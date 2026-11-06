import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { SectionHeading } from "../../../website/components/ui/SectionHeading";
import { resources } from "../../../website/data/content";

export const metadata: Metadata = { title: "Laboratory resources", description: "Practical guidance for laboratory workflow planning, software evaluation and analyzer integration readiness.", alternates: { canonical: "/resources" } };

export default function ResourcesPage() {
  return <>
    <PageIntro eyebrow="PLS RESOURCES" title="Useful thinking for better laboratory workflows." description="Explore practical guides to workflow digitization, software evaluation and integration readiness." action={false} />
    <section className="section resources-library">
      <div className="wrap">
        <div className="section-topline">
          <SectionHeading eyebrow="GUIDES & NOTES" title="Start with questions worth asking." copy="Choose a guide for the next step in your laboratory's planning journey." />
          <span className="resource-count">{resources.length} practical guides</span>
        </div>
        <div className="resource-grid">
          {resources.map((resource, i) => <Link className="resource-card" href={`/resources/${resource.slug}`} key={resource.slug}>
            <div className="resource-card-top">
              <span className="resource-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  {resource.slug === "laboratory-workflow-digitization" ? <><rect x="3" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="16" width="7" height="5" rx="1.5" /><path d="M7 8v10h7M10 5h7v11M3 13h8" /></> :
                    resource.slug === "laboratory-software-evaluation" ? <><rect x="5" y="4" width="14" height="17" rx="2" /><rect x="9" y="2" width="6" height="4" rx="1" /><path d="m8 11 1.5 1.5L12 10m-4 7 1.5 1.5L12 16m3-5h1m-1 6h1" /></> :
                      <><rect x="3" y="8" width="6" height="8" rx="2" /><rect x="15" y="8" width="6" height="8" rx="2" /><path d="M9 12h6M6 5v3m0 8v3M18 5v3m0 8v3" /></>}
                </svg>
              </span>
              <span className="resource-index" aria-hidden="true">0{i + 1}</span>
            </div>
            <span className="eyebrow">{resource.category}</span>
            <h3>{resource.title}</h3>
            <p>{resource.summary}</p>
            <div className="resource-topics">
              <span>Inside this guide</span>
              <ul>{resource.sections.slice(0, 2).map((topic) => <li key={topic}>{topic}</li>)}</ul>
            </div>
            <span className="text-link">Read guide <span aria-hidden="true">→</span></span>
          </Link>)}
        </div>
        <p className="resource-guidance"><span aria-hidden="true">i</span>These resources are educational. Your facility&apos;s technical, clinical and implementation requirements need a specific assessment.</p>
      </div>
    </section>
    <section className="compact-cta"><div className="wrap"><div><span className="eyebrow">PUT YOUR QUESTIONS INTO CONTEXT</span><h2>Plan the next step for your laboratory.</h2></div><Link className="button button-dark" href="/request-demo">Talk through your requirements <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
