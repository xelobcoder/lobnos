import { Tab, Tabs } from "react-bootstrap";
import OutSourcingOrganizationForm from "./../../components/outsource/newOutSourceOrganization";
import ContractForm from "./../../components/outsource/contracting";
import OrganizationImageUploader from "./../../components/outsource/outSourceOrganizationProfileImageUpload";
import OutsourceServices from "./../../components/outsource/OutSourcingServices";
import PrimeLayout from "../../components/Layout/PrimeLayout";

export default function OutsourcingIndexPage() {
    return (
        <PrimeLayout>
            <Tabs defaultActiveKey="organization" className="ui" >
                <Tab className="bg-secondary-subtle px-4 py-3 br-5" eventKey="organization" title="Outsourcing Organization">
                    <OutSourcingOrganizationForm />
                </Tab>
                <Tab className="bg-secondary-subtle px-4 py-3 br-5" eventKey="contract" title="Contract Information">
                    <ContractForm />
                </Tab>
                <Tab title="Upload Organization Image" eventKey='imageUpload'>
                    <OrganizationImageUploader />
                </Tab>
                <Tab title="Services" eventKey='services'>
                    <OutsourceServices />
                </Tab>
            </Tabs>
        </PrimeLayout>
    );
}
