"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";

export default function ResultAnalysisTestMonthlyCasesCount() {
  const [response, setResponse] = useState([]);
  const [dayHeaders, setDayHeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const testid = searchParams.get("testid");
  const show = searchParams.get("show");
  const duration = searchParams.get("duration");
  const expandedTarget = searchParams.get("expandedTarget");
  const month = searchParams.get("month");

  const currentMonth = parseInt(month) || new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const monthCasesShow =
    duration && duration === "month" && show === "allcaseCount";
  const monthResultShow =
    duration && duration === "month" && show === "resultvalues";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data = [];
        if (monthCasesShow) {
          data = await customFetch(
            `result/analysis/test/month?employeeid=3&&testid=${testid}&&month=${currentMonth}`
          );
          if (data && Array.isArray(data) && data.length > 0) {
            setDayHeaders(data.map((item) => item.day));
          }
        } else if (monthResultShow) {
          data = await customFetch(
            `result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}`
          );
        }
        setResponse(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testid, show, duration, currentMonth]);

  return (
    <div>
    
    </div>
  );
}
