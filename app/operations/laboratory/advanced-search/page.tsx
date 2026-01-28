'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from 'react-bootstrap';
import { customFetch } from '../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import Loader from '../../../../components/isLoading';
import { toast } from 'react-toastify';
import { RiSearchLine, RiFilterLine, RiRefreshLine, RiDownloadLine, RiCloseLine, RiEye2Line } from '@remixicon/react';
import dayjs from 'dayjs';

interface Service {
     ascensionId: number;
     testId: number;
     testName: string;
     category: number;
     department: string;
     ascensionDate: string;
     collectionStartDate: string;
     collectionEndDate: string;
     processingStartDate: string;
     processingEndDate: string;
     resultEntryStartDate: string;
     resultEntryEndDate: string;
     stage: string;
}

interface SearchResult {
     billingId: number;
     billedOn: string;
     patient: {
          patientId: number;
          name: string;
          phone: string;
          email: string;
     };
     summary: {
          totalTests: number;
     };
     services: Service[];
}

export default function AdvancedSearchPage() {
     const router = useRouter();
     const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
     const [loading, setLoading] = useState(false);
     const [showFilters, setShowFilters] = useState(false);
     const [showTestsModal, setShowTestsModal] = useState(false);
     const [selectedServices, setSelectedServices] = useState<Service[]>([]);
     const [selectedPatient, setSelectedPatient] = useState<SearchResult['patient'] | null>(null);
     const [selectedBilledOn, setSelectedBilledOn] = useState<string>('');

     // Search filters
     const [accessionId, setAccessionId] = useState('');
     const [patientId, setPatientId] = useState('');
     const [billingId, setBillingId] = useState('');
     const [startDate, setStartDate] = useState('');
     const [endDate, setEndDate] = useState('');
     const [currentPage, setCurrentPage] = useState(1);
     const [pageSize, setPageSize] = useState(10);
     const [totalRecords, setTotalRecords] = useState(0);

     const { applicationsettings } = useApplicationSettings();
     const { user, branchid } = applicationsettings;
     const { employeeid } = user;

     // Perform search
     const handleSearch = async () => {
          if (!accessionId.trim() && !patientId.trim() && !billingId.trim() && !startDate && !endDate) {
               toast.warning('Please enter at least one search criteria');
               return;
          }

          try {
               setLoading(true);
               setCurrentPage(1);

               const params = new URLSearchParams({
                    employeeid,
                    branchid,
                    page: '1',
                    count: pageSize.toString(),
               });

               if (accessionId.trim()) {
                    params.append('accessionId', accessionId);
               }
               if (patientId.trim()) {
                    params.append('patientId', patientId);
               }
               if (billingId.trim()) {
                    params.append('billingId', billingId);
               }
               if (startDate) {
                    params.append('start_date', startDate);
               }
               if (endDate) {
                    params.append('end_date', endDate);
               }

               const response = await customFetch(`operations/laboratory/search?${params.toString()}`);

               if (response?.statusCode === 200 && response?.data?.results) {
                    setSearchResults(response.data.results);
                    setTotalRecords(response.data.pagination?.total || response.data.results.length);
               } else {
                    setSearchResults([]);
                    toast.info('No results found');
               }
          } catch (error) {
               console.error('Search error:', error);
               toast.error('Failed to perform search');
               setSearchResults([]);
          } finally {
               setLoading(false);
          }
     };

     // Reset filters
     const handleReset = () => {
          setAccessionId('');
          setPatientId('');
          setBillingId('');
          setStartDate('');
          setEndDate('');
          setCurrentPage(1);
          setSearchResults([]);
     };

     // Handle pagination
     const handlePageChange = async (newPage: number) => {
          try {
               setLoading(true);

               const params = new URLSearchParams({
                    employeeid,
                    branchid,
                    page: newPage.toString(),
                    count: pageSize.toString(),
               });

               if (accessionId.trim()) {
                    params.append('accessionId', accessionId);
               }
               if (patientId.trim()) {
                    params.append('patientId', patientId);
               }
               if (billingId.trim()) {
                    params.append('billingId', billingId);
               }
               if (startDate) {
                    params.append('start_date', startDate);
               }
               if (endDate) {
                    params.append('end_date', endDate);
               }

               const response = await customFetch(`operations/laboratory/search?${params.toString()}`);

               if (response?.statusCode === 200 && response?.data?.results) {
                    setSearchResults(response.data.results);
                    setCurrentPage(newPage);
               }
          } catch (error) {
               console.error('Pagination error:', error);
               toast.error('Failed to load page');
          } finally {
               setLoading(false);
          }
     };

     const handleNavigateToTest = (service: Service) => {
          const stageMap: Record<string, string> = {
               "billing done": '/operations/phelobotomy/pending-samples-collection',
               'processing': '/operations/laboratory/processing',
               'validation': '/operations/laboratory/validation',
               'validated': '/operations/laboratory/validated',
               'result entry concluded': '/operations/laboratory/validation',
               'collection of sample Initiated': '/operations/phelobotomy/pending-samples-collection',
               'collection of sample concluded': '/operations/laboratory/sample/validation',
               'sample validation in progress': '/operations/laboratory/sample-validation'
          };

          const targetPath = stageMap[service.stage] || '/operations/laboratory/processing';

          // Use billed date for all stages
          let queryParams = new URLSearchParams();

          if (selectedBilledOn) {
               queryParams.append('start_date', selectedBilledOn);
               queryParams.append('end_date', selectedBilledOn);
          }

          const fullPath = queryParams.toString() ? `${targetPath}?${queryParams.toString()}` : targetPath;
          window.open(fullPath, '_blank');
          setShowTestsModal(false);
     };

     const totalPages = Math.ceil(totalRecords / pageSize);

     return (
          <div className="container-fluid ">
               {/* Header */}
               <div className="mb-4">
                    <h5 className=" mb-0 fw-bold text-underline">Search and filter patient samples and test results</h5>
               </div>

               {/* Search Bar */}
               <div className="card border-0 mb-4">
                    <div className="card-body p-4">
                         {/* Single Row - All Filters */}
                         <div className="row g-2 align-items-end">
                              <div className="col-lg-2 col-md-6">
                                   <label className="form-label fw-medium small text-uppercase text-muted">Accession ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Accession ID..."
                                        value={accessionId}
                                        onChange={(e) => setAccessionId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                   />
                              </div>
                              <div className="col-lg-2 col-md-6">
                                   <label className="form-label fw-medium small text-uppercase text-muted">Patient ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Patient ID..."
                                        value={patientId}
                                        onChange={(e) => setPatientId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                   />
                              </div>
                              <div className="col-lg-2 col-md-6">
                                   <label className="form-label fw-medium small text-uppercase text-muted">Billing ID</label>
                                   <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Billing ID..."
                                        value={billingId}
                                        onChange={(e) => setBillingId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                   />
                              </div>
                              <div className="col-lg-2 col-md-6">
                                   <label className="form-label fw-medium small text-uppercase text-muted">Start Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                   />
                              </div>
                              <div className="col-lg-2 col-md-6">
                                   <label className="form-label fw-medium small text-uppercase text-muted">End Date</label>
                                   <input
                                        type="date"
                                        className="form-control"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                   />
                              </div>
                              <div className="col-lg-2 col-md-12 d-flex gap-2">
                                   <button
                                        className="btn btn-primary btn-sm d-flex align-items-center flex-grow-1"
                                        onClick={handleSearch}
                                        disabled={loading}
                                   >
                                        {loading ? (
                                             <>
                                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                  Searching...
                                             </>
                                        ) : (
                                             <>
                                                  <RiSearchLine size={16} className="me-1" />
                                                  Search
                                             </>
                                        )}
                                   </button>
                                   <button
                                        className="btn btn-outline-secondary btn-sm d-flex align-items-center"
                                        onClick={handleReset}
                                        disabled={loading}
                                   >
                                        <RiRefreshLine size={16} className="me-1" />
                                        Reset
                                   </button>
                              </div>
                         </div>
                    </div>
               </div>

               {/* Results Section */}
               {Array.isArray(searchResults) && searchResults.length > 0 ? (
                    <div className='border rounded p-3'>
                         <h3 className="mb-4 fw-bold">
                              Search Results ({totalRecords})
                         </h3>
                         <div className=''>
                              <table className="table table-striped table-hover mb-0 text-start">
                                   <thead>
                                        <tr>
                                             <th className="fw-bold">Billing ID</th>
                                             <th className="fw-bold">Patient ID</th>
                                             <th className="fw-bold">Patient Name</th>
                                             <th className="fw-bold">Phone</th>
                                             <th className="fw-bold text-center">Tests</th>
                                             <th className="fw-bold">Billed Date</th>
                                             <th className="fw-bold text-center">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {searchResults.map((result, index) => (
                                             <tr key={index}>
                                                  <td className="fw-bold">{result.billingId}</td>
                                                  <td>{result.patient.patientId}</td>
                                                  <td className="fw-semibold text-uppercase">{result.patient.name}</td>
                                                  <td>{result.patient.phone}</td>
                                                  <td className="text-center fw-semibold">{result.summary.totalTests}</td>
                                                  <td>
                                                       {dayjs(result.billedOn).format('DD-MM-YYYY HH:mm:ss')}
                                                  </td>
                                                  <td className="text-center">
                                                       <button
                                                            onClick={() => {
                                                                 setSelectedServices(result.services);
                                                                 setSelectedPatient(result.patient);
                                                                 setSelectedBilledOn(result.billedOn);
                                                                 setShowTestsModal(true);
                                                            }}
                                                            className="btn btn-info btn-sm d-inline-flex align-items-center gap-1"
                                                       >
                                                            <RiEye2Line size={14} /> View Tests
                                                       </button>
                                                  </td>
                                             </tr>
                                        ))}
                                   </tbody>
                              </table>
                         </div>

                         {/* Tests Modal */}
                         <Modal show={showTestsModal} onHide={() => setShowTestsModal(false)} size="lg" backdrop="static" keyboard={false}>
                              <Modal.Header closeButton>
                                   <Modal.Title className="fw-bold">
                                        Tests for {selectedPatient?.name}
                                   </Modal.Title>
                              </Modal.Header>
                              <Modal.Body>
                                   {selectedServices && selectedServices.length > 0 ? (
                                        <div className="border rounded p-2 ">
                                             <table className="table table-hover table-striped mb-0">
                                                  <thead>
                                                       <tr>
                                                            <th className="fw-bold">Test Name</th>
                                                            <th className="fw-bold">Department</th>
                                                            <th className="fw-bold">Ascension ID</th>
                                                            <th className="fw-bold text-center">Stage</th>
                                                       </tr>
                                                  </thead>
                                                  <tbody>
                                                       {Array.isArray(selectedServices) && selectedServices.map((service: Service, idx: number) => (
                                                            <tr
                                                                 key={idx}
                                                                 style={{ cursor: 'pointer' }}
                                                            >
                                                                 <td className="fw-semibold">{service.testName}</td>
                                                                 <td>{service.department}</td>
                                                                 <td>{service.ascensionId}</td>
                                                                 <td className="text-center">
                                                                      <button
                                                                           onClick={() => handleNavigateToTest(service)}
                                                                           className="btn btn-sm btn-outline-primary"
                                                                      >
                                                                           {service.stage}
                                                                      </button>
                                                                 </td>
                                                            </tr>
                                                       ))}
                                                  </tbody>
                                             </table>
                                        </div>
                                   ) : (
                                        <div className="alert alert-info mb-0">No tests found for this patient.</div>
                                   )}
                              </Modal.Body>
                              <Modal.Footer>
                                   <button className="btn btn-secondary" onClick={() => setShowTestsModal(false)}>
                                        Close
                                   </button>
                              </Modal.Footer>
                         </Modal>

                         {/* Pagination */}
                         {totalPages > 1 && (
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                   <small className="text-muted">
                                        Showing page {currentPage} of {totalPages} ({totalRecords} total records)
                                   </small>
                                   <nav aria-label="Page navigation">
                                        <ul className="pagination pagination-sm mb-0">
                                             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(1)}
                                                       disabled={currentPage === 1 || loading}
                                                  >
                                                       First
                                                  </button>
                                             </li>
                                             <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(currentPage - 1)}
                                                       disabled={currentPage === 1 || loading}
                                                  >
                                                       Previous
                                                  </button>
                                             </li>
                                             {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                                  const pageNum = i + 1;
                                                  return (
                                                       <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                            <button
                                                                 className="page-link"
                                                                 onClick={() => handlePageChange(pageNum)}
                                                                 disabled={loading}
                                                            >
                                                                 {pageNum}
                                                            </button>
                                                       </li>
                                                  );
                                             })}
                                             <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(currentPage + 1)}
                                                       disabled={currentPage === totalPages || loading}
                                                  >
                                                       Next
                                                  </button>
                                             </li>
                                             <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                  <button
                                                       className="page-link"
                                                       onClick={() => handlePageChange(totalPages)}
                                                       disabled={currentPage === totalPages || loading}
                                                  >
                                                       Last
                                                  </button>
                                             </li>
                                        </ul>
                                   </nav>
                              </div>
                         )}
                    </div>
               ) : (
                    !loading && searchResults.length === 0 && (accessionId || patientId || billingId || startDate || endDate) && (
                         <div className="alert alert-info d-flex align-items-center">
                              <RiSearchLine size={20} className="me-2" />
                              <div>
                                   <strong>No results found.</strong> Try adjusting your search criteria.
                              </div>
                         </div>
                    )
               )}

               {/* Empty State */}
               {!loading && searchResults.length === 0 && !accessionId && !patientId && !billingId && !startDate && !endDate && (
                    <div className="text-center py-5">
                         <RiSearchLine size={48} className="mb-3 text-muted" />
                         <h5 className="fw-medium mb-2">Start Searching</h5>
                         <p className="text-muted">Enter an Accession ID, Patient ID, Billing ID, or date range to begin your search.</p>
                    </div>
               )}
          </div>
     );
}
