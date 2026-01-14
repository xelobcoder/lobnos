'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';
import { RiArrowLeftLine, RiPrinterLine } from '@remixicon/react';

interface Test {
     testid: number;
     name: string;
     ascensionid: string;
     ascension_date: string;
     department: string;
     status: string;
     validators: Array<{ username: string; role: string }>;
}

interface PatientGroupData {
     patientid: number;
     fullpatientid: string;
     fullname: string;
     age: number;
     billingid: number;
     clientstatus: string;
     tests: Test[];
}

export default function GroupedPatientDetailsPage() {
     const searchParams = useSearchParams();
     const [patientData, setPatientData] = useState<PatientGroupData | null>(null);
     const [loading, setLoading] = useState(true);

     useEffect(() => {
          try {
               const data = searchParams?.get('data');
               if (data) {
                    const decoded = JSON.parse(decodeURIComponent(data));
                    setPatientData(decoded);
               }
          } catch (error) {
               console.error('Error parsing patient data:', error);
          } finally {
               setLoading(false);
          }
     }, [searchParams]);

     if (loading) {
          return (
               <div className="container-fluid p-4">
                    <div className="spinner-border" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </div>
               </div>
          );
     }

     if (!patientData) {
          return (
               <div className="container-fluid p-4">
                    <div className="alert alert-danger">
                         No patient data available
                    </div>
                    <button className="btn btn-secondary" onClick={() => window.history.back()}>
                         <RiArrowLeftLine className="me-2" />
                         Go Back
                    </button>
               </div>
          );
     }

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="mb-4">
                    <button
                         className="btn btn-outline-secondary mb-3"
                         onClick={() => window.history.back()}
                    >
                         <RiArrowLeftLine className="me-2" />
                         Back
                    </button>

                    <div className="card border-0 shadow-sm">
                         <div className="card-body p-4">
                              <h2 className="mb-3">
                                   <span className="text-uppercase">{patientData.fullname}</span>
                              </h2>

                              <div className="row g-3">
                                   <div className="col-md-3">
                                        <div className="d-flex flex-column">
                                             <span className="small text-muted text-uppercase fw-bold">Patient ID</span>
                                             <span className="h6 mb-0">{patientData.fullpatientid || patientData.patientid}</span>
                                        </div>
                                   </div>
                                   <div className="col-md-3">
                                        <div className="d-flex flex-column">
                                             <span className="small text-muted text-uppercase fw-bold">Billing ID</span>
                                             <span className="h6 mb-0">{patientData.billingid}</span>
                                        </div>
                                   </div>
                                   <div className="col-md-3">
                                        <div className="d-flex flex-column">
                                             <span className="small text-muted text-uppercase fw-bold">Age</span>
                                             <span className="h6 mb-0">{patientData.age}</span>
                                        </div>
                                   </div>
                                   <div className="col-md-3">
                                        <div className="d-flex flex-column">
                                             <span className="small text-muted text-uppercase fw-bold">Client Status</span>
                                             <span className="h6 mb-0">
                                                  <span className={`badge ${patientData.clientstatus === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                                                       {patientData.clientstatus}
                                                  </span>
                                             </span>
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Tests Section */}
               <div className="card border-0 shadow-sm">
                    <div className="card-header bg-light py-3 px-4">
                         <h5 className="mb-0 fw-bold">
                              Tests ({patientData.tests.length})
                         </h5>
                    </div>
                    <div className="card-body p-0">
                         <div className="table-responsive">
                              <table className="table table-hover table-striped mb-0 text-start">
                                   <thead className="table-light">
                                        <tr>
                                             <th className="fw-bold py-3 px-4 small">Ascension ID</th>
                                             <th className="fw-bold py-3 px-4 small">Ascension Date</th>
                                             <th className="fw-bold py-3 px-4 small">Test Name</th>
                                             <th className="fw-bold py-3 px-4 small">Department</th>
                                             <th className="fw-bold py-3 px-4 small">Status</th>
                                             <th className="fw-bold py-3 px-4 small">Validators</th>
                                             <th className="fw-bold py-3 px-4 small">Action</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {patientData.tests.map((test, index) => (
                                             <tr key={index}>
                                                  <td className="py-3 px-4 small fw-bold">{test.ascensionid}</td>
                                                  <td className="py-3 px-4 small">
                                                       {dayjs(test.ascension_date).format('DD-MM-YYYY HH:mm:ss')}
                                                  </td>
                                                  <td className="py-3 px-4 small">{test.name}</td>
                                                  <td className="py-3 px-4 small">{test.department}</td>
                                                  <td className="py-3 px-4 small">
                                                       <span className={`badge ${test.status === 'completed' ? 'bg-success' :
                                                                 test.status === 'validated' ? 'bg-info' :
                                                                      test.status === 'processing' ? 'bg-warning' :
                                                                           'bg-secondary'
                                                            }`}>
                                                            {test.status}
                                                       </span>
                                                  </td>
                                                  <td className="py-3 px-4 small">
                                                       <div className="list-group list-group-sm">
                                                            {test.validators && test.validators.map((validator, idx) => (
                                                                 <span key={idx} className="list-group-item list-group-item-sm py-1 px-2 text-sm">
                                                                      {validator.username}
                                                                 </span>
                                                            ))}
                                                       </div>
                                                  </td>
                                                  <td className="py-3 px-4 small">
                                                       <button
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={() => {
                                                                 // Handle print or view result action
                                                                 console.log('View result for test:', test.testid);
                                                            }}
                                                       >
                                                            <RiPrinterLine size={16} className="me-1" />
                                                            View
                                                       </button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>
                    </div>
               </div>
          </div>
     );
}
