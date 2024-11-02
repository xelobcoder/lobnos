import { useSearchParams } from "next/navigation";
import InventoryLayout from "../../../components/inventory/InventoryLayout";
import InventoryRunningTemplate from "../../../components/inventory/LimsConnection/RunningTemplate";
import { useContext } from "react";
import AuthContext from "../../../components/Auth/useAuthentification";

export default function LaboratoryConnectionTemplateCreation() {
    const randomTestId = useSearchParams().get("testid");
    const testId = randomTestId ? randomTestId.slice(70) : null;
    const { auth } = useContext(AuthContext);

    return (
        <InventoryLayout>
            <InventoryRunningTemplate employeeid={auth?.employeeid} testId={testId} />
        </InventoryLayout>
    )
}