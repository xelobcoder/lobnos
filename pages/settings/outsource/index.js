import { Tab, Tabs } from "react-bootstrap";
import ContractForm from "../../../components/outsource/contracting";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import OrganizationImageUploader from "../../../components/outsource/outSourceOrganizationProfileImageUpload";
import OutsourceBarChart from "../../../components/outsource/OutSourceBarChart";
import OutSourcingOrganizationForm from "../../../components/outsource/newOutSourceOrganization";
import OutsourceServices from "../../../components/outsource/OutSourcingServices";


export default function OutsourcingIndexPage() {
    return (
        <MainSettingsLayoutView>
            <div className="p-3 bg-white">
                <Tabs defaultActiveKey="organization" className="" >
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
                    <Tab title="Charts " eventKey='outsource charts'>
                        <OutsourceBarChart />
                    </Tab>
                </Tabs>
            </div>
        </MainSettingsLayoutView>
    );
}
