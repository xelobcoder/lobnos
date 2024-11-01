import { useSearchParams } from "next/navigation";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import InventoryRunningTemplate from "../../../components/inventory/LimsConnection/RunningTemplate";

export default function LaboratoryConnectionTemplateCreation() {
    const randomTestId = useSearchParams().get("testid");
    const testId = randomTestId ? randomTestId.slice(70) : null;

    return (
        <InventoryLayout>
            <InventoryRunningTemplate testId={testId} />
        </InventoryLayout>
    )
}