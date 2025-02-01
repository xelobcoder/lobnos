import { Card } from "react-bootstrap";
import OutSourcingOrganizationForm from "../../../components/outsource/newOutSourceOrganization";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";
import PrimeLayout from "../../../components/Layout/PrimeLayout";

export default function AddOutSourcingPage() {
    return (
        <PrimeLayout>
            <Card>
                <Card.Header>
                    <h5>Add Outsource Organization</h5>
                </Card.Header>
                <Card.Body>
                    <OutSourcingOrganizationForm />
                </Card.Body>
            </Card>
        </PrimeLayout>
    )
}