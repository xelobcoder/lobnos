import Link from "next/link";
import { features, featureGroups } from "../../data/content";

export function WorkflowCapabilities() {
  return (
    <section className="section feature-section" aria-labelledby="workflow-capabilities-title">
      <div className="wrap">
        <div className="workflow-overview-header">
          <div>
            <span className="eyebrow">ONE PLATFORM. CONNECTED WORKFLOWS.</span>
            <h2 id="workflow-capabilities-title">The tools to run your laboratory, <em>working together.</em></h2>
            <p>Configure your tests and reports, register clinicians and organizations, apply their tariffs and follow laboratory, financial and referral work. Each capability below links to the workflows and benefits behind it.</p>
          </div>
          <Link className="button button-light" href="/features">Explore all capabilities <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="workflow-overview-groups">
          {featureGroups.map((group, index) => {
            const items = features.filter(({ number }) => group.numbers.includes(number));
            const headingId = `workflow-group-${index + 1}`;
            return (
              <section className="workflow-overview-group" key={group.title} aria-labelledby={headingId}>
                <div className="workflow-group-intro">
                  <span className="workflow-group-count">{items.length} capabilities</span>
                  <h3 id={headingId}>{group.title}</h3>
                  <p>{group.copy}</p>
                </div>
                <ul className="workflow-overview-cards">
                  {items.map((feature) => (
                    <li key={feature.number}>
                      <article className="workflow-overview-card">
                        <div className="workflow-card-label"><span className="workflow-card-icon" aria-hidden="true">{feature.icon}</span><span>{feature.tag}</span></div>
                        <h4>{feature.title}</h4>
                        <p>{feature.copy}</p>
                        <Link className="text-link" href={`/features#capability-${feature.number}`}>See workflows &amp; benefits <span className="sr-only">for {feature.title}</span><span aria-hidden="true">→</span></Link>
                      </article>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
        <p className="workflow-overview-note">{features.length} capabilities across {featureGroups.length} workflow areas. Availability depends on configuration, permissions, deployment and agreed scope.</p>
      </div>
    </section>
  );
}
