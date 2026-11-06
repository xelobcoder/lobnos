"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Industry } from "../../types/content";

type SettingGroup = "diagnostics" | "hospital-care" | "networks";
type SettingFilter = "all" | SettingGroup;

const groups: { id: SettingFilter; label: string }[] = [
  { id: "all", label: "All settings" },
  { id: "diagnostics", label: "Diagnostic services" },
  { id: "hospital-care", label: "Hospitals & care networks" },
  { id: "networks", label: "Groups & employer health" },
];

const settingGroups: Record<string, SettingGroup> = {
  "diagnostic-laboratories": "diagnostics",
  "diagnostic-centres": "diagnostics",
  "hospital-laboratories": "hospital-care",
  "healthcare-referral-networks": "hospital-care",
  "laboratory-groups": "networks",
  "corporate-health": "networks",
};

const settingLabels: Record<SettingGroup, string> = {
  diagnostics: "DIAGNOSTIC SERVICES",
  "hospital-care": "HOSPITAL & CARE NETWORKS",
  networks: "MULTI-SITE & EMPLOYER HEALTH",
};

const settingIcons: Record<string, string> = {
  "diagnostic-laboratories": "M9 3h6M10 3v6.2L5.6 17a3 3 0 0 0 2.6 4.5h7.6A3 3 0 0 0 18.4 17L14 9.2V3 M7.6 14h8.8",
  "hospital-laboratories": "M3 21h18M5 21V8l7-4 7 4v13 M12 10v5m-2.5-2.5h5 M9.5 21v-3.5h5V21",
  "diagnostic-centres": "M3 4h18v16H3z M3 9h18 M7.5 13h3m-3 3.5h6 M16 12.3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4",
  "laboratory-groups": "M12 5v6m0 0-5.4 5.4M12 11l5.4 5.4 M12 3a2.2 2.2 0 1 0 0 4.4A2.2 2.2 0 0 0 12 3 M5 16.3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4 M19 16.3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4",
  "corporate-health": "M3 8h18v12H3z M8.5 8V5.7A1.7 1.7 0 0 1 10.2 4h3.6a1.7 1.7 0 0 1 1.7 1.7V8 M12 11.5v4m-2-2h4",
  "healthcare-referral-networks": "M5.5 12 18 6.5M5.5 12l12.5 5.5 M5.5 9.6a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8 M18.5 4.1a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8 M18.5 15.1a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8",
};

export function IndustryExplorer({ industries }: { industries: Industry[] }) {
  const [filter, setFilter] = useState<SettingFilter>("all");
  const [search, setSearch] = useState("");
  const visible = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return industries.filter((industry) => {
      const matchesGroup = filter === "all" || settingGroups[industry.slug] === filter;
      const matchesQuery = !query || `${industry.title} ${industry.summary} ${industry.workflows.join(" ")}`.toLocaleLowerCase().includes(query);
      return matchesGroup && matchesQuery;
    });
  }, [filter, industries, search]);

  function clearFilters() {
    setFilter("all");
    setSearch("");
  }

  return (
    <div className="industry-explorer">
      <div className="industry-explorer-controls">
        <label className="industry-search">
          <span className="sr-only">Search laboratory settings and workflows</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.3" /><path d="m15.5 15.5 4.2 4.2" /></svg>
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by setting or workflow" />
          {search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search">×</button>}
        </label>
        <span className="industry-result-count" aria-live="polite">{visible.length} {visible.length === 1 ? "setting" : "settings"}</span>
      </div>
      <div className="industry-filter-list" role="group" aria-label="Filter laboratory settings">
        {groups.map((group) => (
          <button key={group.id} type="button" aria-pressed={filter === group.id} onClick={() => setFilter(group.id)}>{group.label}</button>
        ))}
      </div>
      {visible.length ? <div className="setting-grid">
        {visible.map((industry) => {
          const group = settingGroups[industry.slug] || "diagnostics";
          return <Link className="setting-card" href={`/industries/${industry.slug}`} key={industry.slug}>
            <div className="setting-card-top">
              <span className="setting-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d={settingIcons[industry.slug] || settingIcons["diagnostic-laboratories"]} /></svg></span>
              <span className="setting-index" aria-label={`Setting ${String(industries.indexOf(industry) + 1).padStart(2, "0")}`}>{String(industries.indexOf(industry) + 1).padStart(2, "0")}</span>
            </div>
            <span className="setting-category">{settingLabels[group]}</span>
            <h2>{industry.title}</h2>
            <p>{industry.summary}</p>
            <div className="setting-workflows">
              <span>Workflows to explore</span>
              <ul>{industry.workflows.slice(0, 3).map((workflow) => <li key={workflow}>{workflow}</li>)}</ul>
            </div>
            <span className="text-link">Explore this setting <span aria-hidden="true">→</span></span>
          </Link>;
        })}
      </div> : <div className="industry-empty">
        <span aria-hidden="true">⌕</span>
        <h3>No settings match that search.</h3>
        <p>Try a different term or view all laboratory settings.</p>
        <button className="text-button" type="button" onClick={clearFilters}>Clear filters</button>
      </div>}
    </div>
  );
}
