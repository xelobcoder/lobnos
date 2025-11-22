"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch } from "../../../../components/Auth/customFetch";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, Area, AreaChart, LineChart, LabelList } from 'recharts';
import { RiFlaskLine, RiCalendar2Line, RiLoader4Line, RiErrorWarningLine, RiInbox2Line } from "@remixicon/react";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface CaseCount {
  day: number;
  caseCount: number;
}

export default function ResultAnalysisTestMonthlyCasesCount() {
  const [response, setResponse] = useState<CaseCount[]>([]);
  const [dayHeaders, setDayHeaders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area' | 'composed'>('composed');

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
      setError(null);
      try {
        let data = [];
        if (monthCasesShow) {
          data = await customFetch(
            `result/analysis/test/month?employeeid=3&&testid=${testid}&&month=${currentMonth}`
          );
          if (data && Array.isArray(data) && data.length > 0) {
            const h = data.map((item: { day: number }) => item && Object.keys(item).includes("day") && item.day);
            setDayHeaders(h as any);
          }
        } else if (monthResultShow) {
          data = await customFetch(
            `result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}`
          );
        }
        setResponse(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch data");
        console.error("Error fetching data:", err);
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
        <div className="bg-white p-2 border rounded shadow-sm" style={{
          backgroundColor: 'var(--bs-body-bg)',
          borderColor: COLOR_BORDER
        }}>
          <p className="mb-1 fw-bold">Day {label}</p>
          <p className="mb-1">Cases: {caseCount}</p>
          <p className="mb-0" style={{ color: COLOR_ACCENT }}>Daily Distribution</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
        <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
              <RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
              Monthly Case Count Analysis - {currentMonth}/{currentYear}
            </h2>
            <div className="d-flex align-items-center gap-3">
              <RiCalendar2Line size={26} className="flex-shrink-0" style={{ color: COLOR_TEXT_MUTED }} />
              <div className="btn-group btn-group-sm" role="group" aria-label="Chart type selection">
                <button
                  type="button"
                  className={`btn ${chartType === 'bar' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
                <button
                  type="button"
                  className={`btn ${chartType === 'line' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  type="button"
                  className={`btn ${chartType === 'area' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('area')}
                >
                  Area
                </button>
                <button
                  type="button"
                  className={`btn ${chartType === 'composed' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setChartType('composed')}
                >
                  Combined
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-3 p-md-4">
          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading case data...</p>
            </div>
          ) : error ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
              <h5 className="fw-medium mb-1">Error Loading Data</h5>
              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
            </div>
          ) : response.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
              <h5 className="fw-medium mb-1">No Data Available</h5>
              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                No case data for the selected period.
              </p>
            </div>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-md-6">
                  <div className="card" style={{ borderColor: COLOR_BORDER }}>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2" style={{ color: COLOR_TEXT_MUTED }}>Total Cases</h6>
                      <h2 className="card-title mb-0" style={{ color: COLOR_ACCENT }}>
                        {response.reduce((sum, item) => sum + item.caseCount, 0).toLocaleString()}
                      </h2>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card" style={{ borderColor: COLOR_BORDER }}>
                    <div className="card-body">
                      <h6 className="card-subtitle mb-2" style={{ color: COLOR_TEXT_MUTED }}>Active Days</h6>
                      <h2 className="card-title mb-0" style={{ color: COLOR_ACCENT }}>
                        {response.filter(item => item.caseCount > 0).length}
                        <small className="text-muted ms-2">
                          ({((response.filter(item => item.caseCount > 0).length / response.length) * 100).toFixed(1)}%)
                        </small>
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={response}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 25,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: 'Day of Month',
                          position: 'bottom',
                          offset: 15,
                          style: {
                            fill: COLOR_TEXT_MUTED,
                            fontSize: '13px',
                            fontWeight: 500
                          }
                        }}
                        fontSize={12}
                        tickSize={8}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{
                          fill: COLOR_TEXT_MUTED,
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
                        label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
                        fontSize={12}
                        width={50}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{ fill: COLOR_TEXT_MUTED }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="caseCount"
                        name="Daily Cases"
                        fill={COLOR_ACCENT}
                        radius={[6, 6, 0, 0]}
                        className="transition-all duration-200"
                      >
                        <LabelList
                          dataKey="caseCount"
                          position="top"
                          style={{ fontSize: '11px', fill: COLOR_TEXT_MUTED, fontWeight: 500 }}
                        />
                      </Bar>
                    </BarChart>
                  ) : chartType === 'line' ? (
                    <LineChart
                      data={response}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 25,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: 'Day of Month',
                          position: 'bottom',
                          offset: 15,
                          style: {
                            fill: COLOR_TEXT_MUTED,
                            fontSize: '13px',
                            fontWeight: 500
                          }
                        }}
                        fontSize={12}
                        tickSize={8}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{
                          fill: COLOR_TEXT_MUTED,
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
                        label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
                        fontSize={12}
                        width={50}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{ fill: COLOR_TEXT_MUTED }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: COLOR_ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
                        iconType="circle"
                      />
                      <Line
                        type="monotone"
                        dataKey="caseCount"
                        name="Daily Cases"
                        stroke={COLOR_ACCENT}
                        strokeWidth={3}
                        dot={{ fill: COLOR_ACCENT, strokeWidth: 2, stroke: '#fff', r: 5 }}
                        activeDot={{ r: 7, fill: COLOR_ACCENT, stroke: '#fff', strokeWidth: 3 }}
                        className="transition-all duration-200"
                      />
                    </LineChart>
                  ) : chartType === 'area' ? (
                    <AreaChart
                      data={response}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 25,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: 'Day of Month',
                          position: 'bottom',
                          offset: 15,
                          style: {
                            fill: COLOR_TEXT_MUTED,
                            fontSize: '13px',
                            fontWeight: 500
                          }
                        }}
                        fontSize={12}
                        tickSize={8}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{
                          fill: COLOR_TEXT_MUTED,
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
                        label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
                        fontSize={12}
                        width={50}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{ fill: COLOR_TEXT_MUTED }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ stroke: COLOR_ACCENT, strokeWidth: 1, strokeDasharray: '4 4' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
                        iconType="circle"
                      />
                      <Area
                        type="monotone"
                        dataKey="caseCount"
                        name="Daily Cases"
                        stroke={COLOR_ACCENT}
                        fill={COLOR_ACCENT}
                        fillOpacity={0.3}
                        strokeWidth={2}
                        className="transition-all duration-200"
                      />
                    </AreaChart>
                  ) : (
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
                      <CartesianGrid strokeDasharray="3 3" stroke={COLOR_BORDER} />
                      <XAxis
                        dataKey="day"
                        label={{
                          value: 'Day of Month',
                          position: 'bottom',
                          offset: 15,
                          style: {
                            fill: COLOR_TEXT_MUTED,
                            fontSize: '13px',
                            fontWeight: 500
                          }
                        }}
                        fontSize={12}
                        tickSize={8}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{
                          fill: COLOR_TEXT_MUTED,
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
                        label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fill: COLOR_TEXT_MUTED, fontSize: '13px' } }}
                        fontSize={12}
                        width={50}
                        stroke={COLOR_TEXT_MUTED}
                        tick={{ fill: COLOR_TEXT_MUTED }}
                      />
                      <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                        wrapperStyle={{ outline: 'none' }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: '12px', color: 'hsl(var(--foreground))', marginTop: '8px' }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="caseCount"
                        name="Daily Cases"
                        fill={COLOR_ACCENT}
                        radius={[6, 6, 0, 0]}
                        className="transition-all duration-200"
                      >
                        <LabelList
                          dataKey="caseCount"
                          position="top"
                          style={{ fontSize: '11px', fill: COLOR_TEXT_MUTED, fontWeight: 500 }}
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
                  )}
                </ResponsiveContainer>
              </div>


            </>
          )}
        </div>

        {response.length > 0 && (
          <div className="card-footer bg-body-tertiary p-3 p-md-4" style={{ borderTop: `1px solid ${COLOR_BORDER}` }}>
            <div className="row g-3">
              <div className="col-md-3">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-primary">{response.length}</div>
                  <div className="text-muted small">Total Days</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-success">
                    {response.reduce((sum, item) => sum + item.caseCount, 0)}
                  </div>
                  <div className="text-muted small">Total Cases</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-info">
                    {response.filter(item => item.caseCount > 0).length}
                  </div>
                  <div className="text-muted small">Active Days</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="fs-4 fw-bold text-warning">
                    {(response.reduce((sum, item) => sum + item.caseCount, 0) / response.length).toFixed(1)}
                  </div>
                  <div className="text-muted small">Avg per Day</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .animate-spin {
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
