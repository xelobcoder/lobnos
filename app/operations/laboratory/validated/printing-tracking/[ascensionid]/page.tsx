'use client';
import React, { useEffect, useState, use } from 'react';
import { customFetch } from "../../../../../../components/Auth/customFetch";
import { RiEyeLine, RiPrinterLine } from '@remixicon/react';
import { Spinner, Alert, Button, Collapse } from "react-bootstrap";

type TrackingRow = {
     trackid: number;
     ascensionid: number;
     employeeid: number;
     action: string;
     actionon: string;
     count?: number;
     employee_name: string;
     employee_role: string;
     test_name: string;
     test_shorttext: string;
     test_category: number;
     test_id: number;
};

export default function Page(props: { params: Promise<{ ascensionid: string }> }) {
     const params = use(props.params);
     const ascensionid = params.ascensionid;
     const [data, setData] = useState<TrackingRow[]>([]);
     const [loading, setLoading] = useState(true);
     const [isRefreshing, setIsRefreshing] = useState(false);
     const [error, setError] = useState<string | null>(null);
     const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
     const [currentPage, setCurrentPage] = useState(1);
     const [totalRecords, setTotalRecords] = useState(0);
     const pageSize = 20;

     const fetchData = async (refreshing = false, page = 1) => {
          try {
               if (refreshing) setIsRefreshing(true);
               else setLoading(true);

               const response = await customFetch(`result/printingtracking/ascension/${ascensionid}?page=${page}&count=${pageSize}`);

               if (response && response.data && Array.isArray(response.data)) {
                    const validData = response.data.filter((item: unknown) => item !== null && item !== undefined);
                    setData(validData);
                    setTotalRecords(response.pagination?.total || 0);
               } else if (Array.isArray(response)) {
                    const validData = response.filter(item => item !== null && item !== undefined);
                    setData(validData);
                    setTotalRecords(validData.length);
               } else {
                    setData([]);
                    setTotalRecords(0);
               }
               setError(null);
          } catch (err) {
               setError("Failed to load printing tracking data");
          } finally {
               setLoading(false);
               setIsRefreshing(false);
          }
     };

     useEffect(() => {
          fetchData(false, currentPage);
     }, [ascensionid, currentPage]);

     const handleRefresh = () => {
          fetchData(true, currentPage);
     };

     const toggleItem = (trackid: number) => {
          setExpandedItems(prev => {
               const newSet = new Set(prev);
               if (newSet.has(trackid)) {
                    newSet.delete(trackid);
               } else {
                    newSet.add(trackid);
               }
               return newSet;
          });
     };

     const totalPages = Math.ceil(totalRecords / pageSize);

     const handlePageChange = (page: number) => {
          if (page >= 1 && page <= totalPages) {
               setCurrentPage(page);
          }
     };

     if (loading) {
          return <div className="d-flex align-items-center gap-2"><Spinner animation="border" size="sm" /> Loading printing tracking...</div>;
     }

     if (error) {
          return <Alert variant="danger">{error}</Alert>;
     }

     return (
          <div>
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                         <h6 className="mb-0">Printing Tracking: {ascensionid}</h6>
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={handleRefresh}
                              disabled={isRefreshing}
                              className="d-flex align-items-center gap-2"
                         >
                              {isRefreshing ? (
                                   <>
                                        <Spinner animation="border" size="sm" />
                                        <span>Refreshing...</span>
                                   </>
                              ) : (
                                   <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-clockwise" viewBox="0 0 16 16">
                                             <path fillRule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z" />
                                             <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z" />
                                        </svg>
                                        <span>Refresh Data</span>
                                   </>
                              )}
                         </Button>
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                         <span className="text-muted small me-2">
                              Total: {totalRecords > 0 ? totalRecords : data.length} records
                         </span>
                         <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                         >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                   <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
                              </svg>
                         </Button>
                         <span className="d-flex align-items-center px-2 text-muted small">
                              Page {currentPage} {totalPages > 0 ? `of ${totalPages}` : ''}
                         </span>
                         <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                         >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                   <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                              </svg>
                         </Button>
                    </div>
               </div>

               {data.length > 0 ? (
                    <div className="position-relative" style={{ paddingLeft: '40px' }}>
                         {/* Timeline Line */}
                         <div
                              style={{
                                   position: 'absolute',
                                   left: '12px',
                                   top: '0',
                                   bottom: '0',
                                   width: '2px',
                                   backgroundColor: '#dee2e6'
                              }}
                         />

                         {data.map((item, index) => {
                              return (
                                   <div key={item.trackid} className="position-relative" style={{ marginBottom: '0px', borderTop: '1px solid #dee2e6', paddingTop: '16px' }}>
                                        {/* Timeline Dot */}
                                        <div
                                             style={{
                                                  position: 'absolute',
                                                  left: '-24px',
                                                  top: '24px',
                                                  width: '16px',
                                                  height: '16px',
                                                  borderRadius: '50%',
                                                  backgroundColor: item.action === 'printed' ? '#0d6efd' : '#dc3545',
                                                  border: '4px solid white',
                                                  boxShadow: '0 0 0 2px ' + (item.action === 'printed' ? '#0d6efd' : '#dc3545'),
                                                  zIndex: 1
                                             }}
                                        />

                                        <div style={{ paddingLeft: '20px', paddingBottom: '16px' }}>
                                             <h6 className="mb-1 fw-bold">
                                                  {item.action === 'view' ? 'Report Preview' : 'Report Printed'}
                                             </h6>
                                             <small className="text-muted d-block mb-2">
                                                  {new Date(item.actionon).toLocaleString('en-US', {
                                                       day: 'numeric',
                                                       month: 'short',
                                                       year: 'numeric',
                                                       hour: '2-digit',
                                                       minute: '2-digit'
                                                  })} by {item.employee_name}
                                             </small>
                                             <p className="mb-0 small">
                                                  Report {item.test_name} ({item.test_shorttext}) (ID: {item.test_id}) of bill Id = {item.ascensionid} has been {item.action === 'view' ? 'previewed' : 'printed'} by {item.employee_name} ({item.employee_role}) on {new Date(item.actionon).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })} at {new Date(item.actionon).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}.
                                             </p>
                                        </div>
                                   </div>
                              );
                         })}
                    </div>
               ) : (
                    <div className="text-center py-5 text-muted">
                         <p className="mb-0">No printing tracking records found.</p>
                    </div>
               )}
          </div>
     );
}
