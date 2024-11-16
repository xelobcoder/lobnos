import DashBoardLayoutSales from "../../components/salesSummary/DashBoardLayout"
import GeneralSalesChart from "../../components/Dashboards/GeneralSalesCharts"
import { ListGroup } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FinancialDataKeys } from "../../components/salesSummary/FinancialSummaryKeys";
export default function Sales() {
  const [activeKey, setActiveKey] = useState(null);
  const router = useRouter();

  
  return (
    <DashBoardLayoutSales>
    
        <div>
          <GeneralSalesChart />
        </div>
    </DashBoardLayoutSales>
  )
}
