"use client"
import { Tab, Tabs } from "react-bootstrap";
import OrganizationImageUploader from "../../../../components/outsource/outSourceOrganizationProfileImageUpload";
import OutSourcingOrganizationForm from "../../../../components/outsource/newOutSourceOrganization";
import { useState } from "react";
import OutsourceServices from "../../../../components/outsource/OutSourcingServices";
import ContractForm from "../../../../components/outsource/contracting";

export default function OutsourcingIndexPage() {
    const [eventKey, setEventKey] = useState("organization");

    return (
        <div className="p-3">
        <Tabs
            defaultActiveKey="organization"
            onSelect={(key) => key && setEventKey(key)}
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
        </Tabs>
    </div>
    );
}
