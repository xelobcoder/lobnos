'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, Popup } from 'react-leaflet';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import GoogleMapPicker, { LocationValue } from '../../../components/home-collection/GoogleMapPicker';
import 'leaflet/dist/leaflet.css';

type HomeCollectionOrder = {
     id: number;
     patientid: number;
     patient_name?: string;
     appointment_date: string;
     appointment_time: string;
     address: string;
     latitude: number;
     longitude: number;
     collection_fee: number;
     assigned_to: number | null;
     staff_name?: string;
     status: string;
};

type HomeCollectionStaff = {
     id: number;
     employeeid: number;
     staff_name?: string;
     vehicle_number: string;
     is_available: boolean;
};

type TestPanel = {
     id: number;
     name: string;
     price: number;
};

const STATUS_BADGE: Record<string, string> = {
     Pending: 'text-bg-warning',
     Confirmed: 'text-bg-info',
     Assigned: 'text-bg-primary',
     EnRoute: 'text-bg-primary',
     Collected: 'text-bg-secondary',
     Received: 'text-bg-secondary',
     Completed: 'text-bg-success',
     Cancelled: 'text-bg-danger',
};

const EMPTY_LOCATION: LocationValue = { address: '', latitude: 0, longitude: 0 };

export default function HomeCollectionPage() {
     const [orders, setOrders] = useState<HomeCollectionOrder[]>([]);
     const [staff, setStaff] = useState<HomeCollectionStaff[]>([]);
     const [testPanels, setTestPanels] = useState<TestPanel[]>([]);
     const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
     const [testSearch, setTestSearch] = useState('');
     const [patientFilter, setPatientFilter] = useState('');
     const [error, setError] = useState('');
     const [showForm, setShowForm] = useState(false);
     const [submitting, setSubmitting] = useState(false);

     const [patientId, setPatientId] = useState('');
     const [appointmentDate, setAppointmentDate] = useState('');
     const [appointmentTime, setAppointmentTime] = useState('');
     const [collectionFee, setCollectionFee] = useState('0');
     const [location, setLocation] = useState<LocationValue>(EMPTY_LOCATION);
     // Longitude near 0 is a valid coordinate here (Ghana sits on the Prime Meridian), so a
     // truthy check on latitude/longitude can't tell "unset" from "picked at ~0". Track it explicitly.
     const [hasPickedLocation, setHasPickedLocation] = useState(false);

     const loadOrders = useCallback(async (search?: string) => {
          const query = search?.trim() ? `home-collection/orders?count=100&search=${encodeURIComponent(search.trim())}` : 'home-collection/orders?count=100';
          const response = await customFetch(query);
          if (response?.status === 'success') {
               setOrders(response.result.orders || []);
          } else {
               setError(response?.message || 'Unable to load home collection orders.');
          }
     }, []);

     const loadStaff = useCallback(async () => {
          const response = await customFetch('home-collection/staff');
          if (response?.status === 'success') setStaff(response.result || []);
     }, []);

     const loadTestPanels = useCallback(async () => {
          const response = await customFetch('testpanel/list');
          const panels = response?.data || response?.result || [];
          if (Array.isArray(panels)) {
               setTestPanels(panels.map((panel: any) => ({ id: panel.id, name: panel.name, price: Number(panel.price) || 0 })));
          }
     }, []);

     useEffect(() => {
          loadOrders();
          loadStaff();
          loadTestPanels();
     }, [loadOrders, loadStaff, loadTestPanels]);

     // Debounce the patient filter so we don't fire a request on every keystroke.
     useEffect(() => {
          const timeout = setTimeout(() => loadOrders(patientFilter), 350);
          return () => clearTimeout(timeout);
     }, [patientFilter, loadOrders]);

     const resetForm = () => {
          setPatientId('');
          setAppointmentDate('');
          setAppointmentTime('');
          setCollectionFee('0');
          setLocation(EMPTY_LOCATION);
          setHasPickedLocation(false);
          setSelectedTestIds(new Set());
          setTestSearch('');
     };

     const toggleTest = (testId: number) => {
          setSelectedTestIds((current) => {
               const next = new Set(current);
               if (next.has(testId)) next.delete(testId); else next.add(testId);
               return next;
          });
     };

     const selectedTests = useMemo(
          () => testPanels.filter((panel) => selectedTestIds.has(panel.id)),
          [testPanels, selectedTestIds]
     );

     const filteredTestPanels = useMemo(
          () => (testSearch.trim() ? testPanels.filter((panel) => panel.name.toLowerCase().includes(testSearch.trim().toLowerCase())) : testPanels),
          [testPanels, testSearch]
     );

     const submitOrder = async () => {
          setError('');
          if (!patientId || !appointmentDate || !appointmentTime || !hasPickedLocation) {
               setError('Patient ID, appointment date/time, and a pickup location are required.');
               return;
          }
          setSubmitting(true);
          const response = await customFetchMutation('home-collection/orders', 'POST', {
               patientid: Number(patientId),
               appointment_date: appointmentDate,
               appointment_time: appointmentTime,
               address: location.address,
               latitude: location.latitude,
               longitude: location.longitude,
               collection_fee: Number(collectionFee) || 0,
               tests: selectedTests.map((test) => ({ testid: test.id, name: test.name, price: test.price })),
          });
          setSubmitting(false);
          if (response?.status === 'success') {
               setShowForm(false);
               resetForm();
               await loadOrders(patientFilter);
          } else {
               setError(response?.message || 'Unable to schedule this home collection.');
          }
     };

     const assignStaff = async (orderId: number, employeeId: string) => {
          if (!employeeId) return;
          const response = await customFetchMutation(`home-collection/orders/${orderId}/assign`, 'PUT', { assigned_to: Number(employeeId) });
          if (response?.status === 'success') await loadOrders(patientFilter);
     };

     const updateStatus = async (orderId: number, status: string) => {
          const response = await customFetchMutation(`home-collection/orders/${orderId}/status`, 'PUT', { status });
          if (response?.status === 'success') await loadOrders(patientFilter);
     };

     const activeOrders = useMemo(() => orders.filter((order) => order.status !== 'Completed' && order.status !== 'Cancelled'), [orders]);

     return (
          <div className="p-3">
               <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="mb-0">Home Collection</h4>
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                         + New Pickup
                    </button>
               </div>

               {error && <div className="alert alert-danger">{error}</div>}

               <div className="mb-3" style={{ maxWidth: 320 }}>
                    <input
                         type="text"
                         className="form-control"
                         placeholder="Filter by patient name or ID…"
                         value={patientFilter}
                         onChange={(event) => setPatientFilter(event.target.value)}
                    />
               </div>

               <DispatchMap orders={activeOrders} />

               <div className="table-responsive mt-3">
                    <table className="table table-hover align-middle">
                         <thead>
                              <tr>
                                   <th>Patient</th>
                                   <th>Appointment</th>
                                   <th>Address</th>
                                   <th>Fee</th>
                                   <th>Assigned staff</th>
                                   <th>Status</th>
                                   <th>Actions</th>
                              </tr>
                         </thead>
                         <tbody>
                              {orders.map((order) => (
                                   <tr key={order.id}>
                                        <td>{order.patient_name?.trim() || `#${order.patientid}`}</td>
                                        <td>{order.appointment_date} {order.appointment_time}</td>
                                        <td style={{ maxWidth: 220 }} className="text-truncate">{order.address}</td>
                                        <td>{order.collection_fee}</td>
                                        <td>
                                             <select
                                                  className="form-select form-select-sm"
                                                  value={order.assigned_to ?? ''}
                                                  onChange={(event) => assignStaff(order.id, event.target.value)}
                                             >
                                                  <option value="">Unassigned</option>
                                                  {staff.map((member) => (
                                                       <option key={member.id} value={member.employeeid}>
                                                            {member.staff_name || `Staff #${member.employeeid}`} ({member.vehicle_number})
                                                       </option>
                                                  ))}
                                             </select>
                                        </td>
                                        <td>
                                             <span className={`badge ${STATUS_BADGE[order.status] || 'text-bg-light'}`}>{order.status}</span>
                                        </td>
                                        <td>
                                             <select
                                                  className="form-select form-select-sm"
                                                  value={order.status}
                                                  onChange={(event) => updateStatus(order.id, event.target.value)}
                                             >
                                                  {Object.keys(STATUS_BADGE).map((status) => (
                                                       <option key={status} value={status}>{status}</option>
                                                  ))}
                                             </select>
                                        </td>
                                   </tr>
                              ))}
                              {orders.length === 0 && (
                                   <tr>
                                        <td colSpan={7} className="text-center text-muted">No home collection orders yet.</td>
                                   </tr>
                              )}
                         </tbody>
                    </table>
               </div>

               {showForm && (
                    <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.4)' }} tabIndex={-1}>
                         <div className="modal-dialog modal-lg mt-3" style={{ marginTop: '2rem' }}>
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Schedule a home collection</h5>
                                        <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                                   </div>
                                   <div className="modal-body">
                                        <div className="row g-2 mb-2">
                                             <div className="col-md-4">
                                                  <label className="form-label">Patient ID</label>
                                                  <input type="number" className="form-control" value={patientId} onChange={(event) => setPatientId(event.target.value)} />
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label">Appointment date</label>
                                                  <input type="date" className="form-control" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} />
                                             </div>
                                             <div className="col-md-4">
                                                  <label className="form-label">Appointment time</label>
                                                  <input type="time" className="form-control" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} />
                                             </div>
                                        </div>
                                        <div className="mb-2">
                                             <label className="form-label">Tests to collect</label>
                                             <input
                                                  type="text"
                                                  className="form-control form-control-sm mb-1"
                                                  placeholder="Search test panels…"
                                                  value={testSearch}
                                                  onChange={(event) => setTestSearch(event.target.value)}
                                             />
                                             <div className="border rounded p-2" style={{ maxHeight: 160, overflowY: 'auto' }}>
                                                  {filteredTestPanels.map((panel) => (
                                                       <div className="form-check" key={panel.id}>
                                                            <input
                                                                 type="checkbox"
                                                                 className="form-check-input"
                                                                 id={`test-${panel.id}`}
                                                                 checked={selectedTestIds.has(panel.id)}
                                                                 onChange={() => toggleTest(panel.id)}
                                                            />
                                                            <label className="form-check-label" htmlFor={`test-${panel.id}`}>
                                                                 {panel.name} {panel.price ? `— ${panel.price}` : ''}
                                                            </label>
                                                       </div>
                                                  ))}
                                                  {filteredTestPanels.length === 0 && <div className="text-muted small">No matching test panels.</div>}
                                             </div>
                                             {selectedTests.length > 0 && (
                                                  <small className="text-muted">Selected: {selectedTests.map((test) => test.name).join(', ')}</small>
                                             )}
                                        </div>
                                        <div className="mb-2">
                                             <label className="form-label">Collection fee</label>
                                             <input type="number" className="form-control" value={collectionFee} onChange={(event) => setCollectionFee(event.target.value)} />
                                        </div>
                                        <div className="mb-2">
                                             <label className="form-label">Pickup location</label>
                                             <GoogleMapPicker
                                                  value={location}
                                                  onChange={(next) => {
                                                       setLocation(next);
                                                       setHasPickedLocation(true);
                                                  }}
                                             />
                                        </div>
                                   </div>
                                   <div className="modal-footer">
                                        <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                        <button className="btn btn-primary" disabled={submitting} onClick={submitOrder}>
                                             {submitting ? 'Scheduling…' : 'Schedule pickup'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}

function DispatchMap({ orders }: { orders: HomeCollectionOrder[] }) {
     const [mounted, setMounted] = useState(false);
     useEffect(() => setMounted(true), []);

     const withCoordinates = orders.filter((order) => order.latitude && order.longitude);

     if (!mounted || withCoordinates.length === 0) {
          return null;
     }

     const center: [number, number] = [withCoordinates[0].latitude, withCoordinates[0].longitude];

     return (
          <MapContainer center={center} zoom={11} style={{ width: '100%', height: '360px', borderRadius: '6px' }}>
               <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
               />
               {withCoordinates.map((order) => (
                    <LeafletMarker key={order.id} position={[order.latitude, order.longitude]}>
                         <Popup>#{order.id} — {order.patient_name || 'Patient'} — {order.status}</Popup>
                    </LeafletMarker>
               ))}
          </MapContainer>
     );
}
