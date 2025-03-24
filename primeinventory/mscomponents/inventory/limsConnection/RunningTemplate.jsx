import { Container } from "react-bootstrap";
import PreviewTestInformation from "./PreviewTestInformation";
import InventoryStockFilteringWrapper from "./InventoryStockFilteringWrapper";

export default function InventoryRunningTemplate({ testId, employeeid }) {
    return (
        <Container fluid>
            <PreviewTestInformation testId={testId} />
            <InventoryStockFilteringWrapper testId={testId} employeeid={employeeid} />
        </Container>
    );
}
