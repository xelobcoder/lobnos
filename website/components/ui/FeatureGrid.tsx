import Link from "next/link";
import type { Solution } from "../../types/content";
import { Reveal } from "../layout/Reveal";

export function FeatureGrid({ items, limit }: { items: Solution[]; limit?: number }) {
  return <div className="solution-grid">{items.slice(0, limit).map((item, index) => (
    <Reveal key={item.slug} delay={(index % 3) * 0.06}>
      <Link className="solution-card" href={`/solutions/${item.slug}`}>
        <span className="solution-card-top"><span>{item.eyebrow}</span><span aria-hidden="true">↗</span></span>
        <h3>{item.shortTitle}</h3><p>{item.summary}</p><span className="text-link">Explore solution <span aria-hidden="true">→</span></span>
      </Link>
    </Reveal>
  ))}</div>;
}
