import type { Metadata } from "next";
import Link from "next/link";
import { analyticsAreas, analyticsScreenIds } from "../../../../website/data/analytics";
import { productScreens } from "../../../../website/data/product-screens";
import { ActualProductGallery } from "../../../../website/components/marketing/ActualProductGallery";
import { PageIntro } from "../../../../website/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "PLS analytics & reporting",
  description: "Explore PLS analytics for test volumes, sales, outstanding payments, outsourcing, expenses, patients, clinicians, inventory, commissions, payroll, pharmacy, imaging and compliance. See actual demo dashboards.",
  alternates: { canonical: "/website/analytics" },
};

export default function AnalyticsPage() {
  const screens = analyticsScreenIds.map(id => {
    const screen = productScreens.find(item => item.id === id);
    if (!screen) throw new Error(`Missing analytics screenshot: ${id}`);
    return screen;
  });
  const reportCount = analyticsAreas.reduce((total, area) => total + area.reports.length, 0);
  return (
    <>
      <PageIntro eyebrow="PLS ANALYTICS & REPORTING" title="See the whole operation. Then go deeper." description={`Explore ${analyticsAreas.length} reporting areas and ${reportCount} report views and metric groups, from investigation volumes to payroll and outsourced-service profitability.`} action={false} />
      <section className="section analytics-screen-section" id="analytics-screens" aria-labelledby="analytics-screens-title">
        <div className="wrap">
          <div className="analytics-section-heading"><div><span className="eyebrow">REAL DASHBOARDS & REPORTS</span><h2 id="analytics-screens-title">{screens.length} actual analytics &amp; reporting screens.</h2><p>Inspect sales charts, test-volume analysis, patient demographics, outsourcing, expenses, payroll, commissions, pharmacy and inventory. These are unchanged demo-page captures, with the original application header, navigation and displayed values—not invented charts.</p></div><a className="text-link" href="#analytics-coverage">Browse every reporting area <span aria-hidden="true">↓</span></a></div>
          <ActualProductGallery id="analytics-gallery" screens={screens} eager />
          <p className="analytics-capture-note">Screenshots illustrate selected available reporting pages, not every report listed below. Full-size originals are available in the viewer.</p>
        </div>
      </section>
      <section className="section analytics-coverage" id="analytics-coverage" aria-labelledby="analytics-coverage-title">
        <div className="wrap">
          <div className="analytics-section-heading"><div><span className="eyebrow">THE REPORTING DEPTH BEHIND THE DASHBOARDS</span><h2 id="analytics-coverage-title">{analyticsAreas.length} areas. Detailed reports, not just totals.</h2><p>Choose an area to see the report views and metric groups present in the current software.</p></div><Link className="text-link" href="/features#software-analytics-reporting">View the capability catalog <span aria-hidden="true">→</span></Link></div>
          <nav className="analytics-area-strip" aria-label="Jump to an analytics area">{analyticsAreas.map(area => <a key={area.id} href={`#analytics-${area.id}`}>{area.title}</a>)}</nav>
          <div className="analytics-report-grid">
            {analyticsAreas.map((area, index) => (
              <article className="analytics-report-card" id={`analytics-${area.id}`} key={area.id}>
                <div className="analytics-report-top"><span className="analytics-report-number">{String(index + 1).padStart(2, "0")}</span><span className="eyebrow">{area.category} reporting</span></div>
                <h3>{area.title}</h3><p>{area.description}</p>
                <ul>{area.reports.map(report => <li key={report}><span aria-hidden="true">✓</span>{report}</li>)}</ul>
                {area.screenIds && <Link className="text-link" href={`/product-tour#screen-${area.screenIds[0]}`}>See the actual dashboard <span aria-hidden="true">→</span></Link>}
              </article>
            ))}
          </div>
          <aside className="analytics-scope"><strong>Reporting scope & interpretation</strong><p>Reports use recorded facility data and the filters available in each workspace. Access depends on roles, enabled modules and configuration. These descriptions do not promise predictive AI, budget planning, clinical decision support or accreditation. Metric definitions and the reporting period should be reviewed when interpreting results.</p><p>Financial statements, ledger reports and communications activity add further reporting views alongside these {analyticsAreas.length} areas.</p><Link className="button" href="/request-demo">Request an analytics walkthrough <span aria-hidden="true">↗</span></Link></aside>
        </div>
      </section>
    </>
  );
}
