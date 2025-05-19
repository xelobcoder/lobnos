"use client"
import GeneralSalesChart from "../../../components/Dashboards/GeneralSalesCharts"
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Sales() {
  const [activeKey, setActiveKey] = useState(null);
  const router = useRouter();


  return (
    <div>
      <GeneralSalesChart />
    </div>
  )
}
