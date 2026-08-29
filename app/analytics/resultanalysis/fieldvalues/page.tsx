"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RiFlaskLine, RiBarChart2Line, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiArrowLeftLine } from "@remixicon/react";
import { customFetch } from "../../../../components/Auth/customFetch";
import { useApplication } from "../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface DailyAggregate {
  observedDate: string;
  testid: number;
  fieldid: number;
  rangeVersion: string;
  bucketKey: string;
  observationCount: number;
  valueSum: string;
  valueSumSquares: string;
  minValue: string | null;
  maxValue: string | null;
}

interface BucketData {
  bucketKey: string;
  count: number;
  sum: number;
  min: number | null;
  max: number | null;
  mean: number;
}

export default function ResultValueAnalyticsPage() {
  const { user } = useApplication();
  const router = useRouter();
  const searchParams = useSearchParams();
  const testid = searchParams?.get('testid');
  const fieldid = searchParams?.get('fieldid');
  const fieldName = searchParams?.get('fieldName') || 'Field';

  const [data, setData] = useState<DailyAggregate[]>([]);
  const [buckets, setBuckets] = useState<Map<string, BucketData>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    const fetchData = async () => {
      if (!testid || !fieldid) {
        setError('Missing testid or fieldid. Please navigate from the Test Analysis page.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const query = new URLSearchParams({
          testid: testid as string,
          fieldid: fieldid as string,
          ...(dateRange.start && { startDate: dateRange.start }),
          ...(dateRange.end && { endDate: dateRange.end }),
        });

        const response = await customFetch(`result/analysis/test/field/aggregates?${query}`);

        if (Array.isArray(response?.result)) {
          setData(response.result);
          aggregateBuckets(response.result);
        } else {
          setData([]);
          setBuckets(new Map());
        }
      } catch (err) {
        setError('Failed to fetch result value analytics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [testid, fieldid, dateRange]);

  const aggregateBuckets = (aggregates: DailyAggregate[]) => {
    const bucketMap = new Map<string, BucketData>();

    aggregates.forEach((agg) => {
      const key = agg.bucketKey;
      const count = agg.observationCount || 0;
      const sum = parseFloat(agg.valueSum || '0');
      const min = agg.minValue ? parseFloat(agg.minValue) : null;
      const max = agg.maxValue ? parseFloat(agg.maxValue) : null;
      const mean = count > 0 ? sum / count : 0;

      if (bucketMap.has(key)) {
        const existing = bucketMap.get(key)!;
        existing.count += count;
        existing.sum += sum;
        existing.min = existing.min !== null && min !== null ? Math.min(existing.min, min) : min ?? existing.min;
        existing.max = existing.max !== null && max !== null ? Math.max(existing.max, max) : max ?? existing.max;
        existing.mean = existing.count > 0 ? existing.sum / existing.count : 0;
      } else {
        bucketMap.set(key, { bucketKey: key, count, sum, min, max, mean });
      }
    });

    setBuckets(bucketMap);
  };

  const bucketLabels: Record<string, string> = {
    'below_range': '🔴 Below Reference Range',
    'range_0_25': '🟡 0-25% of Range',
    'range_25_50': '🟡 25-50% of Range',
    'range_50_75': '🟢 50-75% of Range',
    'range_75_100': '🟢 75-100% of Range',
    'above_range': '🔴 Above Reference Range',
    'at_reference_value': '🟢 At Reference Value',
    'no_reference_range': '⚪ No Reference Range',
  };

  const bucketOrder = [
    'below_range',
    'range_0_25',
    'range_25_50',
    'range_50_75',
    'range_75_100',
    'above_range',
    'at_reference_value',
    'no_reference_range',
  ];

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
        <div className="card-header py-3 px-4" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
          <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
            <RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
            Result Value Analytics: {fieldName}
            <RiBarChart2Line size={26} className="ms-2 flex-shrink-0" style={{ color: COLOR_TEXT_MUTED }} />
          </h2>
        </div>

        <div className="card-body p-3 p-md-4">
          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>Loading analytics data...</p>
            </div>
          ) : error ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
              <h5 className="fw-medium mb-1">Error Loading Data</h5>
              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
              <button 
                className="btn btn-primary mt-3 d-flex align-items-center"
                onClick={() => router.push('/analytics/resultanalysis/alltest')}
              >
                <RiArrowLeftLine size={18} className="me-2" />
                Go to Test Analysis
              </button>
            </div>
          ) : buckets.size === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
              <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
              <h5 className="fw-medium mb-1">No Data Available</h5>
              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                No numeric result values available for this field.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderRadius: '0.5rem' }}>
                <h6 className="fw-semibold mb-3">Distribution Summary</h6>
                <div className="row">
                  {bucketOrder
                    .filter((key) => buckets.has(key))
                    .map((key) => {
                      const bucket = buckets.get(key)!;
                      const percentage = ((bucket.count / data.length) * 100).toFixed(1);
                      return (
                        <div key={key} className="col-md-6 col-lg-4 mb-3">
                          <div className="p-3 bg-white border rounded-2">
                            <div className="fw-semibold mb-2">{bucketLabels[key] || key}</div>
                            <div className="small">
                              <div>Count: <strong>{bucket.count}</strong> ({percentage}%)</div>
                              <div>Mean: <strong>{bucket.mean.toFixed(4)}</strong></div>
                              <div>Range: <strong>{bucket.min?.toFixed(4) || 'N/A'}</strong> - <strong>{bucket.max?.toFixed(4) || 'N/A'}</strong></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-4">
                <h6 className="fw-semibold mb-3">Daily Observations</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="fw-semibold">Date</th>
                        <th scope="col" className="fw-semibold">Range Classification</th>
                        <th scope="col" className="text-center fw-semibold">Count</th>
                        <th scope="col" className="text-center fw-semibold">Mean</th>
                        <th scope="col" className="text-center fw-semibold">Min</th>
                        <th scope="col" className="text-center fw-semibold">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.observedDate}</td>
                          <td>
                            <span className="badge" style={{ backgroundColor: COLOR_ACCENT }}>
                              {bucketLabels[row.bucketKey] || row.bucketKey}
                            </span>
                          </td>
                          <td className="text-center">{row.observationCount}</td>
                          <td className="text-center">{(parseFloat(row.valueSum) / row.observationCount).toFixed(4)}</td>
                          <td className="text-center">{row.minValue ? parseFloat(row.minValue).toFixed(4) : 'N/A'}</td>
                          <td className="text-center">{row.maxValue ? parseFloat(row.maxValue).toFixed(4) : 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

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
