import { Container } from "react-bootstrap";
import PreviewTestInformation from "./PreviewTestInformation";
import InventoryStockFilteringWrapper from "./InventoryStockFilteringWrapper";

export default function InventoryRunningTemplate({ testId, employeeid }: { testId: number, employeeid: number }) {
    return (
        <Container fluid>
            <PreviewTestInformation testId={testId} />
            {/* <InventoryStockFilteringWrapper
                testId={testId}
                employeeid={employeeid} /> */}
        </Container>
    );
}
