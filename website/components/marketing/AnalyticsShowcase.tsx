import Image from "next/image";
import Link from "next/link";
import { analyticsAreas } from "../../data/analytics";
import { productScreens } from "../../data/product-screens";

const previewIds = ["sales-weekly", "sales-monthly", "outsourcing-monthly"];

export function AnalyticsShowcase() {
  return (
    <section className="section analytics-showcase" aria-labelledby="analytics-showcase-title">
      <div className="wrap">
        <div className="section-topline">
          <div className="section-heading"><span className="eyebrow">ANALYTICS ACROSS THE WHOLE OPERATION</span><h2 id="analytics-showcase-title">More than a dashboard. A reporting toolkit.</h2><p>Explore {analyticsAreas.length} reporting areas: test volumes, sales, outstanding balances, outsourcing, expenses, patients, clinicians, commissions, inventory, payroll and more.</p></div>
          <Link className="button" href="/website/analytics">Explore PLS analytics <span aria-hidden="true">→</span></Link>
        </div>
        <div className="analytics-preview-grid">
          {previewIds.map(id => {
            const screen = productScreens.find(item => item.id === id);
            if (!screen) throw new Error(`Missing analytics preview screenshot: ${id}`);
            return <Link className="analytics-preview-card" href={`/product-tour#screen-${screen.id}`} key={id}><div className="analytics-preview-image"><Image src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 850px) 100vw, 33vw" /></div><div><span className="eyebrow">ACTUAL DEMO SOFTWARE</span><h3>{screen.label}</h3><p>{screen.description}</p><span className="text-link">Inspect the full page <span aria-hidden="true">→</span></span></div></Link>;
          })}
        </div>
        <div className="analytics-area-strip" aria-label="Analytics coverage">{analyticsAreas.map(area => <Link key={area.id} href={`/analytics#analytics-${area.id}`}>{area.title}</Link>)}</div>
      </div>
    </section>
  );
}
