"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RiFlaskLine, RiArrowRightLine, RiLoader4Line, RiErrorWarningLine, RiInbox2Line, RiSearchLine, RiArrowLeftLine } from "@remixicon/react";
import { customFetch } from "../../../../../components/Auth/customFetch";
import { useApplication } from "../../../../../components/Auth/useApplicationContext";

const COLOR_ACCENT = 'oklch(0.646 0.222 41.116)';
const COLOR_BORDER = 'var(--bs-border-color)';
const COLOR_TEXT_MUTED = 'var(--bs-secondary-color)';

interface TestField {
  id?: number;
  fieldid?: number;
  name: string;
  field?: string;
  units?: string;
  plan?: string;
}

interface TestItem {
  testid: number | string;
  testname: string;
}

export default function FieldSelectorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const testid = searchParams?.get('testid');
  const testname = searchParams?.get('testname') || 'Test';
  const { user } = useApplication();
  const employeeid = user?.employeeid;

  const [tests, setTests] = useState<TestItem[]>([]);
  const [fields, setFields] = useState<TestField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      if (testid) {
        // Fetch fields for the specific test
        try {
          const response = await customFetch(`testpanel/test/creation-rules?testid=${testid}`);
          if (Array.isArray(response?.result)) {
            setFields(response.result);
          } else if (Array.isArray(response)) {
            setFields(response);
          } else {
            setFields([]);
          }
        } catch (err) {
          setError('Failed to fetch test fields');
          console.error(err);
        } finally {
          setLoading(false);
        }
      } else {
        // No testid: fetch all available tests for selection
        try {
          const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=${employeeid || 1}`);
          if (Array.isArray(response)) {
            setTests(response.map((item: any) => ({
              testid: item.testid,
              testname: item.testname || `Test #${item.testid}`,
            })));
          } else {
            setTests([]);
          }
        } catch (err) {
          setError('Failed to fetch tests list');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [testid, employeeid]);

  const handleFieldClick = (field: TestField) => {
    const fieldid = field.id || field.fieldid;
    const fieldName = field.name || field.field;
    router.push(`/analytics/resultanalysis/fieldvalues?testid=${testid}&fieldid=${fieldid}&fieldName=${encodeURIComponent(fieldName)}`);
  };

  const handleTestClick = (test: TestItem) => {
    router.push(`/analytics/resultanalysis/fieldvalues/selector?testid=${test.testid}&testname=${encodeURIComponent(test.testname)}`);
  };

  const filteredTests = tests.filter((t) =>
    t.testname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(t.testid).includes(searchQuery)
  );

  return (
    <div className="container-fluid px-4 py-3">
      <div className="card" style={{ borderRadius: '0.75rem', borderColor: COLOR_BORDER }}>
        <div className="card-header py-3 px-4 d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bs-tertiary-bg)', borderColor: COLOR_BORDER }}>
          <h2 className="fs-6 fw-semibold text-body-emphasis mb-0 d-flex align-items-center">
            <RiFlaskLine size={22} style={{ color: COLOR_ACCENT }} className="me-2 flex-shrink-0" />
            {testid ? `Select Numeric Field: ${testname}` : 'Select Test for Value Distribution Analytics'}
          </h2>
          {testid && (
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center"
              onClick={() => router.push('/analytics/resultanalysis/fieldvalues/selector')}
            >
              <RiArrowLeftLine size={16} className="me-1" />
              All Tests
            </button>
          )}
        </div>

        <div className="card-body p-3 p-md-4">
          {!testid && (
            <div className="mb-4">
              <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text" style={{ borderColor: COLOR_BORDER, backgroundColor: 'var(--bs-tertiary-bg)' }}>
                  <RiSearchLine size={18} style={{ color: COLOR_TEXT_MUTED }} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ borderColor: COLOR_BORDER }}
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '350px' }}>
              <RiLoader4Line size={48} className="animate-spin mb-3" style={{ color: COLOR_ACCENT }} />
              <p className="text-muted" style={{ color: COLOR_TEXT_MUTED }}>{testid ? 'Loading fields...' : 'Loading tests...'}</p>
            </div>
          ) : error ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
              <RiErrorWarningLine size={48} className="mb-3 text-danger" />
              <h5 className="fw-medium mb-1">Error Loading Data</h5>
              <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>{error}</p>
            </div>
          ) : testid ? (
            // Field selection view for specific test
            fields.filter((f) => f.plan === 'limits').length === 0 ? (
              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                <h5 className="fw-medium mb-1">No Numeric Fields Available</h5>
                <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                  This test has no numeric range fields configured for analytics.
                </p>
              </div>
            ) : (
              <div className="row">
                {fields.filter((f) => f.plan === 'limits').map((field, idx) => {
                  const fieldid = field.id || field.fieldid;
                  const fieldName = field.name || field.field;
                  return (
                    <div key={idx} className="col-md-6 col-lg-4 mb-3">
                      <div
                        className="p-4 border rounded-2 h-100"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'var(--bs-body-bg)',
                          borderColor: COLOR_BORDER,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                        onClick={() => handleFieldClick(field)}
                      >
                        <div className="d-flex align-items-start justify-content-between">
                          <div className="flex-grow-1">
                            <h6 className="fw-semibold mb-2">{fieldName}</h6>
                            {field.units && (
                              <p className="small text-muted mb-2">Unit: <strong>{field.units}</strong></p>
                            )}
                            <p className="small text-muted mb-0">ID: {fieldid}</p>
                          </div>
                          <RiArrowRightLine size={20} style={{ color: COLOR_ACCENT, marginLeft: '1rem', flexShrink: 0 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            // Test selection view
            filteredTests.length === 0 ? (
              <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '350px' }}>
                <RiInbox2Line size={48} className="mb-3 text-muted" style={{ color: COLOR_TEXT_MUTED }} />
                <h5 className="fw-medium mb-1">No Tests Found</h5>
                <p className="text-muted px-3" style={{ color: COLOR_TEXT_MUTED }}>
                  No tests matching your search query.
                </p>
              </div>
            ) : (
              <div className="row">
                {filteredTests.map((test, idx) => (
                  <div key={idx} className="col-md-6 col-lg-4 mb-3">
                    <div
                      className="p-4 border rounded-2 h-100"
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'var(--bs-body-bg)',
                        borderColor: COLOR_BORDER,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 4px 12px rgba(0,0,0,0.1)`;
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                      onClick={() => handleTestClick(test)}
                    >
                      <div className="d-flex align-items-start justify-content-between">
                        <div className="flex-grow-1">
                          <h6 className="fw-semibold mb-1">{test.testname}</h6>
                          <p className="small text-muted mb-0">Test ID: {test.testid}</p>
                        </div>
                        <RiArrowRightLine size={20} style={{ color: COLOR_ACCENT, marginLeft: '1rem', flexShrink: 0 }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
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
