'use client';

import React, { useState, useEffect } from 'react';
import { Button, Row, Col, Card, Tab, Tabs, Badge } from 'react-bootstrap';

import {
     RiSearchLine,
     RiFilterLine,
     RiBarcodeLine,
     RiTimeLine,
     RiUserLine,
     RiMapPinLine,
     RiRefreshLine,
     RiDownloadLine
} from '@remixicon/react';
import type { Sample, SampleStatistics, SampleSearchFilters } from './types';
import { DUMMY_SAMPLES, DUMMY_STATISTICS } from './types';
import ISLOADING from '../../components/isLoading';
import AliquotingManagement from './components/AliquotingManagement';
import ChainOfCustody from './components/ChainOfCustody';
import QualityControl from './components/QualityControl';
import SampleCollection from './components/SampleCollection';
import StorageManagement from './components/StorageManagement';
import { customFetch } from '../../components/Auth/customFetch';


export default function SampleLifecycleManagement() {
     const [samples, setSamples] = useState<Sample[]>([]);
     const [filteredSamples, setFilteredSamples] = useState<Sample[]>([]);
     const [loading, setLoading] = useState(true);
     const [statistics, setStatistics] = useState<SampleStatistics | null>(null);
     const [activeTab, setActiveTab] = useState('overview');
     const [searchFilters, setSearchFilters] = useState<SampleSearchFilters>({});

     useEffect(() => {
          fetchSamples();
          fetchStatistics();
     }, []);

     useEffect(() => {
          applyFilters();
     }, [samples, searchFilters]);

     const fetchSamples = async () => {
          try {
               setLoading(true);
               // Use dummy data instead of API call
               setSamples(DUMMY_SAMPLES);
               setLoading(false);
          } catch (error) {
               console.error('Error fetching samples:', error);
               setSamples([]);
               setLoading(false);
          }
     };

     const fetchStatistics = async () => {
          try {
               // Use dummy statistics instead of API call
               setStatistics(DUMMY_STATISTICS);
          } catch (error) {
               console.error('Error fetching statistics:', error);
          }
     };

     const applyFilters = () => {
          let filtered = [...samples];

          if (searchFilters.barcode) {
               filtered = filtered.filter(s =>
                    s.barcode.toLowerCase().includes(searchFilters.barcode!.toLowerCase())
               );
          }

          if (searchFilters.patientId) {
               filtered = filtered.filter(s =>
                    s.patientId.toLowerCase().includes(searchFilters.patientId!.toLowerCase())
               );
          }

          if (searchFilters.patientName) {
               filtered = filtered.filter(s =>
                    s.patientName.toLowerCase().includes(searchFilters.patientName!.toLowerCase())
               );
          }

          if (searchFilters.testType) {
               filtered = filtered.filter(s =>
                    s.testType.toLowerCase().includes(searchFilters.testType!.toLowerCase())
               );
          }

          if (searchFilters.sampleType) {
               filtered = filtered.filter(s =>
                    s.sampleType.toLowerCase().includes(searchFilters.sampleType!.toLowerCase())
               );
          }

          if (searchFilters.status && searchFilters.status.length > 0) {
               filtered = filtered.filter(s => searchFilters.status!.includes(s.status));
          }

          if (searchFilters.priority && searchFilters.priority.length > 0) {
               filtered = filtered.filter(s => searchFilters.priority!.includes(s.priority));
          }

          if (searchFilters.collectionDateFrom) {
               filtered = filtered.filter(s => s.collectionDate >= searchFilters.collectionDateFrom!);
          }

          if (searchFilters.collectionDateTo) {
               filtered = filtered.filter(s => s.collectionDate <= searchFilters.collectionDateTo!);
          }

          setFilteredSamples(filtered);
     };

     const handleFilterChange = (field: keyof SampleSearchFilters, value: any) => {
          setSearchFilters(prev => ({ ...prev, [field]: value }));
     };

     const clearFilters = () => {
          setSearchFilters({});
     };

     const getStatusBadge = (status: string) => {
          const colors: Record<string, string> = {
               collected: 'secondary',
               received: 'info',
               processing: 'warning',
               processed: 'success',
               rejected: 'danger',
               recalled: 'danger',
               disposed: 'dark',
               archived: 'secondary'
          };
          return <Badge bg={colors[status] || 'secondary'}>{status.replace('_', ' ').toUpperCase()}</Badge>;
     };

     const getPriorityBadge = (priority: string) => {
          const colors: Record<string, string> = {
               routine: 'secondary',
               urgent: 'warning',
               stat: 'danger',
               critical: 'danger'
          };
          return <Badge bg={colors[priority] || 'secondary'}>{priority.toUpperCase()}</Badge>;
     };

     const formatDateTime = (date: string, time?: string) => {
          const dateObj = new Date(date);
          if (time) {
               return `${dateObj.toLocaleDateString()} ${time}`;
          }
          return dateObj.toLocaleDateString();
     };

     if (loading) return <ISLOADING />;

     return (
          <div className="container-fluid p-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">Sample Lifecycle Management</h2>
                         <p className="text-muted mb-0">Comprehensive sample tracking from collection to disposal</p>
                    </div>
                    <div className="d-flex gap-2">
                         <Button variant="outline-primary" onClick={fetchSamples}>
                              <RiRefreshLine size={16} className="me-2" />
                              Refresh
                         </Button>
                    </div>
               </div>

               {/* Statistics Cards */}
               {statistics && (
                    <Row className="g-3 mb-4">
                         <Col md={3}>
                              <Card className="text-center">
                                   <Card.Body>
                                        <h3 className="text-primary">{statistics.totalSamples}</h3>
                                        <p className="text-muted mb-0">Total Samples</p>
                                   </Card.Body>
                              </Card>
                         </Col>
                         <Col md={3}>
                              <Card className="text-center">
                                   <Card.Body>
                                        <h3 className="text-success">{statistics.samplesByStatus.processed || 0}</h3>
                                        <p className="text-muted mb-0">Processed</p>
                                   </Card.Body>
                              </Card>
                         </Col>
                         <Col md={3}>
                              <Card className="text-center">
                                   <Card.Body>
                                        <h3 className="text-warning">{statistics.samplesByStatus.processing || 0}</h3>
                                        <p className="text-muted mb-0">In Process</p>
                                   </Card.Body>
                              </Card>
                         </Col>
                         <Col md={3}>
                              <Card className="text-center">
                                   <Card.Body>
                                        <h3 className="text-danger">{statistics.samplesByStatus.rejected || 0}</h3>
                                        <p className="text-muted mb-0">Rejected</p>
                                   </Card.Body>
                              </Card>
                         </Col>
                    </Row>
               )}

               <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')} className="mb-4">
                    <Tab eventKey="overview" title="Sample Overview">
                         <Card>
                              <Card.Body>
                                   {/* Search and Filters */}
                                   <Row className="g-3 mb-4">
                                        <Col md={4}>
                                             <div className="input-group">
                                                  <span className="input-group-text"><RiSearchLine /></span>
                                                  <input
                                                       type="text"
                                                       className="form-control"
                                                       placeholder="Search by barcode, patient ID, or name..."
                                                       value={searchFilters.barcode || ''}
                                                       onChange={(e) => handleFilterChange('barcode', e.target.value)}
                                                  />
                                             </div>
                                        </Col>
                                        <Col md={2}>
                                             <select
                                                  className="form-select"
                                                  value={searchFilters.status?.[0] || ''}
                                                  onChange={(e) => handleFilterChange('status', e.target.value ? [e.target.value as any] : [])}
                                             >
                                                  <option value="">All Statuses</option>
                                                  <option value="collected">Collected</option>
                                                  <option value="received">Received</option>
                                                  <option value="processing">Processing</option>
                                                  <option value="processed">Processed</option>
                                                  <option value="rejected">Rejected</option>
                                                  <option value="recalled">Recalled</option>
                                                  <option value="disposed">Disposed</option>
                                             </select>
                                        </Col>
                                        <Col md={2}>
                                             <select
                                                  className="form-select"
                                                  value={searchFilters.priority?.[0] || ''}
                                                  onChange={(e) => handleFilterChange('priority', e.target.value ? [e.target.value as any] : [])}
                                             >
                                                  <option value="">All Priorities</option>
                                                  <option value="routine">Routine</option>
                                                  <option value="urgent">Urgent</option>
                                                  <option value="stat">STAT</option>
                                                  <option value="critical">Critical</option>
                                             </select>
                                        </Col>
                                        <Col md={2}>
                                             <Button variant="outline-secondary" onClick={clearFilters}>
                                                  <RiFilterLine size={16} className="me-2" />
                                                  Clear Filters
                                             </Button>
                                        </Col>
                                        <Col md={2}>
                                             <Button variant="outline-info">
                                                  <RiDownloadLine size={16} className="me-2" />
                                                  Export
                                             </Button>
                                        </Col>
                                   </Row>

                                   {/* Samples Table */}
                                   <div className="table-responsive">
                                        <table className="table table-striped table-hover">
                                             <thead>
                                                  <tr>
                                                       <th>Barcode</th>
                                                       <th>Patient</th>
                                                       <th>Test Type</th>
                                                       <th>Sample Type</th>
                                                       <th>Status</th>
                                                       <th>Priority</th>
                                                       <th>Collection Date</th>
                                                       <th>Storage Location</th>
                                                       <th>Actions</th>
                                                  </tr>
                                             </thead>
                                             <tbody>
                                                  {filteredSamples.map((sample) => (
                                                       <tr key={sample.id}>
                                                            <td>
                                                                 <div className="d-flex align-items-center">
                                                                      <RiBarcodeLine size={16} className="me-2" />
                                                                      {sample.barcode}
                                                                 </div>
                                                            </td>
                                                            <td>
                                                                 <div>
                                                                      <div className="fw-semibold">{sample.patientName}</div>
                                                                      <small className="text-muted">ID: {sample.patientId}</small>
                                                                 </div>
                                                            </td>
                                                            <td>{sample.testName}</td>
                                                            <td>{sample.sampleType}</td>
                                                            <td>{getStatusBadge(sample.status)}</td>
                                                            <td>{getPriorityBadge(sample.priority)}</td>
                                                            <td>{formatDateTime(sample.collectionDate, sample.collectionTime)}</td>
                                                            <td>
                                                                 {sample.storageLocation ? (
                                                                      <div className="d-flex align-items-center">
                                                                           <RiMapPinLine size={14} className="me-1" />
                                                                           {sample.storageLocation.unitName}
                                                                      </div>
                                                                 ) : (
                                                                      <span className="text-muted">Not stored</span>
                                                                 )}
                                                            </td>
                                                            <td>
                                                                 <div className="d-flex gap-1">
                                                                      <Button
                                                                           variant="outline-info"
                                                                           size="sm"
                                                                           onClick={() => setActiveTab('chain-of-custody')}
                                                                           title="View Chain of Custody"
                                                                      >
                                                                           <RiTimeLine size={14} />
                                                                      </Button>
                                                                      <Button
                                                                           variant="outline-primary"
                                                                           size="sm"
                                                                           onClick={() => setActiveTab('collection')}
                                                                           title="Go to Sample Collection"
                                                                      >
                                                                           <RiUserLine size={14} />
                                                                      </Button>
                                                                 </div>
                                                            </td>
                                                       </tr>
                                                  ))}
                                             </tbody>
                                        </table>
                                   </div>

                                   {filteredSamples.length === 0 && (
                                        <div className="text-center py-5">
                                             <RiBarcodeLine size={48} className="text-muted mb-3" />
                                             <h5 className="text-muted">No samples found</h5>
                                             <p className="text-muted">Try adjusting your search filters or add a new sample.</p>
                                        </div>
                                   )}
                              </Card.Body>
                         </Card>
                    </Tab>

                    <Tab eventKey="chain-of-custody" title="Chain of Custody">
                         <ChainOfCustody />
                    </Tab>

                    <Tab eventKey="storage" title="Storage Management">
                         <StorageManagement />
                    </Tab>

                    <Tab eventKey="aliquoting" title="Aliquoting">
                         <AliquotingManagement />
                    </Tab>

                    <Tab eventKey="quality" title="Quality Control">
                         <QualityControl />
                    </Tab>

                    <Tab eventKey="collection" title="Sample Collection">
                         <SampleCollection />
                    </Tab>
               </Tabs>
          </div>
     );
}
