import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ActualProductGallery } from "../../../website/components/marketing/ActualProductGallery";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { productScreens } from "../../../website/data/product-screens";

export const metadata: Metadata = {
  title: "Real PLS product screenshots & workspace tour",
  description: "Explore actual Prime Laboratory Software workspaces, the workflows each screen supports and the complete software feature catalog.",
  alternates: { canonical: "/product-tour" },
};

export default function ProductTourPage() {
  return <>
    <PageIntro eyebrow="SEE THE SOFTWARE" title="The current software. Page by page." description="Full pages captured from the PLS demo facility, with the original application header, navigation, content and displayed demo values. No simulated dashboards. No substitute interface." action={false} />
    <section className="section tour-intro"><div className="wrap"><ActualProductGallery id="tour-gallery" eager /><div className="tour-scope"><strong>A public tour, not a patient-record system.</strong><p>These are interface captures, not interactive customer sessions. Screens reflect the configuration and permissions in the captured workspace; availability in your facility depends on agreed scope. The complete catalog covers additional workflows beyond the screens shown here.</p><Link className="text-link" href="/features#software-capabilities">Read the complete feature catalog <span aria-hidden="true">→</span></Link><Link className="text-link" href="/website/analytics">Explore analytics dashboards &amp; reports <span aria-hidden="true">→</span></Link></div></div></section>
    <section className="section screen-library" aria-labelledby="screen-library-title"><div className="wrap">
      <div className="section-heading"><span className="eyebrow">{productScreens.length} ACTUAL PRODUCT VIEWS</span><h2 id="screen-library-title">Explore each workspace in detail.</h2><p>Open an image at full size to inspect the interface. Read the corresponding workflows without relying on a screenshot alone.</p></div>
      <details className="screen-library-index">
        <summary>Jump to a workspace <span>{productScreens.length} screenshots</span></summary>
        <nav aria-label="Product screenshots">{productScreens.map(screen => <a key={screen.id} href={`#screen-${screen.id}`}>{screen.label}</a>)}</nav>
      </details>
      <div className="screen-library-grid">{productScreens.map(screen => <article id={`screen-${screen.id}`} key={screen.id} className="screen-library-card">
        <a href={screen.src} target="_blank" rel="noopener noreferrer" className="screen-library-image" aria-label={`Open full-size ${screen.label} screenshot in a new tab`}><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 850px) 100vw, 50vw" /></a>
        <div className="screen-library-copy"><span className="eyebrow">{screen.label}</span><h3>{screen.title}</h3><p>{screen.description}</p><ul>{screen.workflows.map(workflow => <li key={workflow}>{workflow}</li>)}</ul><small>{screen.provenance}</small></div>
      </article>)}</div>
    </div></section>
    <section className="final-cta"><div className="wrap"><span className="eyebrow">YOUR TEAM. YOUR WORKFLOWS.</span><h2>See the parts of PLS that matter to you.</h2><p>Ask for a demonstration spanning your clinical, supply, financial and customer-facing requirements.</p><Link className="button button-white" href="/request-demo">Request a guided demonstration <span aria-hidden="true">↗</span></Link></div></section>
  </>;
}
