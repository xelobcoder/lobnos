"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { MarketplaceFacility } from "../../lib/marketplace";

export function FacilityListings({ facilities }: { facilities: MarketplaceFacility[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return facilities;
    return facilities.filter((facility) =>
      `${facility.name} ${facility.region} ${facility.locality} ${facility.address} ${facility.description}`
        .toLocaleLowerCase()
        .includes(needle)
    );
  }, [facilities, query]);

  return (
    <div className="marketplace-directory">
      <div className="marketplace-directory-toolbar">
        <label className="catalog-search">
          <span className="sr-only">Search laboratories by name or location</span>
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search laboratory or location" />
          <span aria-hidden="true">⌕</span>
        </label>
        <span className="marketplace-directory-count" aria-live="polite">{visible.length} {visible.length === 1 ? "laboratory" : "laboratories"}</span>
      </div>
      {visible.length ? <div className="facility-listings-scroll" role="region" aria-label="Public facility listings" tabIndex={0}>
        <table className="facility-listings-table">
          <caption className="sr-only">Published laboratories and their facility catalogs</caption>
          <thead>
            <tr>
              <th scope="col">Laboratory</th>
              <th scope="col">Location</th>
              <th scope="col">Facility type</th>
              <th scope="col">Catalog</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((facility) => <tr key={facility.slug}>
              <th scope="row">
                <span className="facility-listings-name">{facility.name}</span>
                {facility.description && <p className="facility-listings-description">{facility.description}</p>}
              </th>
              <td>{[facility.locality, facility.region].filter(Boolean).join(", ")}</td>
              <td><span className={`facility-integration facility-integration-${facility.facilityType}`}>
                {facility.facilityType === "pls-integrated" ? "PLS-connected facility" : "Independent facility"}
              </span></td>
              <td>
                <span className="facility-listings-currency">Published catalog · {facility.currency}</span>
                <Link className="text-link" href={`/facilities/${facility.slug}`}>
                  View tests &amp; prices<span className="sr-only"> for {facility.name}</span> <span aria-hidden="true">→</span>
                </Link>
              </td>
            </tr>)}
          </tbody>
        </table>
      </div> : <div className="directory-empty">
        <span aria-hidden="true">⌕</span>
        <h3>{query.trim() ? "No laboratories match that search." : "No approved facilities are listed yet."}</h3>
        <p>{query.trim() ? "Try another name, town or region." : "New facilities appear after identity review and public-listing approval. Check back as the network grows."}</p>
        {query.trim() && <button type="button" className="text-button" onClick={() => setQuery("")}>Clear search</button>}
      </div>}
    </div>
  );
}
