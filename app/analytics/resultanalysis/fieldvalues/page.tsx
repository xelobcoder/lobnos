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
  observedDate: string | null;
  testid: number;
  fieldid: number;
  rangeVersion: string;
  bucketKey: string;
  valueKind?: 'numeric' | 'categorical';
  categoricalValue?: string | null;
  observationCount: number;
  valueSum: string;
  valueSumSquares: string;
  minValue: string | null;
  maxValue: string | null;
}

interface BucketData {
  bucketKey: string;
  label: string;
  valueKind: 'numeric' | 'categorical';
  count: number;
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

  const orderedBuckets = Array.from(buckets.values()).sort((first, second) => {
    return second.count - first.count || first.label.localeCompare(second.label);
  });

  const totalObservationCount = orderedBuckets.reduce((total, bucket) => total + bucket.count, 0);

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
  }, [testid, fieldid]);

  const aggregateBuckets = (aggregates: DailyAggregate[]) => {
    const bucketMap = new Map<string, BucketData>();

    aggregates.forEach((agg) => {
      const valueKind = agg.valueKind === 'categorical' ? 'categorical' : 'numeric';
      const label = agg.categoricalValue || agg.bucketKey;
      const key = label.toLowerCase();
      const count = agg.observationCount || 0;

      if (bucketMap.has(key)) {
        const existing = bucketMap.get(key)!;
        existing.count += count;
      } else {
        bucketMap.set(key, { bucketKey: agg.bucketKey, label, valueKind, count });
      }
    });

    setBuckets(bucketMap);
  };

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
                No result values available for this field.
              </p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-3" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderRadius: '0.5rem' }}>
                <h6 className="fw-semibold mb-3">Distribution Summary</h6>
                <div className="row">
                  {orderedBuckets
                    .map((bucket) => {
                      const percentage = totalObservationCount > 0 ? ((bucket.count / totalObservationCount) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={`${bucket.valueKind}-${bucket.bucketKey}-${bucket.label}`} className="col-md-6 col-lg-4 mb-3">
                          <div className="p-3 bg-white border rounded-2">
                            <div className="fw-semibold mb-2">{bucket.label}</div>
                            <div className="small">
                              <div>Count: <strong>{bucket.count}</strong> ({percentage}%)</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="mt-4">
                <h6 className="fw-semibold mb-3">Aggregate Values</h6>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th scope="col" className="fw-semibold">Value</th>
                        <th scope="col" className="text-center fw-semibold">Type</th>
                        <th scope="col" className="text-center fw-semibold">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="badge" style={{ backgroundColor: COLOR_ACCENT }}>
                              {row.categoricalValue || row.bucketKey}
                            </span>
                          </td>
                          <td className="text-center text-capitalize">{row.valueKind || 'numeric'}</td>
                          <td className="text-center">{row.observationCount}</td>
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
