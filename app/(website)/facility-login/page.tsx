import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { portalDestination } from "../../../website/lib/site";
import { getPublicFacilities } from "../../../website/lib/public-catalog";
import { FacilityLoginSelector } from "../../../website/components/marketplace/FacilityLoginSelector";

export const metadata: Metadata = { title: "Client login", description: "Sign in to your Prime Laboratory Software facility workspace.", alternates: { canonical: "/facility-login" }, robots: { index: false, follow: false, noarchive: true } };

async function OtherFacilityLogins() {
 const directory = await getPublicFacilities();
 const facilities = directory.status === "ok" ? directory.data.filter(facility => facility.facilityLoginUrl) : [];
 return facilities.length ? <FacilityLoginSelector facilities={facilities}/> : <p className="facility-login-note">{directory.status === "unavailable" ? "The public facility directory is temporarily unavailable. You can still sign in above using your full facility username." : "No additional facility sign-in pages are listed. Use your full facility username above, or ask your facility administrator for its access link."}</p>;
}

export default function FacilityLoginPage() {
 const destination = portalDestination("facility");
 return <section className="section facility-login-section client-entry">
  <div className="wrap facility-login-layout">
   <div className="facility-login-main">
    <span className="eyebrow">CLIENT ACCESS</span>
    <h1>Welcome to your workspace.</h1>
    <p>One secure sign-in for your facility and assigned roles.</p>
    <div className="client-entry-card">
     <h2>Staff &amp; practitioners</h2>
     <p>Use the full username supplied by your facility. Its organization prefix identifies where you work.</p>
     <Link className="button button-dark" href="/authentications/login">Continue to sign in <span aria-hidden="true">→</span></Link>
     <p className="facility-login-note">Already signed in? Continue opens your workspace. To change facility or account, <Link href="/authentication/logout">sign out first</Link>. Save any unfinished work before signing out.</p>
    </div>
    <p className="client-entry-patient">Looking for your results? <Link href="/patient-access/login">Patient login →</Link></p>
    <details className="client-entry-other"><summary>Another facility’s sign-in page</summary>
     <p>For a facility using a separate installation, choose its approved access page. Selecting a listing does not switch your current signed-in facility.</p>
     {destination && <p><a href={destination} rel="noopener noreferrer">Configured facility sign-in ↗</a></p>}
     <Suspense fallback={<p role="status">Checking approved facility listings… You can use the sign-in button above while these load.</p>}><OtherFacilityLogins/></Suspense>
    </details>
   </div>
   <aside className="facility-login-security">
    <span className="eyebrow">HOW TO SIGN IN</span>
    <h2>Your facility. Your role.</h2>
    <ol className="client-entry-steps">
     <li><strong>Enter your full username</strong><span>Keep the organization prefix and account number exactly as provided.</span></li>
     <li><strong>Choose the correct account type</strong><span>Staff use Staff Login. Referring practitioners use Doctor Login. Patients have a separate login.</span></li>
     <li><strong>Open your assigned workspace</strong><span>After signing in, use Switch role if you have other assigned roles or locations. Access remains limited to your assignments.</span></li>
    </ol>
    <p>Need help with a username or access? Contact your facility administrator. Password recovery is available on the sign-in page.</p>
   </aside>
  </div>
 </section>;
}
