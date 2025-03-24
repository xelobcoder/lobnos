import { useSearchParams } from "next/navigation";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import InventoryRunningTemplate from "../../../components/inventory/LimsConnection/RunningTemplate";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";


export default function LaboratoryConnectionTemplateCreation() {
    const randomTestId = useSearchParams().get("testid");
    const testId = randomTestId ? randomTestId.slice(70) : null;
    const { applicationsettings } = useApplicationSettings();

    return (
        <InventoryLayout>
            <InventoryRunningTemplate employeeid={applicationsettings.user.employeeid} testId={testId} />
        </InventoryLayout>
    )
}