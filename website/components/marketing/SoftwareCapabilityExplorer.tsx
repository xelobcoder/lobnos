"use client";

import { useState, useSyncExternalStore } from "react";
import type { SoftwareCapabilityGroup } from "../../data/software-capabilities";
import { productScreens } from "../../data/product-screens";
import Link from "next/link";

export type PublicCapabilityGroup = Omit<SoftwareCapabilityGroup, "capabilities"> & {
  capabilities: Omit<SoftwareCapabilityGroup["capabilities"][number], "evidence">[];
};

function subscribeToHash(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function getHashSnapshot() {
  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

export function filterCapabilityGroups(groups: PublicCapabilityGroup[], search: string) {
  const terms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return groups;
  return groups.map(group => ({
    ...group,
    capabilities: group.capabilities.filter(capability => {
      const text = [group.title, capability.title, capability.summary, ...capability.workflows, capability.scope].join(" ").toLowerCase();
      return terms.every(term => text.includes(term));
    }),
  })).filter(group => group.capabilities.length);
}

export function SoftwareCapabilityExplorer({ groups }: { groups: PublicCapabilityGroup[] }) {
  const [search, setSearch] = useState("");
  const [searchOpenGroups, setSearchOpenGroups] = useState<Set<string>>(() => new Set());
  const [groupOverrides, setGroupOverrides] = useState<{ hash: string; values: Map<string, boolean> }>({ hash: "", values: new Map() });
  const hash = useSyncExternalStore(subscribeToHash, getHashSnapshot, getServerHashSnapshot);
  const hashGroup = groups.find(group => `#software-${group.id}` === hash)?.id;
  const isSearching = Boolean(search.trim());
  const visible = filterCapabilityGroups(groups, search);
  const total = groups.reduce((count, group) => count + group.capabilities.length, 0);
  const count = visible.reduce((sum, group) => sum + group.capabilities.length, 0);

  function isGroupOpen(groupId: string) {
    if (isSearching) return searchOpenGroups.has(groupId);
    if (groupOverrides.hash === hash && groupOverrides.values.has(groupId)) return groupOverrides.values.get(groupId) ?? false;
    return groupId === hashGroup;
  }

  function updateSearch(value: string) {
    setSearch(value);
    setSearchOpenGroups(new Set(value.trim() ? filterCapabilityGroups(groups, value).map(group => group.id) : []));
  }

  function setGroupOpen(groupId: string, isOpen: boolean) {
    if (isSearching) {
      setSearchOpenGroups(current => {
        if (current.has(groupId) === isOpen) return current;
        const next = new Set(current);
        if (isOpen) next.add(groupId);
        else next.delete(groupId);
        return next;
      });
      return;
    }

    setGroupOverrides(current => {
      const values = current.hash === hash ? new Map(current.values) : new Map<string, boolean>();
      if (values.has(groupId) && values.get(groupId) === isOpen) return current;
      values.set(groupId, isOpen);
      return { hash, values };
    });
  }

  return (
    <div className="software-explorer">
      <div className="software-search">
        <div>
          <label htmlFor="software-capability-search">Find a feature or workflow</label>
          <p>Try ledger, results, payroll or department stock.</p>
        </div>
        <div className="software-search-control">
          <input id="software-capability-search" type="search" placeholder="Search all software capabilities" value={search} onChange={event => updateSearch(event.target.value)} aria-describedby="software-search-count" />
          {search && <button type="button" onClick={() => updateSearch("")}>Clear search</button>}
        </div>
      </div>
      <p id="software-search-count" className="software-result-count" role="status">{count} of {total} capabilities in {visible.length} {visible.length === 1 ? "workflow area" : "workflow areas"}</p>
      <div className="software-browse">
        <nav className="software-group-links" aria-label="Software workflow areas">
          <span className="software-nav-title">WORKFLOW AREAS</span>
          {visible.map(group => <a key={group.id} href={`#software-${group.id}`} onClick={() => {
            setSearch("");
            setSearchOpenGroups(new Set());
            setGroupOverrides({ hash: "", values: new Map() });
          }}>{group.title}<span>{group.capabilities.length}</span></a>)}
        </nav>
        <div className="software-groups">
          {!visible.length && <div className="software-empty"><h3>No matching capabilities</h3><p>Try a broader term or clear the search to see the complete catalog.</p><button type="button" className="button" onClick={() => updateSearch("")}>Show all capabilities</button></div>}
          {visible.map((group, index) => (
            <section className="software-group" id={`software-${group.id}`} key={group.id} aria-labelledby={`software-heading-${group.id}`}>
              <details className="software-group-accordion" open={isGroupOpen(group.id)}>
                <summary className="software-group-heading" onClick={event => {
                  event.preventDefault();
                  setGroupOpen(group.id, !isGroupOpen(group.id));
                }}>
                  <span className="software-group-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span className="software-group-copy">
                    <span className="software-group-title" id={`software-heading-${group.id}`} role="heading" aria-level={3}>{group.title}</span>
                    <span className="software-group-description">{group.description}</span>
                  </span>
                  <span className="software-group-size">{group.capabilities.length} capabilities</span>
                  <span className="software-group-toggle" aria-hidden="true">+</span>
                </summary>
                <div className="software-group-content">
                  <div className="software-capability-list">
                    {group.capabilities.map(capability => (
                      <details className="software-capability" id={`software-feature-${capability.id}`} key={capability.id}>
                        <summary><span><strong>{capability.title}</strong><span>{capability.summary}</span></span><span className="software-expand" aria-hidden="true">+</span></summary>
                        <div className="software-capability-body">
                          <h4>What your team can do</h4>
                          <ul>{capability.workflows.map(workflow => <li key={workflow}>{workflow}</li>)}</ul>
                          {productScreens.filter(screen => screen.sourceRoute === capability.route).map(screen => <Link key={screen.id} className="text-link software-screen-link" href={`/product-tour#screen-${screen.id}`}>See the actual {screen.label.toLowerCase()} page <span aria-hidden="true">→</span></Link>)}
                          <p className="software-scope"><strong>Availability &amp; boundaries</strong>{capability.scope}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                  {group.id === "accounting-finance" && (
                    <div className="software-finance-cta">
                      <div><strong>See how financial workflows fit your facility.</strong><p>Discuss ledger, statements, reconciliation and close workflows with your team.</p></div>
                      <Link className="button" href={{ pathname: "/request-demo", query: { focus: "Operational and financial oversight" } }}>Discuss accounting workflows <span aria-hidden="true">↗</span></Link>
                    </div>
                  )}
                </div>
              </details>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
