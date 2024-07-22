import { Tab, Tabs } from "react-bootstrap"
import OrganizationBasicForm from "./BasicOrganizationForm"
import { useRouter } from "next/router";
import ContactPerson from "./ContactPerson";
import PaymentModule from "./PaymentModule";

export default function OrganizationNavigationalTabs() {
    const router = useRouter();
    const organizationid = router.query.id;
    return (
        <Tabs defaultActiveKey="home" id="organization-tabs" className="mb-3">
            <Tab eventKey="home" title="Basic Organizational Information">
                <OrganizationBasicForm organizationid={organizationid} />
            </Tab>
            <Tab eventKey="contact" title="Contact Person" onSelect={() => router.push(`/organization/${organizationid}/contactperson`)} >
                <ContactPerson />
            </Tab>
            <Tab eventKey="payment" title="Payment Modules" onSelect={() => router.push(`/organization/${organizationid}/payment`)}>
                <PaymentModule organizationid={organizationid} />
            </Tab>
        </Tabs>
    )
}