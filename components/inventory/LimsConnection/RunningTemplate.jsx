import { Container } from "react-bootstrap";
import InventoryStockFiltering from "./InventoryStockFiltering";
import PreviewTestInformation from "./PreviewTestInformation";

export default function InventoryRunningTemplate({ testId }) {
   

    return (
        <Container fluid>
            <PreviewTestInformation testId={testId} />
            <InventoryStockFiltering />
       </Container>
    );
}
