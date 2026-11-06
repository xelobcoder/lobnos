"use client";

import { useMemo, useState } from "react";
import type { MarketplaceCatalogItem } from "../../lib/marketplace";
import { BookingRequestForm } from "./BookingRequestForm";

function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export function MarketplaceCatalog({
  slug,
  items,
  currency,
  source,
  paymentInstructions,
  bookingSupported = true,
}: {
  slug: string;
  items: MarketplaceCatalogItem[];
  currency: string;
  source: "marketplace" | "pls-live";
  paymentInstructions: string | null;
  bookingSupported?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "test" | "panel">("all");
  const [pageSize, setPageSize] = useState(12);
  const [selected, setSelected] = useState<number[]>([]);
  const [retryLocked, setRetryLocked] = useState(false);
  const availableItems = useMemo(() => items.filter((item) => item.available), [items]);
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return availableItems.filter((item) =>
      (typeFilter === "all" || item.type === typeFilter) &&
      (!needle || `${item.name} ${item.description || ""} ${item.type} ${item.sampleRequirements.join(" ")}`
        .toLocaleLowerCase()
        .includes(needle))
    );
  }, [availableItems, query, typeFilter]);
  const visibleItems = visible.slice(0, pageSize);
  const counts = {
    all: availableItems.length,
    test: availableItems.filter((item) => item.type === "test").length,
    panel: availableItems.filter((item) => item.type === "panel").length,
  };
  const selectedItems = availableItems.filter((item) => selected.includes(item.id));
  const estimated = selectedItems.reduce((sum, item) => sum + item.price, 0);

  function toggleItem(id: number) {
    setSelected((current) => current.includes(id)
      ? current.filter((itemId) => itemId !== id)
      : current.length >= 20 ? current : [...current, id]);
  }

  return (
    <>
      <div className="marketplace-catalog-controls">
        <label className="catalog-search">
          <span className="sr-only">Search tests, panels and sample requirements</span>
          <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPageSize(12); }} placeholder="Search tests, panels or sample requirements" />
          <span aria-hidden="true">⌕</span>
        </label>
        <span>{visible.length} matching {visible.length === 1 ? "item" : "items"} · {source === "pls-live" ? "Live PLS catalog" : "Independent facility catalog"}</span>
      </div>
      <div className="catalog-type-filters" role="group" aria-label="Filter catalog by type">
        {([
          ["all", "All services"],
          ["test", "Individual tests"],
          ["panel", "Test panels"],
        ] as const).map(([value, label]) => (
          <button type="button" key={value} aria-pressed={typeFilter === value} onClick={() => { setTypeFilter(value); setPageSize(12); }}>
            {label}<span>{counts[value]}</span>
          </button>
        ))}
      </div>
      {visible.length ? <div className="marketplace-item-grid">
        {visibleItems.map((item) => <article className={`marketplace-item-card ${selected.includes(item.id) ? "marketplace-item-selected" : ""}`} key={`${item.type}-${item.id}`}>
          {bookingSupported && <label className="marketplace-item-select">
            <input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggleItem(item.id)} disabled={retryLocked || (!selected.includes(item.id) && selected.length >= 20)} />
            <span className="sr-only">Select {item.type}: {item.name}</span>
          </label>}
          <div className="marketplace-item-kind">{item.type === "panel" ? "TEST PANEL" : "TEST"}</div>
          <h3>{item.name}</h3>
          <p>{item.description || "Description not supplied by this laboratory."}</p>
          {item.sampleRequirements.length > 0 && <div className="catalog-requirements"><b>Sample information supplied</b><span>{item.sampleRequirements.join(" · ")}</span></div>}
          <div className="marketplace-item-footer">
            <strong>{!bookingSupported && item.price === 0 ? "Confirm price" : formatPrice(item.price, currency)}</strong>
            <span>{item.turnaroundHours ? `Estimated turnaround ${item.turnaroundHours}h` : "Timing confirmed by laboratory"}</span>
          </div>
          <div className="marketplace-collection-tags">{item.collectionMethods.map((method) => <span key={method}>{method === "home" ? "Home collection" : "In-facility"}</span>)}</div>
        </article>)}
      </div> : <div className="catalog-empty"><span>⌕</span><h3>{query.trim() ? "No matching tests or panels" : "No available catalog items"}</h3><p>{query.trim() ? "Try another search term." : "This facility has not published available tests or panels."}</p></div>}
      {visible.length > visibleItems.length && <button className="catalog-show-more" type="button" onClick={() => setPageSize((current) => current + 12)}>Show more services <span>Showing {visibleItems.length} of {visible.length}</span></button>}
      {bookingSupported ? <BookingRequestForm slug={slug} items={selectedItems} currency={currency} paymentInstructions={paymentInstructions} estimatedAmount={estimated} onRetryStateChange={setRetryLocked} /> :
        <p className="facility-login-note">Online booking has not been enabled for this facility. Contact the laboratory to arrange your tests and confirm any prices marked “Confirm price”.</p>}
    </>
  );
}
