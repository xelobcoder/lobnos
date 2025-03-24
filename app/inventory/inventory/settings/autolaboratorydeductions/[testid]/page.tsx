import { Container } from "react-bootstrap";
import PreviewTestInformation from "../../../../../components/inventory/LimsConnection/PreviewTestInformation";
import InventoryStockFilteringWrapper from "../../../../../components/inventory/LimsConnection/InventoryStockFilteringWrapper";
import { fetchTestTemplate } from "../../../../../components/inventory/LimsConnection/lib";

interface StockItem {
    quantity: number;
    consumptionunit: string;
    value: string;
    label: string;
}

export default async function AutoLaboratoryDeductionPage({
    params,
}: {
    params: Promise<{ testid: number; employeeid: number }>;
}) {
    const { testid: testId, employeeid } = await params;
    let errorHasOccurred = false;
    let templates: StockItem[] = [];

    try {
        if (testId) {
            const data = await fetchTestTemplate(testId);
            if (Array.isArray(data.template) && data?.template.length > 0) {
                templates = data.template.map((item: any) => ({
                    quantity: item.quantity,
                    consumptionunit: item.consumptionunit,
                    value: item.stockid,
                    label: item.label,
                }));
            }
        }
    } catch (err) {
        errorHasOccurred = true;
    }

    return (
        <Container fluid>
            {errorHasOccurred ? (
                <p className="alert alert-danger pls-color text-sm">Something went wrong while fetching the template data.</p>
            ) : (
                <>
                    <div className="my-2">
                        <PreviewTestInformation testId={testId} />
                        <InventoryStockFilteringWrapper
                            testId={testId}
                            employeeid={employeeid}
                            templateData={templates}
                        />
                    </div>
                </>
            )}
        </Container>
    );
}
