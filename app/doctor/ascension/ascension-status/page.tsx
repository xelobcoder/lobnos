'use client'
import React, { useState, useEffect } from 'react'
import { Modal, Button, Form } from 'react-bootstrap'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { customFetch, generateRandomTextAndNumbers } from '../../../../components/Auth/customFetch'
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { useApplication } from '../../../../components/Auth/useApplicationContext';

interface AscensionData {
     fullname: string;
     age: string;
     patientid: number;
     billingid: number;
     category: number;
     processingStartDate: string;
     fullpatientid: string;
     processingEndDate: string;
     resultEntryStart: string;
     resultEntryEnd: string | null;
     paymentstatus: string;
     billing_date: string;
     department: string;
     ascensionid: number;
     ascension_date: string;
     name: string;
     clinicianId: number;
     approvalstatus: number;
     printCount: number;
     id: number;
     clientstatus: string;
     organization: string | null;
     clinicianName: string;
     testid?: number;
     ptid?: string;
     csvid?: string;
     validators?: Array<{
          username: string;
          employeeid: number;
          role: string;
     }>;
}

interface TestResultItem {
     id: number;
     name: string;
     value: string;
     units: string;
     textReference: string;
     originalvalue: string;
     plan: "limits" | "reference" | "plain" | "options" | "input" | "greaterLess";
     lowerlimit: string;
     upperlimit: string;
     options: string;
}

interface TestResultResponse {
     result: TestResultItem[];
     testname: string;
}

interface TrendData {
     ascensionid: number;
     field: string;
     value: string;
     created_on: string;
     plan: string;
}

interface TrendResponse {
     data: TrendData[];
}

export default function AscensionStatus() {
     const [data, setData] = useState<AscensionData[]>([]);
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState<string | null>(null);
     const application = useApplication();
     const { branchid } = application;
     const employeeid = application?.user?.employeeid;

     // Modal state
     const [showResultModal, setShowResultModal] = useState(false);
     const [resultData, setResultData] = useState<TestResultResponse | null>(null);
     const [resultLoading, setResultLoading] = useState(false);
     const [trendData, setTrendData] = useState<TrendResponse | null>(null);
     const [currentViewItem, setCurrentViewItem] = useState<AscensionData | null>(null);
     const [selectedTrendField, setSelectedTrendField] = useState<string | null>(null);
     const [selectedTrendPlan, setSelectedTrendPlan] = useState<string | null>(null);
     const [showTrendChart, setShowTrendChart] = useState<boolean>(false);
     const [notes, setNotes] = useState<{ [key: string]: string }>({});
     const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
     const [selectedNoteItem, setSelectedNoteItem] = useState<TestResultItem | null>(null);

     // Calculate default dates: 2 days ago and today
     const getDefaultDates = () => {
          const today = new Date();
          const twoDaysAgo = new Date(today);
          twoDaysAgo.setDate(today.getDate() - 2);

          return {
               dateFrom: twoDaysAgo.toISOString().split('T')[0],
               dateEnd: today.toISOString().split('T')[0]
          };
     };

     const defaultDates = getDefaultDates();

     // Function to detect critical values (exceeds 1.5x limit or below 0.5x limit)
     const isCriticalValue = (item: TestResultItem): boolean => {
          if (item.plan !== 'limits') return false;
          const val = parseFloat(item.value);
          const min = parseFloat(item.lowerlimit);
          const max = parseFloat(item.upperlimit);
          if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
          // Critical if value exceeds 1.5x upper limit or below 0.5x lower limit
          return val > (max * 1.5) || val < (min * 0.5);
     };

     const [filters, setFilters] = useState({
          operationsStaging: 'COMPLETED',
          dateFrom: defaultDates.dateFrom,
          dateEnd: defaultDates.dateEnd,
          searchString: '',
          page: 1,
          count: 10,
          isUltrasound: false,
          employeeid: 59,
          branchid: 32,
          sortby: 'DESC',
          tenantId: 3,
          clinicianId: 1
     });

     // Update filters when context is available
     useEffect(() => {
          if (employeeid && branchid) {
               setFilters(prev => ({
                    ...prev,
                    employeeid,
                    branchid
               }));
          }
     }, [employeeid, branchid]);

     const handleViewResult = async (item: AscensionData) => {
          console.log(item);
          setShowResultModal(true);
          setResultLoading(true);
          setResultData(null);
          setTrendData(null);
          setCurrentViewItem(item);
          setShowTrendChart(false);

          try {
               // Fetch test results ONLY
               const queryParams = new URLSearchParams({
                    testid: item.testid?.toString() || '',
                    ptid: `${generateRandomTextAndNumbers(50)}${item.patientid}`,
                    csvid: `${generateRandomTextAndNumbers(70)}${item.billingid}`,
                    ascensionid: item.ascensionid.toString(),
                    employeeid: filters.employeeid.toString(),
               });

               const response = await customFetch(`testpanel/list/customtestrule/previous?${queryParams.toString()}`);
               setResultData(response);
          } catch (err) {
               console.error('Error fetching result:', err);
          } finally {
               setResultLoading(false);
          }
     };

     const handleLoadTrend = async () => {
          if (!currentViewItem) return;

          try {
               const trendParams = new URLSearchParams({
                    tenantId: '3',
                    patientid: currentViewItem.patientid.toString(),
                    testid: currentViewItem.testid?.toString() || '',
                    trendNumber: '100'
               });
               const trendResponse = await customFetch(`result/trends?${trendParams.toString()}`);
               setTrendData(trendResponse);
          } catch (trendError) {
               console.error('Error fetching trend data:', trendError);
               setTrendData(null);
          }
     };

     const handleCloseModal = () => {
          setShowResultModal(false);
          setResultData(null);
     };

     const columns = React.useMemo(
          () => [
               {
                    Header: 'Billing ID',
                    accessor: 'billingid',
                    Cell: ({ value }: any) => <strong className="text-primary">{value}</strong>
               },
               {
                    Header: 'Patient Name',
                    accessor: 'fullname',
                    Cell: ({ row }: any) => (
                         <div>
                              <div className="fw-semibold">{row.original.fullname}</div>
                              <small className="text-muted">{row.original.fullpatientid}</small>
                         </div>
                    )
               },
               {
                    Header: 'Age',
                    accessor: 'age'
               },
               {
                    Header: 'Test',
                    accessor: 'name',
                    Cell: ({ row }: any) => (
                         <div>
                              <div>{row.original.name}</div>
                              <small className="text-muted">{row.original.department}</small>
                         </div>
                    )
               },
               ...(filters.operationsStaging !== 'VALIDATED' ? [{
                    Header: 'Date',
                    accessor: 'billing_date',
                    Cell: ({ value }: any) => new Date(value).toLocaleDateString()
               }] : []),
               ...(filters.operationsStaging === 'VALIDATED' ? [{
                    Header: 'Validator',
                    accessor: 'validators',
                    Cell: ({ row }: any) => {
                         const validators = row.original.validators;
                         if (validators && validators.length > 0) {
                              return (
                                   <div>
                                        <div className="fw-semibold small">{validators[0].username}</div>
                                        <small className="text-muted">{validators[0].role}</small>
                                   </div>
                              );
                         }
                         return <span className="text-muted">-</span>;
                    }
               }, {
                    Header: 'Actions',
                    accessor: 'id',
                    Cell: ({ row }: any) => (
                         <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleViewResult(row.original)}
                         >
                              View Result
                         </button>
                    )
               }] : [])
          ],
          [filters.operationsStaging]
     );

     useEffect(() => {
          fetchAscensionData();
     }, []); // Only fetch on initial mount

     const fetchAscensionData = async () => {
          try {
               setLoading(true);
               const queryParams = new URLSearchParams({
                    operationsStaging: filters.operationsStaging,
                    dateFrom: filters.dateFrom,
                    dateEnd: filters.dateEnd,
                    searchString: filters.searchString,
                    page: filters.page.toString(),
                    count: filters.count.toString(),
                    isUltrasound: filters.isUltrasound.toString(),
                    employeeid: filters.employeeid.toString(),
                    branchid: filters.branchid.toString(),
                    sortby: filters.sortby,
                    tenantId: filters.tenantId.toString(),
                    clinicianId: filters.clinicianId.toString()
               });

               const response = await customFetch(`operations/ascension/staging?${queryParams.toString()}`);
               setData(Array.isArray(response) ? response : []);
               setError(null);
          } catch (err) {
               setError('Failed to fetch ascension data');
               console.error('Error fetching ascension data:', err);
          } finally {
               setLoading(false);
          }
     };

     const handleStatusChange = (status: string) => {
          setFilters({ ...filters, operationsStaging: status, page: 1 });
     };

     const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          fetchAscensionData();
     };

     if (loading) {
          return (
               <div className="d-flex justify-content-center align-items-center p-5">
                    <div className="spinner-border text-primary" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="alert alert-danger m-4" role="alert">
                    {error}
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               <div className="row g-3 mb-3 d-flex justify-content-between">
                    <div className="col-12 col-md-auto">
                         <select
                              className="form-select form-select-sm"
                              value={filters.operationsStaging}
                              onChange={(e) => handleStatusChange(e.target.value)}
                              style={{ minWidth: '150px' }}
                         >
                              <option value="VALIDATION">Validation</option>
                              <option value="PROCESSING">Processing</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="VALIDATED">Validated</option>
                         </select>
                    </div>
                    <div className="col-12 col-md-6">
                         <form onSubmit={handleSearch} className="row g-2">
                              <div className="col-12 col-md-4">
                                   <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="billing ID"
                                        value={filters.searchString}
                                        onChange={(e) => setFilters({ ...filters, searchString: e.target.value })}
                                   />
                              </div>
                              <div className="col-6 col-md-3">
                                   <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={filters.dateFrom}
                                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                                   />
                              </div>
                              <div className="col-6 col-md-3">
                                   <input
                                        type="date"
                                        className="form-control form-control-sm"
                                        value={filters.dateEnd}
                                        onChange={(e) => setFilters({ ...filters, dateEnd: e.target.value })}
                                   />
                              </div>
                              <div className="col-12 col-md-2">
                                   <button type="submit" className="btn btn-sm btn-outline-primary w-100">Search</button>
                              </div>
                         </form>
                    </div>
               </div>

               <PrimeTable
                    column={columns}
                    data={data}
                    filtering={true}
                    handleSeverSideProcessing={() => { }}
                    serverSideFiltering={true}
               />

               {/* Result Modal */}
               <Modal show={showResultModal} onHide={handleCloseModal} fullscreen>
                    <Modal.Header closeButton className="border-bottom" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)' }}>
                         <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center w-100 gap-2" style={{ marginRight: 'clamp(1rem, 3vw, 2rem)' }}>
                              <Modal.Title className="fw-bold h5 mb-0" style={{ fontSize: 'clamp(1rem, 4vw, 1.25rem)', minWidth: '0' }}>
                                   {resultData?.testname || 'Test Result'}
                              </Modal.Title>
                              <Button
                                   size="sm"
                                   variant={trendData ? "success" : "primary"}
                                   onClick={handleLoadTrend}
                                   disabled={resultLoading}
                                   style={{ whiteSpace: 'nowrap', fontSize: 'clamp(0.8rem, 2vw, 0.875rem)' }}
                              >
                                   {trendData ? "✓ Trend Loaded" : "Load Trend"}
                              </Button>
                         </div>
                    </Modal.Header>
                    <Modal.Body style={{ padding: 'clamp(1.5rem, 4vw, 2rem)', overflowY: 'auto' }}>
                         {resultLoading ? (
                              <div className="d-flex justify-content-center p-5">
                                   <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                   </div>
                              </div>
                         ) : resultData ? (
                              <div style={{ position: 'relative' }}>
                                   {/* Test Results Table */}
                                   <div className="mb-4">
                                        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 gap-2">
                                             <h6 className="fw-bold mb-0">Test Results</h6>
                                             {/* Legend */}
                                             <div className="d-flex flex-wrap gap-3" style={{ fontSize: '0.85rem' }}>
                                                  <div className="d-flex align-items-center gap-2">
                                                       <span style={{ fontSize: '1.2rem' }}>✓</span>
                                                       <span>Normal</span>
                                                  </div>
                                                  <div className="d-flex align-items-center gap-2">
                                                       <span>🚩</span>
                                                       <span>Abnormal</span>
                                                  </div>
                                                  <div className="d-flex align-items-center gap-2">
                                                       <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                                                       <span>Critical</span>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="table-responsive d-none d-md-block">
                                             <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.95rem' }}>
                                                  <thead className="bg-light">
                                                       <tr>
                                                            <th className="py-2 text-dark text-uppercase small" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '25%', overflow: 'hidden', textOverflow: 'ellipsis' }}>Test Name</th>
                                                            <th className="py-2 text-dark text-uppercase small" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '18%' }}>Value/Unit</th>
                                                            <th className="py-2 text-dark text-uppercase small text-center" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '15%' }}>Status</th>
                                                            <th className="py-2 ps-2 text-dark text-uppercase small text-center" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '12%' }}>Flag</th>
                                                            <th className="py-2 text-dark text-uppercase small text-center" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '25%' }}>Action</th>
                                                            <th className="py-2 pe-2 text-dark text-uppercase small" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '18%', display: 'none' }}>Reference Range</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {Array.isArray(resultData.result) && resultData.result.length > 0 && resultData.result.map((item) => {
                                                            const isOutOfRange = () => {
                                                                 if (item.plan !== 'limits') return false;
                                                                 const val = parseFloat(item.value);
                                                                 const min = parseFloat(item.lowerlimit);
                                                                 const max = parseFloat(item.upperlimit);
                                                                 if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
                                                                 return val < min || val > max;
                                                            };

                                                            const getComparisonStatus = () => {
                                                                 if (item.plan === 'limits') {
                                                                      const val = parseFloat(item.value);
                                                                      const min = parseFloat(item.lowerlimit);
                                                                      const max = parseFloat(item.upperlimit);
                                                                      if (isNaN(val) || isNaN(min) || isNaN(max)) return null;
                                                                      if (val < min) return { label: 'LOWER', color: '#dc3545' };
                                                                      if (val > max) return { label: 'HIGHER', color: '#dc3545' };
                                                                      return { label: 'NORMAL', color: '#198754' };
                                                                 } else if (item.plan === 'greaterLess') {
                                                                      const val = parseFloat(item.value);
                                                                      const refValue = parseFloat(item.textReference);
                                                                      if (isNaN(val) || isNaN(refValue)) return null;
                                                                      if (val < refValue) return { label: 'LOWER', color: '#dc3545' };
                                                                      if (val > refValue) return { label: 'HIGHER', color: '#dc3545' };
                                                                      return { label: 'EQUAL', color: '#198754' };
                                                                 }
                                                                 return null;
                                                            };

                                                            const outOfRange = isOutOfRange();
                                                            const comparisonStatus = getComparisonStatus();
                                                            const shouldHighlight = outOfRange || (comparisonStatus && comparisonStatus.color === '#dc3545');
                                                            const rowClassName = '';

                                                            return (
                                                                 <tr
                                                                      key={item.id}
                                                                      style={{
                                                                           position: 'relative',
                                                                           cursor: 'pointer',
                                                                           transition: 'background-color 0.2s ease'
                                                                      }}
                                                                      className={rowClassName}
                                                                 >
                                                                      <td className="ps-2 py-2" style={{ width: '25%', borderRight: '1px solid var(--bs-border-color)' }}>
                                                                           <div className="fw-medium text-dark" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</div>
                                                                           {item.plan === 'reference' && (
                                                                                <small className="text-muted d-block" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Method: {item.textReference}</small>
                                                                           )}
                                                                      </td>
                                                                      <td className="py-2" style={{ width: '18%' }}>
                                                                           <div>
                                                                                <span className={`fw-bold ${shouldHighlight ? 'text-danger' : 'text-dark'}`}>
                                                                                     {item.value}
                                                                                </span>
                                                                                {' '}
                                                                                <span className="fw-bold text-muted" style={{ fontSize: '0.9em', letterSpacing: '0.5px' }}>
                                                                                     {item.units}
                                                                                </span>
                                                                           </div>
                                                                      </td>
                                                                      <td className="py-2 text-center" style={{ width: '15%' }}>
                                                                           {comparisonStatus && (
                                                                                <span className="badge" style={{ backgroundColor: comparisonStatus.color, fontSize: '0.75rem' }}>
                                                                                     {comparisonStatus.label}
                                                                                </span>
                                                                           )}
                                                                      </td>
                                                                      <td className="py-2 text-center" style={{ width: '12%' }}>
                                                                           {isCriticalValue(item) ? (
                                                                                <span title="Critical Value" style={{ fontSize: '1.2rem', cursor: 'help' }}>⚠️</span>
                                                                           ) : shouldHighlight ? (
                                                                                <span>🚩</span>
                                                                           ) : (
                                                                                <span>✓</span>
                                                                           )}
                                                                      </td>
                                                                      <td className="py-2 text-center" style={{ width: '25%' }}>
                                                                           <div className="d-flex gap-2 justify-content-center flex-wrap">
                                                                                <Button
                                                                                     size="sm"
                                                                                     variant="outline-primary"
                                                                                     disabled={!trendData}
                                                                                     onClick={() => {
                                                                                          setSelectedTrendField(item.name);
                                                                                          setSelectedTrendPlan(item.plan);
                                                                                          setShowTrendChart(true);
                                                                                     }}
                                                                                     title="View trend analysis"
                                                                                >
                                                                                     📊 Trend
                                                                                </Button>
                                                                                <Button
                                                                                     size="sm"
                                                                                     variant="outline-warning"
                                                                                     onClick={() => {
                                                                                          setSelectedNoteItem(item);
                                                                                          setShowNotesModal(true);
                                                                                     }}
                                                                                     title="Add interpretation/notes"
                                                                                >
                                                                                     📝 Notes
                                                                                </Button>
                                                                           </div>
                                                                      </td>
                                                                 </tr>
                                                            );
                                                       })}
                                                  </tbody>
                                             </table>
                                        </div>

                                        {/* Mobile List View */}
                                        <div className="d-md-none">
                                             {Array.isArray(resultData.result) && resultData.result.length > 0 && resultData.result.map((item) => {
                                                  const isOutOfRange = () => {
                                                       if (item.plan !== 'limits') return false;
                                                       const val = parseFloat(item.value);
                                                       const min = parseFloat(item.lowerlimit);
                                                       const max = parseFloat(item.upperlimit);
                                                       if (isNaN(val) || isNaN(min) || isNaN(max)) return false;
                                                       return val < min || val > max;
                                                  };

                                                  const getComparisonStatus = () => {
                                                       if (item.plan === 'limits') {
                                                            const val = parseFloat(item.value);
                                                            const min = parseFloat(item.lowerlimit);
                                                            const max = parseFloat(item.upperlimit);
                                                            if (isNaN(val) || isNaN(min) || isNaN(max)) return null;
                                                            if (val < min) return { label: 'LOWER', color: '#dc3545' };
                                                            if (val > max) return { label: 'HIGHER', color: '#dc3545' };
                                                            return { label: 'NORMAL', color: '#198754' };
                                                       } else if (item.plan === 'greaterLess') {
                                                            const val = parseFloat(item.value);
                                                            const refValue = parseFloat(item.textReference);
                                                            if (isNaN(val) || isNaN(refValue)) return null;
                                                            if (val < refValue) return { label: 'LOWER', color: '#dc3545' };
                                                            if (val > refValue) return { label: 'HIGHER', color: '#dc3545' };
                                                            return { label: 'EQUAL', color: '#198754' };
                                                       }
                                                       return null;
                                                  };

                                                  const outOfRange = isOutOfRange();
                                                  const comparisonStatus = getComparisonStatus();
                                                  const shouldHighlight = outOfRange || (comparisonStatus && comparisonStatus.color === '#dc3545');

                                                  return (
                                                       <div key={item.id} className="card mb-2" style={{ borderLeft: `4px solid ${shouldHighlight ? '#dc3545' : '#198754'}` }}>
                                                            <div className="card-body p-3">
                                                                 <div className="d-flex justify-content-between align-items-start mb-2">
                                                                      <div>
                                                                           <h6 className="card-title fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{item.name}</h6>
                                                                           {item.plan === 'reference' && (
                                                                                <small className="text-muted">Method: {item.textReference}</small>
                                                                           )}
                                                                      </div>
                                                                      <div>
                                                                           {isCriticalValue(item) ? (
                                                                                <span title="Critical Value" style={{ fontSize: '1.2rem' }}>⚠️</span>
                                                                           ) : shouldHighlight ? (
                                                                                <span>🚩</span>
                                                                           ) : (
                                                                                <span>✓</span>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                                 <div className="row g-2 mb-2">
                                                                      <div className="col-6">
                                                                           <small className="text-muted d-block">Value</small>
                                                                           <span className={`fw-bold ${shouldHighlight ? 'text-danger' : 'text-dark'}`}>{item.value}</span>
                                                                           {' '}
                                                                           <span className="fw-bold text-muted" style={{ fontSize: '0.85em' }}>{item.units}</span>
                                                                      </div>
                                                                      <div className="col-6 text-end">
                                                                           <small className="text-muted d-block">Status</small>
                                                                           {comparisonStatus && (
                                                                                <span className="badge" style={{ backgroundColor: comparisonStatus.color }}>
                                                                                     {comparisonStatus.label}
                                                                                </span>
                                                                           )}
                                                                      </div>
                                                                 </div>
                                                                 <div className="mb-2">
                                                                      <small className="text-muted d-block">Reference Range</small>
                                                                      <small className="text-dark">
                                                                           {item.plan === "limits" ? (
                                                                                <span>{item.lowerlimit} - {item.upperlimit}</span>
                                                                           ) : (
                                                                                <span>{item.textReference}</span>
                                                                           )}
                                                                      </small>
                                                                 </div>
                                                                 <div className="d-flex gap-2">
                                                                      <Button
                                                                           size="sm"
                                                                           variant="outline-primary"
                                                                           disabled={!trendData}
                                                                           onClick={() => {
                                                                                setSelectedTrendField(item.name);
                                                                                setSelectedTrendPlan(item.plan);
                                                                                setShowTrendChart(true);
                                                                           }}
                                                                           className="flex-grow-1"
                                                                           title="View trend analysis"
                                                                      >
                                                                           📊 Trend
                                                                      </Button>
                                                                      <Button
                                                                           size="sm"
                                                                           variant="outline-warning"
                                                                           onClick={() => {
                                                                                setSelectedNoteItem(item);
                                                                                setShowNotesModal(true);
                                                                           }}
                                                                           className="flex-grow-1"
                                                                      >
                                                                           📝 Notes
                                                                      </Button>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  );
                                             })}
                                        </div>
                                   </div>

                                   {/* Dialog removed - now rendered inside table row */}
                              </div>
                         ) : (
                              <div className="text-center p-5 text-muted">
                                   <div className="mb-2">No result data available</div>
                                   <small>Please try again or contact support if the issue persists.</small>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer className="border-top" style={{ padding: '1.5rem' }}>
                         <Button size="sm" variant="outline-secondary" onClick={handleCloseModal}>
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Trend Chart Modal */}
               <Modal show={showTrendChart} onHide={() => {
                    setShowTrendChart(false);
                    setSelectedTrendField(null);
               }} size="lg">
                    <Modal.Header closeButton className="border-bottom">
                         <Modal.Title className="fw-bold">
                              📊 Trend Analysis
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedTrendField && trendData && trendData.data && (() => {
                              const relatedTrends = trendData.data.filter(t => t.field === selectedTrendField);

                              if (relatedTrends.length === 0) {
                                   return (
                                        <div className="text-center p-5 text-muted">
                                             <div className="mb-2">No trend data available</div>
                                             <small>No historical data found for {selectedTrendField}</small>
                                        </div>
                                   );
                              }

                              // For options or input plans, show table instead of chart
                              if (selectedTrendPlan === 'options' || selectedTrendPlan === 'input') {
                                   return (
                                        <div>
                                             <div className="mb-3">
                                                  <small className="text-muted">Test Parameter</small>
                                                  <div className="fw-bold text-dark">{selectedTrendField}</div>
                                                  <div className="small text-muted mt-1">
                                                       {relatedTrends.length} data points available
                                                  </div>
                                             </div>
                                             <div className="table-responsive">
                                                  <table className="table table-bordered table-striped mb-0">
                                                       <thead className="table-light">
                                                            <tr>
                                                                 <th style={{ width: '10%' }}>#</th>
                                                                 <th style={{ width: '40%' }}>Value</th>
                                                                 <th style={{ width: '50%' }}>Date</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {relatedTrends.reverse().map((trend, index) => (
                                                                 <tr key={index}>
                                                                      <td>{index + 1}</td>
                                                                      <td className="fw-semibold">{trend.value}</td>
                                                                      <td>{new Date(trend.created_on).toLocaleString()}</td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        </div>
                                   );
                              }

                              // For numeric plans, show chart
                              const chartData = relatedTrends.reverse().map((trend, index) => ({
                                   name: index + 1,
                                   value: parseFloat(trend.value) || 0,
                                   date: new Date(trend.created_on).toLocaleDateString()
                              }));

                              return (
                                   <div>
                                        <div className="mb-3">
                                             <small className="text-muted">Test Parameter</small>
                                             <div className="fw-bold text-dark">{selectedTrendField}</div>
                                             <div className="small text-muted mt-1">
                                                  {relatedTrends.length} data points available
                                             </div>
                                        </div>

                                        <div style={{ width: '100%', height: '300px' }}>
                                             <ResponsiveContainer width="100%" height="100%">
                                                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                                       <defs>
                                                            <linearGradient id="colorTrendModal" x1="0" y1="0" x2="0" y2="1">
                                                                 <stop offset="5%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.3} />
                                                                 <stop offset="95%" stopColor="oklch(0.646 0.222 41.116)" stopOpacity={0.05} />
                                                            </linearGradient>
                                                       </defs>
                                                       <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="var(--bs-border-color)" vertical={false} />
                                                       <XAxis
                                                            dataKey="name"
                                                            fontSize={11}
                                                            tick={{ fill: '#6c757d' }}
                                                            axisLine={{ stroke: 'var(--bs-border-color)' }}
                                                            tickLine={{ stroke: 'var(--bs-border-color)' }}
                                                            label={{ value: 'Data Point', position: 'insideBottom', offset: -10, style: { fill: '#6c757d', fontSize: 11 } }}
                                                       />
                                                       <YAxis
                                                            fontSize={11}
                                                            tick={{ fill: '#6c757d' }}
                                                            domain={['dataMin - 0.5', 'dataMax + 0.5']}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            width={50}
                                                       />
                                                       <Tooltip
                                                            contentStyle={{
                                                                 backgroundColor: '#fff',
                                                                 border: '1px solid var(--bs-border-color)',
                                                                 borderRadius: '6px',
                                                                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                                 fontSize: '0.85rem',
                                                                 padding: '10px 14px'
                                                            }}
                                                            formatter={(value: any, name: any, props: any) => [
                                                                 <span key="value">
                                                                      <strong>{value.toFixed(2)}</strong>
                                                                      <br />
                                                                      <small className="text-muted">{props.payload.date}</small>
                                                                 </span>,
                                                                 'Value'
                                                            ]}
                                                       />
                                                       <Area
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke="oklch(0.646 0.222 41.116)"
                                                            fill="url(#colorTrendModal)"
                                                            strokeWidth={3}
                                                            fillOpacity={0.6}
                                                            dot={{ fill: 'oklch(0.646 0.222 41.116)', strokeWidth: 2, r: 4 }}
                                                            activeDot={{ r: 6, stroke: 'oklch(0.646 0.222 41.116)', strokeWidth: 2 }}
                                                       />
                                                  </AreaChart>
                                             </ResponsiveContainer>
                                        </div>

                                        <div className="mt-4 pt-3 border-top">
                                             <div className="row g-3">
                                                  <div className="col-6">
                                                       <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                            <small className="text-muted d-block mb-1">Total Records</small>
                                                            <div className="fw-bold" style={{ fontSize: '1.25rem' }}>{relatedTrends.length}</div>
                                                       </div>
                                                  </div>
                                                  <div className="col-6">
                                                       <div className="p-3 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                                                            <small className="text-muted d-block mb-1">Latest Value</small>
                                                            <div className="fw-bold" style={{ fontSize: '1.25rem', color: 'oklch(0.646 0.222 41.116)' }}>
                                                                 {relatedTrends[relatedTrends.length - 1].value}
                                                            </div>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              );
                         })()}
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                         <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                   setShowTrendChart(false);
                                   setSelectedTrendField(null);
                                   setSelectedTrendPlan(null);
                              }}
                         >
                              Close
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Interpretation/Notes Modal */}
               <Modal show={showNotesModal} onHide={() => {
                    setShowNotesModal(false);
                    setSelectedNoteItem(null);
               }}>
                    <Modal.Header closeButton className="border-bottom">
                         <Modal.Title className="fw-bold">
                              📝 Interpretation/Notes
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedNoteItem && (
                              <div>
                                   <div className="mb-3">
                                        <small className="text-muted">Test Parameter</small>
                                        <div className="fw-bold text-dark">{selectedNoteItem.name}</div>
                                        <div className="small text-muted mt-1">
                                             Value: <span className="text-danger fw-bold">{selectedNoteItem.value} {selectedNoteItem.units}</span>
                                        </div>
                                   </div>
                                   <div>
                                        <label className="form-label fw-semibold">Clinical Interpretation:</label>
                                        <Form.Control
                                             as="textarea"
                                             rows={4}
                                             placeholder="Enter clinical interpretation, notes, or abnormal findings for this result..."
                                             value={notes[selectedNoteItem.id] || ''}
                                             onChange={(e) => {
                                                  setNotes({
                                                       ...notes,
                                                       [selectedNoteItem.id]: e.target.value
                                                  });
                                             }}
                                             className="border-1"
                                        />
                                        <small className="text-muted d-block mt-2">
                                             {notes[selectedNoteItem.id] ? `${notes[selectedNoteItem.id].length} characters` : 'No notes yet'}
                                        </small>
                                   </div>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                         <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                   setShowNotesModal(false);
                                   setSelectedNoteItem(null);
                              }}
                         >
                              Close
                         </Button>
                         <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                   console.log('Notes saved:', notes);
                                   setShowNotesModal(false);
                              }}
                         >
                              Save Notes
                         </Button>
                    </Modal.Footer>
               </Modal>

               {/* Interpretation/Notes Modal */}
               <Modal show={showNotesModal} onHide={() => {
                    setShowNotesModal(false);
                    setSelectedNoteItem(null);
               }}>
                    <Modal.Header closeButton className="border-bottom">
                         <Modal.Title className="fw-bold">
                              📝 Interpretation/Notes
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                         {selectedNoteItem && (
                              <div>
                                   <div className="mb-3">
                                        <small className="text-muted">Test Parameter</small>
                                        <div className="fw-bold text-dark">{selectedNoteItem.name}</div>
                                        <div className="small text-muted mt-1">
                                             Value: <span className="text-danger fw-bold">{selectedNoteItem.value} {selectedNoteItem.units}</span>
                                        </div>
                                   </div>
                                   <div>
                                        <label className="form-label fw-semibold">Clinical Interpretation:</label>
                                        <Form.Control
                                             as="textarea"
                                             rows={4}
                                             placeholder="Enter clinical interpretation, notes, or abnormal findings for this result..."
                                             value={notes[selectedNoteItem.id] || ''}
                                             onChange={(e) => {
                                                  setNotes({
                                                       ...notes,
                                                       [selectedNoteItem.id]: e.target.value
                                                  });
                                             }}
                                             className="border-1"
                                        />
                                        <small className="text-muted d-block mt-2">
                                             {notes[selectedNoteItem.id] ? `${notes[selectedNoteItem.id].length} characters` : 'No notes yet'}
                                        </small>
                                   </div>
                              </div>
                         )}
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                         <Button
                              size="sm"
                              variant="outline-secondary"
                              onClick={() => {
                                   setShowNotesModal(false);
                                   setSelectedNoteItem(null);
                              }}
                         >
                              Close
                         </Button>
                         <Button
                              size="sm"
                              variant="primary"
                              onClick={() => {
                                   setShowNotesModal(false);
                                   setSelectedNoteItem(null);
                              }}
                         >
                              Save
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}