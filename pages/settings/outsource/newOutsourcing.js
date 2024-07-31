import { Card } from "react-bootstrap";
import OutSourcingOrganizationForm from "../../../components/outsource/newOutSourceOrganization";
import MainSettingsLayoutView from "../../../components/settingsComponents/MainSettingsLayoutView";

export default function AddOutSourcingPage() {
    return (<MainSettingsLayoutView>
        <Card>
            <Card.Header>
                <h5>Add Outsource Organization</h5>
            </Card.Header>
            <Card.Body>
                <OutSourcingOrganizationForm />
            </Card.Body>
        </Card>
    </MainSettingsLayoutView>)
}