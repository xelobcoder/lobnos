import Link from "next/link";
import { company } from "../../data/content";

const footerGroups = [
  { title: "Platform", links: [["Solutions", "/solutions"], ["Complete feature catalog", "/features"], ["Analytics & reporting", "/website/analytics"], ["Real product tour", "/product-tour"], ["Pricing", "/pricing"], ["Industries", "/industries"], ["Marketplace", "/marketplace"], ["Facility directory", "/facilities"]] },
  { title: "Explore", links: [["About PLS", "/about"], ["Resources", "/resources"], ["Join the network", "/join-facility"], ["Contact", "/contact"], ["Request a demo", "/request-demo"]] },
  { title: "Portals", links: [["Facility login", "/facility-login"], ["Patient results", "/patient-portal"]] },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-main">
        <div className="footer-brand">
          <Link className="wordmark wordmark-light" href="/" aria-label="Prime Laboratory Software home">
            <span className="wordmark-mark" aria-hidden="true"><i /><i /><i /></span>
            <span className="wordmark-type"><strong>prime</strong><small>LABORATORY SOFTWARE</small></span>
          </Link>
          <p>{company.description}</p>
          {(company.publicEmail || company.publicPhone) && <div className="footer-contact">{company.publicEmail && <a href={`mailto:${company.publicEmail}`}>{company.publicEmail}</a>}{company.publicPhone && <a href={`tel:${company.publicPhone.replace(/[^\d+]/g, "")}`}>{company.publicPhone}</a>}</div>}
          <span className="footer-note">Laboratory workflows, considered as a whole.</span>
        </div>
        {footerGroups.map((group) => <div className="footer-links" key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>)}
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} Prime Laboratory Software</span>
        <div><Link href="/privacy-policy">Privacy notice <span className="draft-label">draft for review</span></Link><Link href="/terms">Terms <span className="draft-label">draft for review</span></Link></div>
        <span>Built for better visibility across laboratory operations.</span>
      </div>
    </footer>
  );
}
