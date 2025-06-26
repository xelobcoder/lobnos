"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { currencyFormatter, reactSelectCustomStyles } from '../../Auth/customFetch'; // Assuming reactSelectCustomStyles is defined
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import Select from 'react-select';
import { format } from 'date-fns';
import { ClinicianAnalyticsCaseSummaryDailyServerSide } from '../../serverActions/ActionFiltering';
import { RiLineChartLine, RiErrorWarningLine, RiCalendarLine, RiInbox2Line, RiLoader4Line, RiBarChartHorizontalLine, RiNumbersLine, RiRefreshLine } from '@remixicon/react'; // Added more icons

interface DailyCaseSummary {
  date: string;
  clinician_cases: number;
  total_cases: number;
  percentage_clinician_cases: string;
}

interface ClinicianAnalyticsCaseSummaryDailyProps {
  clinicianId: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// --- Color Palette & Constants (aligning with other components) ---
const SHADCN_PRIMARY = "oklch(0.646 0.222 41.116)"; // Example Blue
const SHADCN_SECONDARY = "oklch(0.769 0.188 70.08)"; // Example Orange/Yellow
const SHADCN_TERTIARY = "oklch(0.6 0.118 184.704)"; // Example Teal/Green

const SHADCN_FOREGROUND = "var(--bs-body-color)"; // Bootstrap body color
const SHADCN_MUTED_FOREGROUND = "var(--bs-secondary-color)";
const SHADCN_BORDER = "var(--bs-border-color)";
const SHADCN_CARD_BG = "var(--bs-body-bg)";
const SHADCN_MUTED_BG = "var(--bs-tertiary-bg)";
const SHADCN_TOOLTIP_BG = "var(--bs-body-bg)"; // Tooltip bg matches card body
const SHADCN_TOOLTIP_FG = "var(--bs-body-color)";
const SHADCN_SPINNER_COLOR = SHADCN_PRIMARY;

const GRADIENT_CLINICIAN = "url(#gradientClinician)";
const GRADIENT_OTHER = "url(#gradientOther)";
const GRADIENT_TOTAL = "url(#gradientTotal)";

const ClinicianAnalyticsCaseSummaryDaily: React.FC<ClinicianAnalyticsCaseSummaryDailyProps> = ({
  clinicianId,
}) => {
  const [dailyData, setDailyData] = useState<DailyCaseSummary[]>([]);
  const [selectedYear, setSelectedYear] = useState<{ value: number; label: string }>({
    value: new Date().getFullYear(),
    label: new Date().getFullYear().toString(),
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({ // Increased to 10 years
    value: currentYear - i,
    label: (currentYear - i).toString(),
  }));

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    ClinicianAnalyticsCaseSummaryDailyServerSide(clinicianId, selectedYear.value)
      .then((data) => {
        if (!data || !Array.isArray(data)) {
            throw new Error("Invalid data format received.");
        }
        const sortedData = data.sort(
          (a: DailyCaseSummary, b: DailyCaseSummary) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );
        setDailyData(sortedData);
      })
      .catch((err) => {
        setDailyData([]);
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching daily summary.");
      })
      .finally(() => setLoading(false));
  }, [clinicianId, selectedYear.value]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const insights = (() => {
    if (!dailyData.length) return { avgClinicianCases: "0.0", peakDay: "N/A", trend: "N/A", peakValue: 0 };
    const avgClinicianCases = dailyData.reduce((sum, item) => sum + item.clinician_cases, 0) / dailyData.length;
    const peakEntry = dailyData.reduce((max, item) => (item.clinician_cases > max.clinician_cases ? item : max), dailyData[0]);
    const trend = dailyData.length > 1 ? (dailyData[dailyData.length - 1].clinician_cases > dailyData[0].clinician_cases ? "Upward" : dailyData[dailyData.length - 1].clinician_cases < dailyData[0].clinician_cases ? "Downward" : "Stable") : "N/A";
    return {
      avgClinicianCases: avgClinicianCases.toFixed(1),
      peakDay: peakEntry ? format(new Date(peakEntry.date), "MMM dd") : "N/A",
      peakValue: peakEntry ? peakEntry.clinician_cases : 0,
      trend,
    };
  })();

  const chartData = dailyData.map((item) => ({
    date: format(new Date(item.date), "MMM dd"),
    clinicianCases: item.clinician_cases,
    otherCases: Math.max(0, item.total_cases - item.clinician_cases), // Ensure non-negative
    totalCases: item.total_cases,
    percentage: parseFloat(item.percentage_clinician_cases) || 0,
  }));

  const CustomTooltipComponent: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const entry = chartData.find(d => d.date === label);

    return (
      <div className="rounded-lg border p-2 shadow-sm" style={{ backgroundColor: SHADCN_TOOLTIP_BG, borderColor: SHADCN_BORDER, color: SHADCN_TOOLTIP_FG, minWidth: '200px', fontSize: '0.8rem' }}>
        <div className="mb-1 fw-semibold" style={{color: SHADCN_FOREGROUND}}>{label} ({entry?.percentage.toFixed(1)}% of Total)</div>
        {payload.map((pld, index) => (
          <div key={index} className="d-flex align-items-center my-1">
            <span style={{width: '10px', height: '10px', borderRadius: '50%', backgroundColor: pld.stroke || pld.fill, marginRight: '8px'}}></span>
            <span style={{color: SHADCN_MUTED_FOREGROUND}}>{pld.name}: </span>
            <span className="fw-medium ms-1" style={{color: pld.stroke || pld.fill }}>{pld.value}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
        return (<div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '400px' }}><RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: SHADCN_SPINNER_COLOR }} /><p style={{color: SHADCN_MUTED_FOREGROUND}}>Loading daily trends...</p></div>);
    }
    if (error) {
        return (<div className="d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '400px' }}><RiErrorWarningLine size={48} className="mb-3 text-danger" /><h5 className="fw-medium mb-2" style={{color: SHADCN_FOREGROUND}}>Error Loading Data</h5><p className="px-3 mb-3" style={{color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem'}}>{error}</p><button className="btn btn-sm btn-outline-primary d-flex align-items-center" onClick={fetchData}><RiRefreshLine className="me-1"/> Retry</button></div>);
    }
    if (chartData.length === 0) {
        return (<div className="d-flex flex-column justify-content-center align-items-center text-center p-4" style={{ minHeight: '400px' }}><RiInbox2Line size={48} className="mb-3" style={{color: SHADCN_MUTED_FOREGROUND}}/><h5 className="fw-medium mb-1" style={{color: SHADCN_FOREGROUND}}>No Data Available</h5><p className="px-3" style={{color: SHADCN_MUTED_FOREGROUND, fontSize: '0.9rem'}}>No daily case summary data found for the selected year.</p></div>);
    }

    return (
      <>
        <div className="row g-3 mb-4">
          <InsightCard Icon={RiNumbersLine} title="Avg. Clinician Cases/Day" value={insights.avgClinicianCases} variantColor={SHADCN_PRIMARY} />
          <InsightCard Icon={RiCalendarLine} title="Peak Day (Clinician Cases)" value={`${insights.peakDay} (${insights.peakValue})`} variantColor={SHADCN_SECONDARY} isCurrency={false}/>
          <InsightCard Icon={RiBarChartHorizontalLine} title="Overall Trend" value={insights.trend} variantColor={insights.trend === "Upward" ? SHADCN_TERTIARY : insights.trend === "Downward" ? "oklch(0.68 0.22 15)" : SHADCN_MUTED_FOREGROUND} isCurrency={false}/>
        </div>
        <div style={{ height: "400px" }}> {/* Adjusted chart height slightly */}
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 15, left: 5, bottom: 60 }}>
              <defs>
                <linearGradient id="gradientClinician" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_PRIMARY} stopOpacity={0.8} /><stop offset="100%" stopColor={SHADCN_PRIMARY} stopOpacity={0.2} /></linearGradient>
                <linearGradient id="gradientOther" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_SECONDARY} stopOpacity={0.7} /><stop offset="100%" stopColor={SHADCN_SECONDARY} stopOpacity={0.1} /></linearGradient>
                <linearGradient id="gradientTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={SHADCN_TERTIARY} stopOpacity={0.9} /><stop offset="100%" stopColor={SHADCN_TERTIARY} stopOpacity={0.3} /></linearGradient>
              </defs>
              <CartesianGrid stroke={SHADCN_BORDER} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={11} tick={{ fill: SHADCN_MUTED_FOREGROUND }} angle={-45} textAnchor="end" height={70} tickLine={{stroke: SHADCN_BORDER}} axisLine={{ stroke: SHADCN_BORDER }} interval="preserveStartEnd"/>
              <YAxis fontSize={11} width={50} tick={{ fill: SHADCN_MUTED_FOREGROUND }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltipComponent />} cursor={{ stroke: SHADCN_PRIMARY, strokeWidth: 1, strokeDasharray: "3 3" }} />
              <Legend wrapperStyle={{ fontSize: "13px", paddingTop: "15px", color: SHADCN_FOREGROUND }} formatter={(value) => <span style={{color: SHADCN_MUTED_FOREGROUND}}>{value}</span>} />
              <Line type="monotone" dataKey="clinicianCases" name="Clinician Cases" stroke={SHADCN_PRIMARY} strokeWidth={2.5} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_PRIMARY }} activeDot={{ r: 6, fill: SHADCN_PRIMARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="otherCases" name="Other Cases" stroke={SHADCN_SECONDARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_SECONDARY }} activeDot={{ r: 6, fill: SHADCN_SECONDARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
              <Line type="monotone" dataKey="totalCases" name="Total Cases" stroke={SHADCN_TERTIARY} strokeWidth={2} dot={{ r: 3, strokeWidth: 1.5, fill: SHADCN_TERTIARY }} activeDot={{ r: 6, fill: SHADCN_TERTIARY, stroke: SHADCN_CARD_BG, strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  return (
    <div className="card shadow-sm" style={{ borderRadius: '0.75rem', borderColor: SHADCN_BORDER, backgroundColor: SHADCN_CARD_BG }}>
      <div className="card-header py-3 px-4" style={{ backgroundColor: SHADCN_MUTED_BG, borderBottom: `1px solid ${SHADCN_BORDER}` }}>
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
          <h2 className="fs-6 fw-semibold text-body-emphasis mb-2 mb-md-0 d-flex align-items-center">
            <RiLineChartLine size={22} style={{ color: SHADCN_PRIMARY }} className="me-2 flex-shrink-0" />
            Daily Case Contribution Trend
          </h2>
          <div style={{ minWidth: "180px" }}> {/* Ensured select has enough space */}
            <Select
              options={yearOptions}
              value={selectedYear}
              onChange={(option) => setSelectedYear(option as { value: number; label: string })}
              isSearchable={false}
              styles={reactSelectCustomStyles} // Pass colors to custom styles
              className="react-select-container"
              classNamePrefix="react-select"
              aria-label="Select Year"
            />
          </div>
        </div>
      </div>
      <div className="card-body p-3 p-md-4">
        {renderContent()}
      </div>
    </div>
  );
};

interface InsightCardProps { Icon: React.ElementType; title: string; value: string | number; variantColor: string; isCurrency?: boolean; }
const InsightCard: React.FC<InsightCardProps> = ({ Icon, title, value, variantColor, isCurrency = true }) => (
  <div className="col-md-4">
    <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '0.5rem', borderLeft: `4px solid ${variantColor}` }}>
      <div className="card-body p-3 d-flex flex-column">
        <div className="d-flex align-items-center mb-2">
          <Icon size={20} style={{ color: variantColor }} className="me-2 flex-shrink-0"/>
          <h6 className="text-muted small mb-0 text-truncate">{title}</h6>
        </div>
        <h4 className="fw-bold mt-auto mb-0" style={{ color: variantColor, fontSize: '1.5rem' }}>
          {isCurrency && typeof value === 'number' ? currencyFormatter.format(value) : value}
          {!isCurrency && typeof value === 'string' ? value : ''}
        </h4>
      </div>
    </div>
  </div>
);

export default ClinicianAnalyticsCaseSummaryDaily;