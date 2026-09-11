'use client'
import { useParams } from "next/navigation";
import ProcedureManualTab from "../../../../../../../components/settingsComponents/test/tabs/ProcedureManualTab";

// Kept for backward-compatible deep links; the in-place hub at testlist/[id] is the primary entry point now.
export default function Procedure() {
     const params = useParams();
     const testid = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "";

     return <ProcedureManualTab testid={testid} />;
}