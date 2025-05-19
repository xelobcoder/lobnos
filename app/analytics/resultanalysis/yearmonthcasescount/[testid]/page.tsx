"use client";
import React, { useState, useEffect } from "react";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, LabelList } from 'recharts';
import { useParams } from 'next/navigation';
import { useApplication } from "../../../../../components/Auth/useApplicationContext";
import { RiFlaskLine, RiCalendar2Line } from "@remixicon/react";

interface MonthlyCasesCountData {
  month: string;
  casesCount: number;
}

const YearMonthTestCasesCountPage = () => {
  const [data, setData] = useState<MonthlyCasesCountData[]>([]);
  const [chartType, setChartType] = useState("bar");
  const [loading, setLoading] = useState(true);
  const employeeid = useApplication()?.user?.employeeid;

  const params = useParams();
  const testid = params?.testid;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await customFetch(
          `result/analysis/test/getTestMonthlyCount?testid=${testid}&&employeeid=${employeeid}`
        );
        setData(response);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if(testid && employeeid){
      fetchData();
    }
  }, [testid,employeeid]); 

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const casesCount = payload[0].value;
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '8px 12px',
          border: '1px solid #e0e0e0',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '0.75rem'
        }}>
          <div style={{
            borderBottom: '1px solid #eee',
            paddingBottom: '4px',
            marginBottom: '4px',
            fontWeight: 600
          }}>
            Month: {label}
          </div>
          <div style={{ color: '#4285F4' }}>Cases: {casesCount}</div>
        </div>
      );
    }
    return null;
  };

  return (
   <div className="container-fluid px-4 py-3">
      <p className="text-muted mb-4 border p-3 br-5 bg-info-subtle text-sm ">This chart displays the count of test cases per month for the selected test ID.</p>
      <hr />
     <div className="p-4 border br-5 bg-white">
          <div className="d-flex align-items-center gap-3 mb-4">
            <RiFlaskLine size={28} className="text-primary transition-colors" style={{ color: 'hsl(var(--primary))' }} />
            <h2 className="fs-4 fw-bold mb-2 pls-label transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
              Monthly Test Case Count
            </h2>
          
          </div>

          <div className="row mb-4 align-items-center  ">
            <div className="col-md-4 col-sm-6 col-xl-6">
              <select
                id="chartTypeSelect"
                className="custom-input"
                value={chartType}
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">LineChart</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
              <div className="spinner" role="status">
                <style jsx>{`
                  .spinner {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: radial-gradient(farthest-side,hsl(var(--primary)) 94%,#0000) top/9px 9px no-repeat,
                              conic-gradient(#0000 30%,hsl(var(--primary)));
                    -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 9px),#000 0);
                    animation: spinner-rotation 1s infinite linear;
                  }

                  @keyframes spinner-rotation {
                    100% {
                      transform: rotate(1turn);
                    }
                  }
                `}</style>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                {chartType === 'bar' ? (
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      fontSize={11}
                      tickSize={5}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis
                      label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: '11px' } }}
                      fontSize={11}
                      width={45}
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} iconType="circle" />
                    <Bar dataKey="casesCount" fill="#4285F4" name="Cases Count" radius={[4, 4, 0, 0]} className="transition-all duration-200">
                      <LabelList
                        dataKey="casesCount"
                        position="top"
                        style={{ fontSize: '10px', fill: '#666', fontWeight: 500 }}
                      />
                    </Bar>
                  </BarChart>
                ) : (
                  <LineChart
                    data={data}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.5} />
                    <XAxis
                      dataKey="month"
                      fontSize={11}
                      tickSize={5}
                      tick={{ fill: '#666' }}
                    />
                    <YAxis
                      label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: '#666', fontSize: '11px' } }}
                      fontSize={11}
                      width={45}
                      tick={{ fill: '#666' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="casesCount" stroke="#36A2EB" fill="#36A2EB" name="Cases Count" className="transition-all duration-200" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </div>
     </div>
  );
};

export default YearMonthTestCasesCountPage;
