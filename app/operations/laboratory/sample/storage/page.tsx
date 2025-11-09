'use client';

import React, { useState, useEffect } from 'react';
import { RiArchiveLine, RiSearchLine, RiFilterLine, RiAddLine, RiEditLine, RiDeleteBinLine, RiEyeLine, RiDownloadLine, RiUploadLine, RiAlertLine, RiCheckLine, RiCloseLine, RiTimeLine, RiThermometerLine, RiDropLine } from '@remixicon/react';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';

interface SampleStorage {
     id: string;
     sampleId: string;
     patientName: string;
     testName: string;
     storageLocation: string;
     storageType: string; // Changed from union type to string for flexibility
     temperature: number;
     humidity?: number;
     storageDate: string;
     expiryDate: string;
     status: 'stored' | 'retrieved' | 'discarded' | 'expired';
     condition: 'good' | 'compromised' | 'critical';
     notes?: string;
}

interface StorageLocation {
     id: string;
     name: string;
     type: string; // Changed from union type to string for flexibility
     capacity: number;
     currentUsage: number;
     temperature: number;
     lastChecked: string;
     status: 'active' | 'maintenance' | 'offline';
}

interface StorageType {
     id: string;
     label: string;
     icon: string;
     color: string;
     defaultTemp: number;
     minTemp?: number;
     maxTemp?: number;
}

const STORAGE_TYPES: Record<string, StorageType> = {
     refrigerator: { id: 'refrigerator', label: 'Refrigerator (2-8°C)', icon: '🧊', color: 'info', defaultTemp: 4, minTemp: 2, maxTemp: 8 },
     freezer: { id: 'freezer', label: 'Freezer (-20°C)', icon: '❄️', color: 'primary', defaultTemp: -20 },
     ultra_low: { id: 'ultra_low', label: 'Ultra-Low Freezer (-80°C)', icon: '🥶', color: 'warning', defaultTemp: -80 },
     room_temp: { id: 'room_temp', label: 'Room Temperature', icon: '🌡️', color: 'success', defaultTemp: 22, minTemp: 15, maxTemp: 30 },
     incubator: { id: 'incubator', label: 'Incubator (37°C)', icon: '🌡️', color: 'danger', defaultTemp: 37, minTemp: 35, maxTemp: 39 },
     cryo_tank: { id: 'cryo_tank', label: 'Cryogenic Tank (-196°C)', icon: '🥶', color: 'secondary', defaultTemp: -196 }
};

const STATUS_BADGES = {
     stored: { label: 'Stored', color: 'success' },
     retrieved: { label: 'Retrieved', color: 'info' },
     discarded: { label: 'Discarded', color: 'danger' },
     expired: { label: 'Expired', color: 'warning' }
};

const CONDITION_BADGES = {
     good: { label: 'Good', color: 'success' },
     compromised: { label: 'Compromised', color: 'warning' },
     critical: { label: 'Critical', color: 'danger' }
};

export default function SampleStoragePage() {
     const [activeTab, setActiveTab] = useState<'overview' | 'samples' | 'locations' | 'monitoring' | 'storage-types'>('overview');
     const [samples, setSamples] = useState<SampleStorage[]>([]);
     const [locations, setLocations] = useState<StorageLocation[]>([]);
     const [showAddModal, setShowAddModal] = useState(false);
     const [showLocationModal, setShowLocationModal] = useState(false);
     const [showStorageTypeModal, setShowStorageTypeModal] = useState(false);
     const [selectedSample, setSelectedSample] = useState<SampleStorage | null>(null);
     const [loading, setLoading] = useState(false);
     const [customStorageTypes, setCustomStorageTypes] = useState<Record<string, StorageType>>({});

     // Form states
     const [sampleForm, setSampleForm] = useState({
          sampleId: '',
          patientName: '',
          testName: '',
          storageLocation: '',
          storageType: 'refrigerator',
          temperature: 4,
          storageDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          notes: ''
     });

     const [locationForm, setLocationForm] = useState({
          name: '',
          type: 'refrigerator',
          capacity: 100,
          temperature: 4,
          status: 'active' as StorageLocation['status']
     });

     const [storageTypeForm, setStorageTypeForm] = useState({
          id: '',
          label: '',
          icon: '📦',
          color: 'primary',
          defaultTemp: 22,
          minTemp: '',
          maxTemp: ''
     });

     // Mock data for demonstration
     useEffect(() => {
          const mockSamples: SampleStorage[] = [
               {
                    id: '1',
                    sampleId: 'SAMP001',
                    patientName: 'John Doe',
                    testName: 'Complete Blood Count',
                    storageLocation: 'REF-01',
                    storageType: 'refrigerator',
                    temperature: 4,
                    storageDate: '2025-11-01',
                    expiryDate: '2025-11-15',
                    status: 'stored',
                    condition: 'good',
                    notes: 'Blood sample for CBC analysis'
               },
               {
                    id: '2',
                    sampleId: 'SAMP002',
                    patientName: 'Jane Smith',
                    testName: 'Lipid Profile',
                    storageLocation: 'FRZ-01',
                    storageType: 'freezer',
                    temperature: -20,
                    storageDate: '2025-11-02',
                    expiryDate: '2025-11-30',
                    status: 'stored',
                    condition: 'good'
               },
               {
                    id: '3',
                    sampleId: 'SAMP003',
                    patientName: 'Bob Johnson',
                    testName: 'Urine Analysis',
                    storageLocation: 'RT-01',
                    storageType: 'room_temp',
                    temperature: 22,
                    storageDate: '2025-10-15',
                    expiryDate: '2025-11-10',
                    status: 'expired',
                    condition: 'critical'
               }
          ];

          const mockLocations: StorageLocation[] = [
               {
                    id: 'REF-01',
                    name: 'Refrigerator Unit A',
                    type: 'refrigerator',
                    capacity: 100,
                    currentUsage: 45,
                    temperature: 4,
                    lastChecked: '2025-11-09T10:00:00Z',
                    status: 'active'
               },
               {
                    id: 'FRZ-01',
                    name: 'Freezer Unit B',
                    type: 'freezer',
                    capacity: 200,
                    currentUsage: 120,
                    temperature: -20,
                    lastChecked: '2025-11-09T09:30:00Z',
                    status: 'active'
               },
               {
                    id: 'RT-01',
                    name: 'Room Temperature Cabinet',
                    type: 'room_temp',
                    capacity: 50,
                    currentUsage: 15,
                    temperature: 22,
                    lastChecked: '2025-11-09T08:00:00Z',
                    status: 'active'
               },
               {
                    id: 'INC-01',
                    name: 'CO2 Incubator',
                    type: 'incubator',
                    capacity: 80,
                    currentUsage: 25,
                    temperature: 37,
                    lastChecked: '2025-11-09T11:00:00Z',
                    status: 'active'
               }
          ];

          setSamples(mockSamples);
          setLocations(mockLocations);
     }, []);

     const getStorageStats = () => {
          const total = samples.length;
          const stored = samples.filter(s => s.status === 'stored').length;
          const expired = samples.filter(s => s.status === 'expired').length;
          const critical = samples.filter(s => s.condition === 'critical').length;

          return { total, stored, expired, critical };
     };

     const stats = getStorageStats();

     const handleRetrieveSample = (sampleId: string) => {
          setSamples(prev => prev.map(sample =>
               sample.id === sampleId
                    ? { ...sample, status: 'retrieved' as const }
                    : sample
          ));
     };

     const handleDiscardSample = (sampleId: string) => {
          setSamples(prev => prev.map(sample =>
               sample.id === sampleId
                    ? { ...sample, status: 'discarded' as const }
                    : sample
          ));
     };

     const handleEditLocation = (locationId: string) => {
          const location = locations.find(loc => loc.id === locationId);
          if (location) {
               setLocationForm({
                    name: location.name,
                    type: location.type,
                    capacity: location.capacity,
                    temperature: location.temperature,
                    status: location.status
               });
               setShowLocationModal(true);
               // Note: In a real app, you'd want to track editing state
          }
     };

     const handleMonitorLocation = (locationId: string) => {
          // For now, just show an alert. In a real app, this would open a monitoring dashboard
          alert(`Monitoring location: ${locationId}`);
     };

     const handleAddSample = () => {
          if (!sampleForm.sampleId || !sampleForm.patientName || !sampleForm.testName || !sampleForm.storageLocation) {
               alert('Please fill in all required fields');
               return;
          }

          const newSample: SampleStorage = {
               id: Date.now().toString(),
               sampleId: sampleForm.sampleId,
               patientName: sampleForm.patientName,
               testName: sampleForm.testName,
               storageLocation: sampleForm.storageLocation,
               storageType: sampleForm.storageType,
               temperature: sampleForm.temperature,
               storageDate: sampleForm.storageDate,
               expiryDate: sampleForm.expiryDate,
               status: 'stored',
               condition: 'good',
               notes: sampleForm.notes
          };

          setSamples(prev => [...prev, newSample]);
          setShowAddModal(false);
          setSampleForm({
               sampleId: '',
               patientName: '',
               testName: '',
               storageLocation: '',
               storageType: 'refrigerator',
               temperature: 4,
               storageDate: new Date().toISOString().split('T')[0],
               expiryDate: '',
               notes: ''
          });
     };

     const handleCreateLocation = () => {
          if (!locationForm.name) {
               alert('Please enter a storage location name');
               return;
          }

          const newLocation: StorageLocation = {
               id: `LOC-${Date.now()}`,
               name: locationForm.name,
               type: locationForm.type,
               capacity: locationForm.capacity,
               currentUsage: 0,
               temperature: locationForm.temperature,
               lastChecked: new Date().toISOString(),
               status: locationForm.status
          };

          setLocations(prev => [...prev, newLocation]);
          setShowLocationModal(false);
          setLocationForm({
               name: '',
               type: 'refrigerator',
               capacity: 100,
               temperature: 4,
               status: 'active'
          });
     };

     const getAvailableLocations = () => {
          return locations.filter(loc => loc.currentUsage < loc.capacity);
     };

     const getAllStorageTypes = () => {
          return { ...STORAGE_TYPES, ...customStorageTypes };
     };

     const sampleColumns = [
          {
               Header: 'Sample ID',
               accessor: 'sampleId',
          },
          {
               Header: 'Patient',
               accessor: 'patientName',
          },
          {
               Header: 'Test',
               accessor: 'testName',
          },
          {
               Header: 'Storage Location',
               accessor: 'storageLocation',
          },
          {
               Header: 'Type',
               accessor: 'storageType',
               Cell: ({ value }) => {
                    const typeInfo = getAllStorageTypes()[value];
                    return (
                         <span className={`badge bg-${typeInfo?.color || 'secondary'}`}>
                              {typeInfo?.icon || '📦'} {typeInfo?.label || value}
                         </span>
                    );
               }
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }) => (
                    <span className={`badge bg-${STATUS_BADGES[value].color}`}>
                         {STATUS_BADGES[value].label}
                    </span>
               )
          },
          {
               Header: 'Condition',
               accessor: 'condition',
               Cell: ({ value }) => (
                    <span className={`badge bg-${CONDITION_BADGES[value].color}`}>
                         {CONDITION_BADGES[value].label}
                    </span>
               )
          },
          {
               Header: 'Expiry Date',
               accessor: 'expiryDate',
               Cell: ({ value }) => new Date(value).toLocaleDateString()
          },
          {
               Header: 'Actions',
               accessor: 'id',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <button
                              className="btn btn-sm btn-outline-info"
                              title="View Details"
                              onClick={() => setSelectedSample(row.original)}
                         >
                              <RiEyeLine size={14} />
                         </button>
                         {row.original.status === 'stored' && (
                              <>
                                   <button
                                        className="btn btn-sm btn-outline-success"
                                        title="Retrieve Sample"
                                        onClick={() => handleRetrieveSample(row.original.id)}
                                   >
                                        <RiCheckLine size={14} />
                                   </button>
                                   <button
                                        className="btn btn-sm btn-outline-danger"
                                        title="Discard Sample"
                                        onClick={() => handleDiscardSample(row.original.id)}
                                   >
                                        <RiDeleteBinLine size={14} />
                                   </button>
                              </>
                         )}
                    </div>
               )
          }
     ];

     const handleCreateStorageType = () => {
          if (!storageTypeForm.id || !storageTypeForm.label) {
               alert('Please fill in ID and Label fields');
               return;
          }

          if (STORAGE_TYPES[storageTypeForm.id] || customStorageTypes[storageTypeForm.id]) {
               alert('Storage type ID already exists');
               return;
          }

          const newType: StorageType = {
               id: storageTypeForm.id,
               label: storageTypeForm.label,
               icon: storageTypeForm.icon,
               color: storageTypeForm.color,
               defaultTemp: storageTypeForm.defaultTemp,
               minTemp: storageTypeForm.minTemp ? parseFloat(storageTypeForm.minTemp) : undefined,
               maxTemp: storageTypeForm.maxTemp ? parseFloat(storageTypeForm.maxTemp) : undefined
          };

          setCustomStorageTypes(prev => ({ ...prev, [storageTypeForm.id]: newType }));
          setShowStorageTypeModal(false);
          setStorageTypeForm({
               id: '',
               label: '',
               icon: '📦',
               color: 'primary',
               defaultTemp: 22,
               minTemp: '',
               maxTemp: ''
          });
     };

     return (
          <div className="container-fluid p-4">
               {/* Header */}
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h2 className="mb-1">
                              <RiArchiveLine className="me-2" />
                              Sample Storage Management
                         </h2>
                         <p className="text-muted mb-0">Manage sample storage, retrieval, and monitoring</p>
                    </div>
                    <div className="d-flex gap-2">
                         <button className="btn btn-outline-primary btn-sm">
                              <RiDownloadLine className="me-1" />
                              Export Data
                         </button>
                         <button className="btn btn-outline-secondary btn-sm">
                              <RiUploadLine className="me-1" />
                              Import Data
                         </button>
                         <button
                              className="btn btn-outline-info btn-sm"
                              onClick={() => setShowStorageTypeModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Storage Type
                         </button>
                         <button
                              className="btn btn-outline-success btn-sm"
                              onClick={() => setShowLocationModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Create Storage
                         </button>
                         <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setShowAddModal(true)}
                         >
                              <RiAddLine className="me-1" />
                              Add Sample
                         </button>
                    </div>
               </div>

               {/* Navigation Tabs */}
               <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                              onClick={() => setActiveTab('overview')}
                         >
                              Overview
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'samples' ? 'active' : ''}`}
                              onClick={() => setActiveTab('samples')}
                         >
                              Samples ({samples.length})
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'locations' ? 'active' : ''}`}
                              onClick={() => setActiveTab('locations')}
                         >
                              Storage Locations ({locations.length})
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'monitoring' ? 'active' : ''}`}
                              onClick={() => setActiveTab('monitoring')}
                         >
                              Monitoring
                         </button>
                    </li>
                    <li className="nav-item">
                         <button
                              className={`nav-link ${activeTab === 'storage-types' ? 'active' : ''}`}
                              onClick={() => setActiveTab('storage-types')}
                         >
                              Storage Types ({Object.keys(getAllStorageTypes()).length})
                         </button>
                    </li>
               </ul>

               {/* Overview Tab */}
               {activeTab === 'overview' && (
                    <div className="row">
                         {/* Statistics Cards */}
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiArchiveLine size={48} className="text-primary mb-3" />
                                        <h3 className="card-title">{stats.total}</h3>
                                        <p className="card-text text-muted">Total Samples</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiCheckLine size={48} className="text-success mb-3" />
                                        <h3 className="card-title">{stats.stored}</h3>
                                        <p className="card-text text-muted">Currently Stored</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiTimeLine size={48} className="text-warning mb-3" />
                                        <h3 className="card-title">{stats.expired}</h3>
                                        <p className="card-text text-muted">Expired Samples</p>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-3 mb-4">
                              <div className="card h-100">
                                   <div className="card-body text-center">
                                        <RiAlertLine size={48} className="text-danger mb-3" />
                                        <h3 className="card-title">{stats.critical}</h3>
                                        <p className="card-text text-muted">Critical Condition</p>
                                   </div>
                              </div>
                         </div>

                         {/* Storage Locations Overview */}
                         <div className="col-12 mb-4">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">Storage Locations Status</h5>
                                   </div>
                                   <div className="card-body">
                                        <div className="row">
                                             {locations.map(location => (
                                                  <div key={location.id} className="col-md-4 mb-3">
                                                       <div className="card">
                                                            <div className="card-body">
                                                                 <div className="d-flex justify-content-between align-items-start mb-2">
                                                                      <h6 className="card-title mb-0">{location.name}</h6>
                                                                      <span className={`badge bg-${getAllStorageTypes()[location.type]?.color || 'secondary'}`}>
                                                                           {getAllStorageTypes()[location.type]?.icon || '📦'} {getAllStorageTypes()[location.type]?.label || location.type}
                                                                      </span>
                                                                 </div>
                                                                 <div className="row text-center">
                                                                      <div className="col-6">
                                                                           <div className="small text-muted">Usage</div>
                                                                           <div className="fw-bold">{location.currentUsage}/{location.capacity}</div>
                                                                      </div>
                                                                      <div className="col-6">
                                                                           <div className="small text-muted">Temperature</div>
                                                                           <div className="fw-bold">{location.temperature}°C</div>
                                                                      </div>
                                                                 </div>
                                                                 <div className="progress mt-2" style={{ height: '6px' }}>
                                                                      <div
                                                                           className="progress-bar"
                                                                           style={{ width: `${(location.currentUsage / location.capacity) * 100}%` }}
                                                                      ></div>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Samples Tab */}
               {activeTab === 'samples' && (
                    <div className="card">
                         <div className="card-header">
                              <h5 className="mb-0">Sample Storage Records</h5>
                         </div>
                         <div className="card-body p-0">
                              <PrimeTable
                                   column={sampleColumns}
                                   data={samples}
                                   filtering={true}
                                   handleSeverSideProcessing={false}
                                   serverSideFiltering={false}
                              />
                         </div>
                    </div>
               )}

               {/* Storage Locations Tab */}
               {activeTab === 'locations' && (
                    <div className="row">
                         {locations.map(location => (
                              <div key={location.id} className="col-md-6 mb-4">
                                   <div className="card h-100">
                                        <div className="card-header d-flex justify-content-between align-items-center">
                                             <h5 className="mb-0">{location.name}</h5>
                                             <span className={`badge bg-${location.status === 'active' ? 'success' : 'warning'}`}>
                                                  {location.status}
                                             </span>
                                        </div>
                                        <div className="card-body">
                                             <div className="row mb-3">
                                                  <div className="col-6">
                                                       <strong>Type:</strong><br />
                                                       <span className={`badge bg-${getAllStorageTypes()[location.type]?.color || 'secondary'}`}>
                                                            {getAllStorageTypes()[location.type]?.icon || '📦'} {getAllStorageTypes()[location.type]?.label || location.type}
                                                       </span>
                                                  </div>
                                                  <div className="col-6">
                                                       <strong>Capacity:</strong><br />
                                                       {location.currentUsage}/{location.capacity} samples
                                                  </div>
                                             </div>
                                             <div className="row mb-3">
                                                  <div className="col-6">
                                                       <strong>Temperature:</strong><br />
                                                       <RiThermometerLine className="me-1" />
                                                       {location.temperature}°C
                                                  </div>
                                                  <div className="col-6">
                                                       <strong>Last Checked:</strong><br />
                                                       {new Date(location.lastChecked).toLocaleString()}
                                                  </div>
                                             </div>
                                             <div className="progress mb-3">
                                                  <div
                                                       className="progress-bar"
                                                       style={{ width: `${(location.currentUsage / location.capacity) * 100}%` }}
                                                  >
                                                       {Math.round((location.currentUsage / location.capacity) * 100)}%
                                                  </div>
                                             </div>
                                             <div className="d-flex gap-2">
                                                  <button className="btn btn-sm btn-outline-primary"
                                                       onClick={() => handleEditLocation(location.id)}>
                                                       <RiEditLine className="me-1" />
                                                       Edit
                                                  </button>
                                                  <button className="btn btn-sm btn-outline-info"
                                                       onClick={() => handleMonitorLocation(location.id)}>
                                                       <RiEyeLine className="me-1" />
                                                       Monitor
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         ))}
                    </div>
               )}

               {/* Monitoring Tab */}
               {activeTab === 'monitoring' && (
                    <div className="row">
                         <div className="col-md-8">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">Temperature & Humidity Monitoring</h5>
                                   </div>
                                   <div className="card-body">
                                        <div className="alert alert-info">
                                             <RiAlertLine className="me-2" />
                                             Real-time monitoring system would be integrated here with actual sensor data.
                                        </div>
                                        <div className="row">
                                             {locations.map(location => (
                                                  <div key={location.id} className="col-md-6 mb-3">
                                                       <div className="card">
                                                            <div className="card-body">
                                                                 <h6>{location.name}</h6>
                                                                 <div className="d-flex justify-content-between mb-2">
                                                                      <span>Temperature:</span>
                                                                      <span className="fw-bold">{location.temperature}°C</span>
                                                                 </div>
                                                                 <div className="d-flex justify-content-between">
                                                                      <span>Status:</span>
                                                                      <span className={`badge bg-${location.status === 'active' ? 'success' : 'warning'}`}>
                                                                           {location.status}
                                                                      </span>
                                                                 </div>
                                                            </div>
                                                       </div>
                                                  </div>
                                             ))}
                                        </div>
                                   </div>
                              </div>
                         </div>
                         <div className="col-md-4">
                              <div className="card">
                                   <div className="card-header">
                                        <h5 className="mb-0">Alerts & Notifications</h5>
                                   </div>
                                   <div className="card-body">
                                        <div className="alert alert-warning mb-3">
                                             <RiAlertLine className="me-2" />
                                             <strong>Temperature Alert:</strong> Freezer Unit B temperature is 2°C above normal.
                                        </div>
                                        <div className="alert alert-danger mb-3">
                                             <RiAlertLine className="me-2" />
                                             <strong>Expiry Alert:</strong> 3 samples expiring within 24 hours.
                                        </div>
                                        <div className="alert alert-info">
                                             <RiAlertLine className="me-2" />
                                             <strong>Capacity Alert:</strong> Refrigerator Unit A is at 90% capacity.
                                        </div>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Storage Types Tab */}
               {activeTab === 'storage-types' && (
                    <div className="card">
                         <div className="card-header d-flex justify-content-between align-items-center">
                              <h5 className="mb-0">Storage Types Management</h5>
                              <button
                                   className="btn btn-primary btn-sm"
                                   onClick={() => setShowStorageTypeModal(true)}
                              >
                                   <RiAddLine className="me-1" />
                                   Add Storage Type
                              </button>
                         </div>
                         <div className="card-body">
                              <div className="row">
                                   {Object.values(getAllStorageTypes()).map(type => (
                                        <div key={type.id} className="col-md-6 col-lg-4 mb-3">
                                             <div className="card h-100">
                                                  <div className="card-body">
                                                       <div className="d-flex align-items-center mb-2">
                                                            <span className="fs-4 me-2">{type.icon}</span>
                                                            <div>
                                                                 <h6 className="card-title mb-0">{type.label}</h6>
                                                                 <small className="text-muted">ID: {type.id}</small>
                                                            </div>
                                                       </div>
                                                       <div className="row text-center">
                                                            <div className="col-6">
                                                                 <div className="small text-muted">Default Temp</div>
                                                                 <div className="fw-bold">{type.defaultTemp}°C</div>
                                                            </div>
                                                            <div className="col-6">
                                                                 <div className="small text-muted">Range</div>
                                                                 <div className="fw-bold">
                                                                      {type.minTemp !== undefined && type.maxTemp !== undefined
                                                                           ? `${type.minTemp}°C - ${type.maxTemp}°C`
                                                                           : 'No range set'}
                                                                 </div>
                                                            </div>
                                                       </div>
                                                       <div className="mt-2">
                                                            <span className={`badge bg-${type.color}`}>
                                                                 {type.color}
                                                            </span>
                                                            {STORAGE_TYPES[type.id] && (
                                                                 <span className="badge bg-secondary ms-1">Built-in</span>
                                                            )}
                                                            {customStorageTypes[type.id] && (
                                                                 <span className="badge bg-info ms-1">Custom</span>
                                                            )}
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   ))}
                              </div>
                              {Object.keys(customStorageTypes).length === 0 && (
                                   <div className="text-center py-4">
                                        <RiArchiveLine size={48} className="text-muted mb-3" />
                                        <h6 className="text-muted">No Custom Storage Types</h6>
                                        <p className="text-muted">Create custom storage types for specialized equipment like incubators, cryogenic tanks, etc.</p>
                                   </div>
                              )}
                         </div>
                    </div>
               )}

               {/* Sample Details Modal */}
               {selectedSample && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Sample Details - {selectedSample.sampleId}</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setSelectedSample(null)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <p><strong>Patient:</strong> {selectedSample.patientName}</p>
                                                  <p><strong>Test:</strong> {selectedSample.testName}</p>
                                                  <p><strong>Storage Location:</strong> {selectedSample.storageLocation}</p>
                                                  <p><strong>Storage Type:</strong>
                                                       <span className={`badge bg-${getAllStorageTypes()[selectedSample.storageType]?.color || 'secondary'} ms-2`}>
                                                            {getAllStorageTypes()[selectedSample.storageType]?.icon || '📦'} {getAllStorageTypes()[selectedSample.storageType]?.label || selectedSample.storageType}
                                                       </span>
                                                  </p>
                                             </div>
                                             <div className="col-md-6">
                                                  <p><strong>Storage Date:</strong> {new Date(selectedSample.storageDate).toLocaleDateString()}</p>
                                                  <p><strong>Expiry Date:</strong> {new Date(selectedSample.expiryDate).toLocaleDateString()}</p>
                                                  <p><strong>Status:</strong>
                                                       <span className={`badge bg-${STATUS_BADGES[selectedSample.status].color} ms-2`}>
                                                            {STATUS_BADGES[selectedSample.status].label}
                                                       </span>
                                                  </p>
                                                  <p><strong>Condition:</strong>
                                                       <span className={`badge bg-${CONDITION_BADGES[selectedSample.condition].color} ms-2`}>
                                                            {CONDITION_BADGES[selectedSample.condition].label}
                                                       </span>
                                                  </p>
                                             </div>
                                        </div>
                                        {selectedSample.notes && (
                                             <div className="mt-3">
                                                  <strong>Notes:</strong>
                                                  <p className="mt-1">{selectedSample.notes}</p>
                                             </div>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setSelectedSample(null)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Add Sample Modal */}
               {showAddModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog modal-lg">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Add New Sample</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowAddModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Sample ID *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={sampleForm.sampleId}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, sampleId: e.target.value }))}
                                                            placeholder="e.g., SAMP001"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Patient Name *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={sampleForm.patientName}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, patientName: e.target.value }))}
                                                            placeholder="Enter patient name"
                                                       />
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Test Name *</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={sampleForm.testName}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, testName: e.target.value }))}
                                                            placeholder="e.g., Complete Blood Count"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Storage Location *</label>
                                                       <select
                                                            className="form-select"
                                                            value={sampleForm.storageLocation}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, storageLocation: e.target.value }))}
                                                       >
                                                            <option value="">Select storage location</option>
                                                            {getAvailableLocations().map(location => (
                                                                 <option key={location.id} value={location.id}>
                                                                      {location.name} ({location.currentUsage}/{location.capacity} used)
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Storage Type</label>
                                                       <select
                                                            className="form-select"
                                                            value={sampleForm.storageType}
                                                            onChange={(e) => {
                                                                 const type = e.target.value;
                                                                 const allTypes = getAllStorageTypes();
                                                                 const temp = allTypes[type]?.defaultTemp || 22;
                                                                 setSampleForm(prev => ({ ...prev, storageType: type, temperature: temp }));
                                                            }}
                                                       >
                                                            {Object.values(getAllStorageTypes()).map(type => (
                                                                 <option key={type.id} value={type.id}>
                                                                      {type.icon} {type.label}
                                                                 </option>
                                                            ))}
                                                       </select>
                                                  </div>
                                                  <div className="mb-3">
                                                       <label className="form-label">Temperature (°C)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={sampleForm.temperature}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Storage Date</label>
                                                       <input
                                                            type="date"
                                                            className="form-control"
                                                            value={sampleForm.storageDate}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, storageDate: e.target.value }))}
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Expiry Date *</label>
                                                       <input
                                                            type="date"
                                                            className="form-control"
                                                            value={sampleForm.expiryDate}
                                                            onChange={(e) => setSampleForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Notes</label>
                                             <textarea
                                                  className="form-control"
                                                  rows={3}
                                                  value={sampleForm.notes}
                                                  onChange={(e) => setSampleForm(prev => ({ ...prev, notes: e.target.value }))}
                                                  placeholder="Additional notes about the sample..."
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setShowAddModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-primary btn-sm"
                                             onClick={handleAddSample}
                                        >
                                             Add Sample
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Create Storage Modal */}
               {showLocationModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Create Storage Location</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowLocationModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Storage Name *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={locationForm.name}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
                                                  placeholder="e.g., Refrigerator Unit A"
                                             />
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Storage Type</label>
                                             <select
                                                  className="form-select"
                                                  value={locationForm.type}
                                                  onChange={(e) => {
                                                       const type = e.target.value;
                                                       const allTypes = getAllStorageTypes();
                                                       const temp = allTypes[type]?.defaultTemp || 22;
                                                       setLocationForm(prev => ({ ...prev, type, temperature: temp }));
                                                  }}
                                             >
                                                  {Object.values(getAllStorageTypes()).map(type => (
                                                       <option key={type.id} value={type.id}>
                                                            {type.icon} {type.label}
                                                       </option>
                                                  ))}
                                             </select>
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Capacity (samples)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={locationForm.capacity}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                                                            min="1"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Target Temperature (°C)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={locationForm.temperature}
                                                            onChange={(e) => setLocationForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0 }))}
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Status</label>
                                             <select
                                                  className="form-select"
                                                  value={locationForm.status}
                                                  onChange={(e) => setLocationForm(prev => ({ ...prev, status: e.target.value as StorageLocation['status'] }))}
                                             >
                                                  <option value="active">Active</option>
                                                  <option value="maintenance">Maintenance</option>
                                                  <option value="offline">Offline</option>
                                             </select>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setShowLocationModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-success btn-sm"
                                             onClick={handleCreateLocation}
                                        >
                                             Create Storage
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {/* Create Storage Type Modal */}
               {showStorageTypeModal && (
                    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                         <div className="modal-dialog">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Create Custom Storage Type</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowStorageTypeModal(false)}
                                        ></button>
                                   </div>
                                   <div className="modal-body">
                                        <div className="mb-3">
                                             <label className="form-label">Type ID *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={storageTypeForm.id}
                                                  onChange={(e) => setStorageTypeForm(prev => ({ ...prev, id: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                                                  placeholder="e.g., nitrogen_tank"
                                             />
                                             <div className="form-text">Unique identifier (no spaces, use underscores)</div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Display Label *</label>
                                             <input
                                                  type="text"
                                                  className="form-control"
                                                  value={storageTypeForm.label}
                                                  onChange={(e) => setStorageTypeForm(prev => ({ ...prev, label: e.target.value }))}
                                                  placeholder="e.g., Liquid Nitrogen Tank (-196°C)"
                                             />
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Icon</label>
                                                       <input
                                                            type="text"
                                                            className="form-control"
                                                            value={storageTypeForm.icon}
                                                            onChange={(e) => setStorageTypeForm(prev => ({ ...prev, icon: e.target.value }))}
                                                            placeholder="📦"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Color Theme</label>
                                                       <select
                                                            className="form-select"
                                                            value={storageTypeForm.color}
                                                            onChange={(e) => setStorageTypeForm(prev => ({ ...prev, color: e.target.value }))}
                                                       >
                                                            <option value="primary">Primary (Blue)</option>
                                                            <option value="secondary">Secondary (Gray)</option>
                                                            <option value="success">Success (Green)</option>
                                                            <option value="danger">Danger (Red)</option>
                                                            <option value="warning">Warning (Yellow)</option>
                                                            <option value="info">Info (Cyan)</option>
                                                       </select>
                                                  </div>
                                             </div>
                                        </div>
                                        <div className="mb-3">
                                             <label className="form-label">Default Temperature (°C)</label>
                                             <input
                                                  type="number"
                                                  className="form-control"
                                                  value={storageTypeForm.defaultTemp}
                                                  onChange={(e) => setStorageTypeForm(prev => ({ ...prev, defaultTemp: parseFloat(e.target.value) || 0 }))}
                                             />
                                        </div>
                                        <div className="row">
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Min Temperature (°C)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={storageTypeForm.minTemp}
                                                            onChange={(e) => setStorageTypeForm(prev => ({ ...prev, minTemp: e.target.value }))}
                                                            placeholder="Optional"
                                                       />
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="mb-3">
                                                       <label className="form-label">Max Temperature (°C)</label>
                                                       <input
                                                            type="number"
                                                            className="form-control"
                                                            value={storageTypeForm.maxTemp}
                                                            onChange={(e) => setStorageTypeForm(prev => ({ ...prev, maxTemp: e.target.value }))}
                                                            placeholder="Optional"
                                                       />
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-secondary btn-sm"
                                             onClick={() => setShowStorageTypeModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-info btn-sm"
                                             onClick={handleCreateStorageType}
                                        >
                                             Create Storage Type
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}