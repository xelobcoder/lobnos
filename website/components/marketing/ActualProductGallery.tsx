"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { productScreens, type ProductScreen } from "../../data/product-screens";

export function ActualProductGallery({ id = "product-gallery", screens = productScreens, eager = false }: { id?: string; screens?: ProductScreen[]; eager?: boolean }) {
  const [active, setActive] = useState(0);
  const screen = screens[active];
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    imageRef.current?.scrollTo({ left: 0, top: 0 });
  }, [screen?.src]);

  if (!screen) throw new Error("Product galleries require at least one registered screenshot.");

  function revealScreenshot() {
    imageRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
  }

  return (
    <div className="actual-gallery">
      <p className="sr-only" role="status" aria-atomic="true">
        Page {active + 1} of {screens.length}: {screen.label}
      </p>
      <div className="actual-gallery-copy">
        <span className="eyebrow">ACTUAL PLS INTERFACE</span>
        <h3>{screen.title}</h3>
        <p>{screen.description}</p>
        <ul>
          {screen.workflows.map((workflow, index) => <li key={workflow}><span>{String(index + 1).padStart(2, "0")}</span>{workflow}</li>)}
        </ul>
        <small>{screen.provenance}</small>
      </div>
      <div className="actual-gallery-stage">
        <div ref={imageRef} className="actual-gallery-image" id={`${id}-panel`} role="region" aria-label={`${screen.label} screenshot`} aria-describedby={`${id}-hint`} tabIndex={0}>
          <Image key={screen.src} src={screen.src} alt={screen.alt} width={screen.width} height={screen.height} sizes="(max-width: 850px) 100vw, (max-width: 1280px) 65vw, 820px" loading={eager ? "eager" : "lazy"} />
        </div>
        <p className="actual-gallery-hint" id={`${id}-hint`}>Scroll within the image to inspect the full screenshot, or open it at full size.</p>
        <div className="actual-gallery-picker">
          <label htmlFor={`${id}-select`}>Choose a software page</label>
          <select id={`${id}-select`} value={active} onChange={event => { setActive(Number(event.target.value)); revealScreenshot(); }} aria-controls={`${id}-panel`}>
            {screens.map((item, index) => <option key={item.id} value={index}>{String(index + 1).padStart(2, "0")}. {item.label}</option>)}
          </select>
          <div className="actual-gallery-controls"><button type="button" aria-label="Previous software screenshot" onClick={() => { setActive(previous => (previous + screens.length - 1) % screens.length); revealScreenshot(); }}>←</button><button type="button" aria-label="Next software screenshot" onClick={() => { setActive(previous => (previous + 1) % screens.length); revealScreenshot(); }}>→</button></div>
        </div>
        <div className="actual-gallery-footer"><a href={screen.src} target="_blank" rel="noopener noreferrer">Open full-size page ↗</a><span>{active + 1} / {screens.length}</span></div>
      </div>
    </div>
  );
}
