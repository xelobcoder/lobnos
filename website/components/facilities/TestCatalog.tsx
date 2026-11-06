"use client";

import { useMemo, useState } from "react";
import type { PublicCatalogItem } from "../../lib/public-catalog";

type CatalogKind = "all" | "tests" | "services";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function TestCatalog({ tests, services, currency }: { tests: PublicCatalogItem[]; services: PublicCatalogItem[]; currency: string }) {
  const [kind, setKind] = useState<CatalogKind>("all");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const items = [
      ...(kind === "all" || kind === "tests" ? tests.map((item) => ({ ...item, itemType: "Test" })) : []),
      ...(kind === "all" || kind === "services" ? services.map((item) => ({ ...item, itemType: "Service" })) : []),
    ];
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return items.filter((item) => !normalizedQuery || `${item.name} ${item.description || ""}`.toLocaleLowerCase().includes(normalizedQuery));
  }, [kind, query, services, tests]);

  return (
    <div className="public-catalog">
      <div className="catalog-controls">
        <div className="catalog-filter" role="group" aria-label="Filter catalog items">
          {(["all", "tests", "services"] as const).map((item) => <button type="button" key={item} aria-pressed={kind === item} onClick={() => setKind(item)}>{item === "all" ? "All items" : item}</button>)}
        </div>
        <label className="catalog-search"><span className="sr-only">Search tests and services</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tests and services" /><span aria-hidden="true">⌕</span></label>
      </div>
      <p className="catalog-result-count" aria-live="polite">{rows.length} public {rows.length === 1 ? "item" : "items"}{query.trim() ? ` matching “${query.trim()}”` : ""}</p>
      {rows.length ? <div className="catalog-table-wrap" role="region" aria-label="Published laboratory tests and services" tabIndex={0}>
        <table className="catalog-table">
          <thead><tr><th scope="col">Type</th><th scope="col">Test or service</th><th scope="col">Description</th><th scope="col" className="price-heading">Price <span>{currency}</span></th></tr></thead>
          <tbody>{rows.map((item) => <tr key={`${item.itemType}-${item.id}`}><td><span className={`catalog-type catalog-type-${item.itemType.toLowerCase()}`}>{item.itemType}</span></td><th scope="row">{item.name}</th><td className="catalog-description">{item.description || "Description not supplied by this laboratory"}</td><td className="catalog-price">{formatPrice(item.price, item.currency)}</td></tr>)}</tbody>
        </table>
      </div> : <div className="catalog-empty"><span>⌕</span><h3>{query.trim() ? "No matching items" : "No public catalog items listed"}</h3><p>{query.trim() ? "Try a different search term or show all item types." : "This facility has not published tests or services in its public catalog."}</p>{query.trim() && <button type="button" className="text-button" onClick={() => { setQuery(""); setKind("all"); }}>Clear search</button>}</div>}
    </div>
  );
}
