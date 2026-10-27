"use client";
import styles from "../../../components/organization/OrganizationWorkspace.module.css";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Tab, Tabs } from "react-bootstrap";
import OutSourcingOrganizationForm from "../../../components/outsource/newOutSourceOrganization";
import OutsourceServices from "../../../components/outsource/OutSourcingServices";

function PartnerWorkspace({ orgid }: { orgid: string }) {
    const [activeTab, setActiveTab] = useState("organization");
    const [savedName, setSavedName] = useState("");
    const [saved, setSaved] = useState(false);
    return (
        <main className={styles.workspace}>
            <Link href="/settings/outsource" className={styles.back}>← Outsourcing partners</Link>
            <header className={styles.header}><div><span className={styles.eyebrow}>Outsourcing partners</span>
                <h1 >{savedName || "Update outsourcing partner"}</h1>
                <p className="text-muted mb-0">Review the organization details, then manage the tests this partner provides and their agreed costs and turnaround times.</p>
            </div></header>
            {saved && <div className="alert alert-success d-flex flex-wrap justify-content-between align-items-center gap-3" role="status">
                <div><strong>Organization details saved.</strong><div>Next, review the partner’s services, costs and turnaround times.</div></div>
                <button type="button" className="btn btn-success" onClick={() => { setActiveTab("services"); setSaved(false); }}>Continue to services</button>
            </div>}
            <Tabs id={`outsource-partner-${orgid}`} activeKey={activeTab} onSelect={key => { if (key) setActiveTab(key); }} mountOnEnter className="mb-3">
                <Tab eventKey="organization" title="1. Organization details">
                    <OutSourcingOrganizationForm onChanged={() => setSaved(false)} onSaved={async organization => {
                        setSavedName(organization.name || ""); setSaved(true);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }} />
                </Tab>
                <Tab eventKey="services" title="2. Services, costs & turnaround">
                    <p className="text-muted">Review the tests available through this partner, including their costs and turnaround times.</p>
                    <OutsourceServices />
                    <div className="d-flex flex-wrap justify-content-between gap-2 border-top pt-3 mt-4">
                        <button type="button" className="btn btn-outline-secondary" onClick={() => setActiveTab("organization")}>Back to organization details</button>
                        <Link href="/settings/outsource" className="btn btn-primary">Return to partners</Link>
                    </div>
                </Tab>
            </Tabs>
        </main>
    );
}

export default function OutsourcingIndexPage() {
    const orgid = useSearchParams().get("orgid") || "";
    if (!/^[1-9]\d*$/.test(orgid)) return <div className="alert alert-warning m-3" role="alert">Choose an outsourcing partner to update. <Link href="/settings/outsource">View partners</Link></div>;
    return <PartnerWorkspace key={orgid} orgid={orgid} />;
}

