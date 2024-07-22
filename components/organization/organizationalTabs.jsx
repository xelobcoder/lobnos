import { Tab, Tabs,Button } from "react-bootstrap"
import OrganizationBasicForm from "./BasicOrganizationForm"
import { useRouter } from "next/router";

export default function OrganizationNavigationalTabs() {
    const organizationid = useRouter().query.id;
    return (
        <Tabs defaultActiveKey="home" id="organization-tabs" className="mb-3">
            <Tab eventKey="home" title="Home">
                <OrganizationBasicForm  organizationid={organizationid} />
            </Tab>
            <Tab eventKey="contact" title="Contact Person" onSelect={() => router.push(`/organization/${organizationid}/contactperson`)} >
                <Button
                    disabled={!organizationid}
                    className="btn btn-warning btn-sm mx-1"
                    >
                    Contact Person
                </Button>
            </Tab>
            <Tab eventKey="payment" title="Payment Modules">
                <Button
                    disabled={!organizationid}
                    className="btn btn-warning btn-sm mx-1"
                    onClick={() => router.push(`/organization/${organizationid}/payment`)}>
                    Payment Modules
                </Button>
            </Tab>
            <Tab eventKey="list" title="Organization List">
                <Button
                    className="btn btn-dark btn-sm"
                    onClick={() => router.push(`/organization`)}>
                    Organization List
                </Button>
            </Tab>
        </Tabs>
    )
}