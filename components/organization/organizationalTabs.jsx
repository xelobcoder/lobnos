import { Tab, Tabs } from "react-bootstrap";
import OrganizationBasicForm from "./BasicOrganizationForm";
import { useRouter } from "next/router";
import ContactPerson from "./ContactPerson";
import PaymentModule from "./PaymentModule";
import { useState } from "react";

export default function OrganizationNavigationalTabs() {
    const [activeKey, setActiveKey] = useState('home');
    const router = useRouter();
    const organizationId = router.query.id;

    return (
        <Tabs
            activeKey={activeKey}
            onSelect={(key) => setActiveKey(key)}
            id="organization-tabs"
            className="mb-3"
        >
            <Tab eventKey="home" title="Basic Organizational Information">
                {activeKey === "home" && <OrganizationBasicForm organizationid={organizationId} />}
            </Tab>
            <Tab eventKey="contact" title="Contact Person">
                {activeKey === "contact" && <ContactPerson organizationid={organizationId} />}
            </Tab>
            <Tab eventKey="payment" title="Payment Modules">
                {activeKey === "payment" && <PaymentModule organizationid={organizationId} />}
            </Tab>
        </Tabs>
    );
}
