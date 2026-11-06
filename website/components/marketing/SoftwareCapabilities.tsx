import Link from "next/link";
import { softwareCapabilityGroups } from "../../data/software-capabilities";
import { SoftwareCapabilityExplorer, type PublicCapabilityGroup } from "./SoftwareCapabilityExplorer";

export function SoftwareCapabilities() {
  const groups: PublicCapabilityGroup[] = softwareCapabilityGroups.map(group => ({
    id: group.id,
    title: group.title,
    description: group.description,
    capabilities: group.capabilities.map(capability => ({
      id: capability.id,
      title: capability.title,
      summary: capability.summary,
      workflows: capability.workflows,
      scope: capability.scope,
      route: capability.route,
    })),
  }));
  const capabilityCount = groups.reduce((count, group) => count + group.capabilities.length, 0);
  return (
    <section className="section software-catalog" id="software-capabilities" aria-labelledby="software-catalog-title">
      <div className="wrap">
        <div className="software-catalog-intro">
          <span className="eyebrow">THE FULL SOFTWARE CATALOG</span>
          <h2 id="software-catalog-title">Find the tools your team needs.</h2>
          <p>Browse {groups.length} workflow areas or search {capabilityCount} capabilities. Expand an area to see supported actions and configuration requirements.</p>
          <Link className="text-link" href="/product-tour">See real PLS workspaces <span aria-hidden="true">→</span></Link>
        </div>
        <SoftwareCapabilityExplorer groups={groups} />
        <div className="software-scope-banner"><strong>Software capability is not a deployment promise.</strong><p>Access depends on enabled modules, staff permissions and facility configuration. Provider-backed payments, messaging and instrument connections require setup and acceptance. Ask for a demonstration of the workflows relevant to your facility before agreeing scope.</p><Link className="button" href="/request-demo">Plan your demonstration <span aria-hidden="true">↗</span></Link></div>
      </div>
    </section>
  );
}

export function SoftwareCoverageOverview() {
  const capabilities = softwareCapabilityGroups.flatMap(group => group.capabilities);
  const workflows = capabilities.reduce((count, capability) => count + capability.workflows.length, 0);
  return (
    <section className="section coverage-overview" aria-labelledby="coverage-overview-title">
      <div className="wrap">
        <div className="section-topline">
          <div className="section-heading"><span className="eyebrow">NOT JUST THE LABORATORY BENCH</span><h2 id="coverage-overview-title">The full operation, in one feature catalog.</h2><p>Clinical work, supply custody, business operations and customer access are all part of PLS. Explore the details rather than guess from a module name.</p></div>
          <Link className="button button-outline" href="/features#software-capabilities">View every capability <span aria-hidden="true">→</span></Link>
        </div>
        <dl className="coverage-metrics"><div><dt>Workflow areas</dt><dd>{softwareCapabilityGroups.length}</dd></div><div><dt>Software capabilities</dt><dd>{capabilities.length}</dd></div><div><dt>Documented actions</dt><dd>{workflows}</dd></div></dl>
        <div className="coverage-area-grid">{softwareCapabilityGroups.map(group => <Link key={group.id} href={`/features#software-${group.id}`}><span>{group.capabilities.length} capabilities</span><h3>{group.title}</h3><p>{group.description}</p><strong>Explore workflows <span aria-hidden="true">→</span></strong></Link>)}</div>
      </div>
    </section>
  );
}
