import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "../../../website/components/ui/PageIntro";
import { portalDestination } from "../../../website/lib/site";
import { getPublicFacilities } from "../../../website/lib/public-catalog";

export const metadata: Metadata = { title: "Patient results portal", description: "Find the approved laboratory portal for patient results. This website does not collect patient information.", alternates: { canonical: "/patient-portal" }, robots: { index: false, follow: false, noarchive: true } };

export default async function PatientPortalPage() {
  const destination = portalDestination("patient");
  const directory = await getPublicFacilities();
  const facilities = directory.status === "ok" ? directory.data.filter((facility) => facility.patientPortalUrl) : [];
  return <>
    <PageIntro eyebrow="FOR PATIENTS & CAREGIVERS" title="Find the correct results portal for your laboratory." description="This public website helps you find a laboratory’s approved patient portal. It does not display or search medical records." action={false} />
    <section className="section portal-entry"><div className="wrap portal-entry-layout"><div><span className="eyebrow">PATIENT RESULTS ACCESS</span><h2>Choose your laboratory&apos;s verified access point.</h2><Link className="button button-dark" href="/patient-access/login">Patient login <span aria-hidden="true">→</span></Link><p>Use your full patient username to sign in to this PLS installation.</p><p>Results are available only through the laboratory’s authenticated system, subject to its identity checks and access process.</p>
      {destination ? <a className="button button-dark" href={destination} rel="noopener noreferrer">Open patient results portal <span aria-hidden="true">↗</span></a> : facilities.length ? <div className="portal-facility-list">{facilities.map((facility) => <a key={facility.slug} href={facility.patientPortalUrl!} target="_blank" rel="noopener noreferrer">{facility.name}<span aria-hidden="true">Patient results ↗</span></a>)}</div> : <div className="portal-unavailable"><b>{directory.status === "unavailable" ? "Patient portal listings are temporarily unavailable." : "No approved patient portal destination is listed."}</b><span>{directory.status === "unavailable" ? "The public directory service did not return a validated response. No patient records were requested." : "Contact the laboratory where your tests were performed using its official contact details. Do not enter patient identifiers here."}</span></div>}
      <p className="portal-privacy-note">Never send patient names, dates of birth, phone numbers, report numbers or medical details to this marketing website.</p></div><aside className="portal-safety patient-safety"><span className="safety-symbol">✳</span><h3>Your health information stays in the right place.</h3><p>There are no patient record search fields on this site. Patient authentication and access controls belong to the approved laboratory portal.</p><Link href="/facilities" className="text-link">Check the facility directory <span aria-hidden="true">→</span></Link></aside></div></section>
  </>;
}
