"use client"
import { Tab, Tabs } from "react-bootstrap";
import OrganizationBasicForm from "./BasicOrganizationForm";
import ContactPerson from "./ContactPerson";
import PaymentModule from "./PaymentModule";
import { useState } from "react";
import OrganizationSetupSettings from "./OrganizationSettings"
import { useParams } from "next/navigation";
import Link from 'next/link';
import styles from '../common/DirectoryWorkspace.module.css';

export default function OrganizationNavigationalTabs() {
    const [activeKey, setActiveKey] = useState('home');
    const organizationId = useParams().id;

    return (
        <main className={styles.workspace}>
        <Link href="/organization" className={styles.back}>← Organizations</Link>
        <header className={styles.header}><div><span className={styles.eyebrow}>ORGANIZATION PROFILE</span><h1>Manage organization</h1><p>Update the organization’s details, maintain its contact people, and review payment arrangements.</p></div></header>
        <Tabs mountOnEnter
            activeKey={activeKey}
            onSelect={(key) => { if (key) setActiveKey(key); }}
            id="organization-tabs"
            className="mb-3"
        >
            <Tab eventKey="home" title="Organization details">
                <OrganizationBasicForm organizationid={organizationId} />
            </Tab>
            <Tab eventKey="contact" title="Contact Person">
                <ContactPerson organizationid={organizationId} />
            </Tab>
            <Tab eventKey="payment" title="Payment arrangements">
                <PaymentModule organizationid={organizationId} />
            </Tab>
            {/* <Tab eventKey="settings" title="settings">
                {activeKey === "settings" && <OrganizationSetupSettings organizationid={organizationId} />}
            </Tab> */}
        </Tabs>
        </main>
    );
}
