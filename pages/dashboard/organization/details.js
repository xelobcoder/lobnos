import { useSearchParams } from "next/navigation"
import DashBoardLayoutSales from "../../../components/salesSummary/DashBoardLayout";
import { useEffect, useState } from "react";
import { customFetch } from "../../../components/Auth/customFetch";
import ISLOADING from "../../../components/isLoading";
import PerformanceOrganization from "../../../components/organization/PerformanceOrganization";
import WeeklyPieChart from "../../../components/organization/WeeklyPieChart";
import BarChartPerformanceComponent from "../../../components/organization/BarChartPerformance";

export default function OrganizationDashboardDetails() {
  const organizationid = useSearchParams().get("id");
  const [loading, setLoading] = useState(true);
  const [salesReport, setSalesReport] = useState({});
  const organizationName = useSearchParams().get("organizationame");

  const getData = async function () {
    try {
      if (!organizationid) return;
      const report = await customFetch(`organization/detail/report/monthly?organizationid=${organizationid}`);
      const { statusCode, status, result } = report;
      if (statusCode === 200 && status == "success") {
        setSalesReport(result);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setSalesReport([]);
    }
  }

  useEffect(() => {
    getData();
  }, [organizationid])

  return (
    <DashBoardLayoutSales>
      <main >
      {loading && <ISLOADING />}
      <h2>{organizationName}</h2>
      <div className="grid-30-30-30">
        {salesReport.monthly && <PerformanceOrganization title={'DAY SUMMARY'} data={salesReport.today} />}
        {salesReport.monthly && <PerformanceOrganization title={'MONTH SALE SUMMARY'} data={salesReport.monthly} />}
        {salesReport.monthly && <PerformanceOrganization title={'YEAR SALE SUMMARY'} data={salesReport.yearly} />}
      </div>
      <div>
        <section className="organization-chart">
            <div className="">
            <div className="card br-0"> 
              <div className="card-header">
                 Daily Performance Chart
              </div>
              <div className="card-body">
                  {salesReport.daily && salesReport.daily.length > 0 ?
                     (<BarChartPerformanceComponent data={salesReport.daily} />)
                    :
                    ( <h5 className="alert alert-info">No data to display chart of daily Performance</h5>) }
              </div>
            </div>
            </div>
            <div>
              <div className="card br-0">
                <div className="card-header modal-color">
                  Weekly Performance Chart
                </div>
                <div className="card-body p-0">
                { (salesReport?.weekly && salesReport?.weekly.length > 0 ) ?
                  <WeeklyPieChart data={salesReport.weekly} />:
                  ( <h5 className="alert alert-info m-2">No data to display chart of weekly Performance</h5>)}
                </div>
            </div>
         </div>
          </section>
      </div>
    </main>
    </DashBoardLayoutSales>
  )
}