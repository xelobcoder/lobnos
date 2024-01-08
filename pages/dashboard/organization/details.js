import { useSearchParams } from "next/navigation"
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";

export default function OrganizationDashboardDetails() {
  const organizationid = useSearchParams().get("id");
  const organizationName = useSearchParams().get("organizationame").toLocaleUpperCase();

  return (
    <DashBoardLayoutSales>
      <h2>{organizationName}</h2>
    </DashBoardLayoutSales>
  )
}