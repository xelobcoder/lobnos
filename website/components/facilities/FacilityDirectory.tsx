"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { PublicFacility } from "../../lib/public-catalog";

export function FacilityDirectory({ facilities }: { facilities: PublicFacility[] }) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const regions = useMemo(() => [...new Set(facilities.map((facility) => facility.region))].sort(), [facilities]);
  const visible = facilities.filter((facility) => {
    const query = search.trim().toLocaleLowerCase();
    const searchable = `${facility.name} ${facility.region} ${facility.locality} ${facility.description}`.toLocaleLowerCase();
    return (!query || searchable.includes(query)) && (!region || facility.region === region);
  });

  return (
    <div className="facility-directory">
      <div className="facility-filters">
        <label><span className="sr-only">Search facilities</span><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search facility, region or locality" /></label>
        <label><span className="sr-only">Filter by region</span><select value={region} onChange={(event) => setRegion(event.target.value)}><option value="">All regions</option>{regions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
      {visible.length ? <div className="facility-list">{visible.map((facility) => <article className="public-facility" key={facility.slug}><div><span className="eyebrow">VERIFIED FACILITY</span><h2><Link href={`/facilities/${facility.slug}`}>{facility.name}</Link></h2><p className="facility-location">{[facility.locality, facility.region].filter(Boolean).join(", ")}</p><p>{facility.description}</p><div className="facility-links"><Link className="text-link" href={`/facilities/${facility.slug}`}>View tests & services <span aria-hidden="true">→</span></Link>{facility.facilityLoginUrl && <a className="text-link" href={facility.facilityLoginUrl} target="_blank" rel="noopener noreferrer">Staff login <span aria-hidden="true">↗</span></a>}{facility.patientPortalUrl && <a className="text-link" href={facility.patientPortalUrl} target="_blank" rel="noopener noreferrer">Patient results <span aria-hidden="true">↗</span></a>}{facility.website && <a className="text-link" href={facility.website} target="_blank" rel="noopener noreferrer">Facility website <span aria-hidden="true">↗</span></a>}</div></div></article>)}</div> :
        <div className="directory-empty"><span className="empty-icon">⌖</span><h2>{facilities.length ? "No matching facilities" : "No public listings yet"}</h2><p>{facilities.length ? "Try a different search or region." : "Facility profiles will be published only after the facility, public details and portal destinations have been verified and approved."}</p>{facilities.length > 0 && <button className="text-button" type="button" onClick={() => { setSearch(""); setRegion(""); }}>Clear filters</button>}</div>}
      <p className="directory-count">{visible.length} approved public {visible.length === 1 ? "facility" : "facilities"}</p>
    </div>
  );
}
