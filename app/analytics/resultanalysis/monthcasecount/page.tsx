"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList, ComposedChart, Line } from 'recharts';
import { RiFlaskLine, RiCalendar2Line } from "@remixicon/react";

interface CaseCount {
  day: number;
  caseCount: number;
}

export default function ResultAnalysisTestMonthlyCasesCount() {
  const [response, setResponse] = useState<CaseCount[]>([]);
  const [dayHeaders, setDayHeaders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const testid = searchParams?.get("testid");
  const show = searchParams?.get("show");
  const duration = searchParams?.get("duration")
  const month = searchParams?.get("month");

  const currentMonth = parseInt(month || '') || new Date().getMonth() + 1;
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
            const h= data.map((item: {day:number}) => item && Object.keys(item).includes("day") && item.day);
            setDayHeaders(h as any);
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const caseCount = payload[0].value;
      return (
        <div className="bg-white p-2 border rounded shadow-sm pls-color">
          <p className="mb-1 fw-bold">Day {label}</p>
          <p className="mb-1">Cases: {caseCount}</p>
          <p className="mb-0 text-primary">Daily Distribution</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card  rounded-lg transition-all duration-200 hover:shadow-md" style={{ background: 'hsl(var(--card))', backdropFilter: 'blur(8px)' }}>
        <div className="card-body">
          <div className="d-flex align-items-center gap-3 mb-4">
            <RiFlaskLine size={28} className="text-primary transition-colors" style={{ color: 'hsl(var(--primary))' }} />
            <h2 className="fs-4 fw-bold mb-0 pls-label transition-colors" style={{ color: 'hsl(var(--foreground))' }}>
              Monthly Case Count Analysis - {currentMonth}/{currentYear}
            </h2>
            <RiCalendar2Line size={26} className="transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }} />
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
            <>
              <div className="row mt-4 mb-4">
                <div className="col-md-6">
                  <div className="card  rounded-lg transition-all duration-200 hover:shadow-md hover:bg-primary/15" style={{ background: 'hsl(var(--primary) / 0.1)' }}>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>Total Cases</h6>
                      <h2 className="card-title mb-0 transition-colors" style={{ color: 'hsl(var(--primary))' }}>
                        {response.reduce((sum, item) => sum + item.caseCount, 0)}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card  rounded-lg transition-all duration-200 hover:shadow-md hover:bg-success/15" style={{ background: 'hsl(var(--success) / 0.1)' }}>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2 transition-colors" style={{ color: 'hsl(var(--muted-foreground))' }}>Days with Cases</h6>
                      <h2 className="card-title mb-0 transition-colors" style={{ color: 'hsl(var(--success))' }}>
                        {response.filter(item => item.caseCount > 0).length}
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={response}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 25,
                    }}
                    barSize={30}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.1)" />
                    <XAxis 
                      dataKey="day" 
                      label={{ 
                        value: 'Day of Month', 
                        position: 'bottom', 
                        offset: 15,
                        style: { 
                          fill: 'hsl(var(--muted-foreground))', 
                          fontSize: '13px',
                          fontWeight: 500 
                        } 
                      }}
                      fontSize={12}
                      tickSize={8}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ 
                        fill: 'hsl(var(--muted-foreground))',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                      tickFormatter={(value) => `D${value}`}
                      interval={0}
                      angle={0}
                      textAnchor="middle"
                      height={60}
                    />
                    <YAxis 
                      label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: '13px' } }}
                      fontSize={12}
                      width={50}
                      stroke="hsl(var(--muted-foreground))"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ fill: 'hsl(var(--muted) / 0.05)' }}
                      wrapperStyle={{ outline: 'none' }}
                    />
                    <Legend 
                      wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
                      iconType="circle"
                    />
                    <Bar 
                      dataKey="caseCount" 
                      name="Daily Cases" 
                      fill="#4285F4"
                      radius={[6, 6, 0, 0]}
                      className="transition-all duration-200"
                    >
                      <LabelList
                        dataKey="caseCount"
                        position="top"
                        style={{ fontSize: '11px', fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }}
                      />
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="caseCount"
                      name="Trend"
                      stroke="#36A2EB"
                      strokeWidth={2}
                      dot={false}
                      className="transition-all duration-200"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>


            </>
          )}
        </div>
      </div>
    </div>
  );
}
