import { Container } from "react-bootstrap";
import PreviewTestInformation from "./PreviewTestInformation";
import InventoryStockFilteringWrapper from "./InventoryStockFilteringWrapper";

export default function InventoryRunningTemplate({ testId }) {
    return (
        <Container fluid>
            <PreviewTestInformation testId={testId} />
            <InventoryStockFilteringWrapper />
            <div>
                <button className="btn btn-primary btn-sm">
                    Save Information
                </button>
            </div>
        </Container>
    );
}
