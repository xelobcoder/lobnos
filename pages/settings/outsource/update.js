import { Tab, Tabs } from "react-bootstrap";
import ContractForm from "../../../components/outsource/contracting";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import OrganizationImageUploader from "../../../components/outsource/outSourceOrganizationProfileImageUpload";
import OutsourceBarChart from "../../../components/outsource/OutSourceBarChart";
import OutSourcingOrganizationForm from "../../../components/outsource/newOutSourceOrganization";
import OutsourceServices from "../../../components/outsource/OutSourcingServices";
import { useState } from "react";

export default function OutsourcingIndexPage() {
    const [eventKey, setEventKey] = useState("organization");

    return (
        <MainSettingsLayoutView>
            <div className="p-3">
                <Tabs
                    defaultActiveKey="organization"
                    onSelect={(key) => setEventKey(key)}
                >
                    <Tab
                        className="px-4 py-3 br-5"
                        eventKey="organization"
                        title="Outsourcing Organization"
                    >
                        {eventKey === "organization" && <OutSourcingOrganizationForm />}
                    </Tab>
                    <Tab
                        className="px-4 py-3 br-5"
                        eventKey="contract"
                        title="Contract Information"
                    >
                        {eventKey === "contract" && <ContractForm />}
                    </Tab>
                    <Tab
                        title="Upload Organization Image"
                        eventKey="imageUpload"
                    >
                        {eventKey === "imageUpload" && <OrganizationImageUploader />}
                    </Tab>
                    <Tab
                        title="Services"
                        eventKey="services"
                    >
                        {eventKey === "services" && <OutsourceServices />}
                    </Tab>
                    <Tab
                        title="Charts"
                        eventKey="outsourcecharts"
                    >
                        {eventKey === "outsourcecharts" && <OutsourceBarChart />}
                    </Tab>
                </Tabs>
            </div>
        </MainSettingsLayoutView>
    );
}
