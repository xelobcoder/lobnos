"use client";
import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";
import YearMonthlyTestCaseChart from "../../../../lib/resultanalaysis/YearTestCaseCountChart";
import ResultAnalysisDasboardLayout from "../../../../components/salesSummary/ResultAnalysisDasboard";
import moment from "moment";



const YearMonthTestCasesCountPage = () => {
     const [data, setData] = useState([]);
     const [chartType, setChartType] = useState("bar");
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          const fetchData = async () => {
               try {
                    const response = await customFetch("result/analysis/test/getTestMonthlyCount?testid=100196&&employeeid=3");
                    setData(response);
               } catch (error) {
                    console.error("Error fetching data:", error);
               } finally {
                    setLoading(false);
               }
          };

          fetchData();
     }, []);

     return (
          <ResultAnalysisDasboardLayout>
               <div>
                    <h4 className="mb-0">Monthly Test Case Count</h4>
               </div>
               <div className="row mb-4 align-items-center">
                    <div className="col-md-4 col-sm-6 col-xl-6">
                         <select
                              id="chartTypeSelect"
                              className="custom-input"
                              value={chartType}
                              onChange={(e) => setChartType(e.target.value)}
                         >
                              <option value="bar">Bar Chart</option>
                              <option value="area">Area Chart</option>
                         </select>
                    </div>
               </div>
               {loading ? (
                    <div>Loading...</div>
               ) : (
                    <YearMonthlyTestCaseChart chartType={chartType} data={data} />
               )}
          </ResultAnalysisDasboardLayout>
     );
};

export default YearMonthTestCasesCountPage
