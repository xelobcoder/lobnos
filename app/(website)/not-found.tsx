import Link from "next/link";

export default function NotFound() {
  return <section className="not-found"><div><span className="eyebrow">404 · PAGE NOT FOUND</span><h1>This page isn&apos;t in the directory.</h1><p>Check the address or return to the PLS home page.</p><Link className="button button-dark" href="/">Back to the homepage <span aria-hidden="true">→</span></Link></div></section>;
}
