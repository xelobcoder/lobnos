'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { customFetch, customFetchMutation } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import type { LocationValue } from '../../../components/home-collection/GoogleMapPicker';
import 'leaflet/dist/leaflet.css';
import dayjs from 'dayjs';

const GoogleMapPicker = dynamic(() => import('../../../components/home-collection/GoogleMapPicker'), { ssr: false });
const DispatchMap = dynamic(() => import('../../../components/home-collection/DispatchMap'), { ssr: false });

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
     tests?: HomeCollectionOrderTest[];
};

type HomeCollectionOrderTest = {
     id: number;
     home_collection_id: number;
     testid: number;
     test_name_snapshot: string;
     price: number;
};

type HomeCollectionStaff = {
     id: number;
     employeeid: number;
     staff_name?: string;
     vehicle_number?: string;
     is_available: boolean;
};

type OrderDraft = {
     assigned_to: string;
     status: string;
     saving: boolean;
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
     const application = useApplication();
     const employeeid = application?.user?.employeeid || 0;
     const [orders, setOrders] = useState<HomeCollectionOrder[]>([]);
     const [staff, setStaff] = useState<HomeCollectionStaff[]>([]);
     const [testPanels, setTestPanels] = useState<TestPanel[]>([]);
     const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
     const [testSearch, setTestSearch] = useState('');
     const [patientFilter, setPatientFilter] = useState('');
     const [error, setError] = useState('');
     const [showForm, setShowForm] = useState(false);
     const [submitting, setSubmitting] = useState(false);
     const [orderDrafts, setOrderDrafts] = useState<Record<number, OrderDraft>>({});

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
               const loadedOrders = response.result.orders || [];
               setOrders(loadedOrders);
               setOrderDrafts(Object.fromEntries(
                    loadedOrders.map((order: HomeCollectionOrder) => [order.id, {
                         assigned_to: order.assigned_to ? String(order.assigned_to) : '',
                         status: order.status,
                         saving: false,
                    }])
               ));
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

     const updateOrderDraft = (orderId: number, patch: Partial<OrderDraft>) => {
          setOrderDrafts((current) => ({
               ...current,
               [orderId]: {
                    assigned_to: current[orderId]?.assigned_to || '',
                    status: current[orderId]?.status || 'Pending',
                    saving: current[orderId]?.saving || false,
                    ...patch,
               },
          }));
     };

     const saveOrderChanges = async (order: HomeCollectionOrder) => {
          const draft = orderDrafts[order.id];
          if (!draft) return;
          if (!employeeid) {
               setError('Employee session not found. Please sign in again.');
               return;
          }

          setError('');
          updateOrderDraft(order.id, { saving: true });
          try {
               if (draft.assigned_to && draft.assigned_to !== String(order.assigned_to || '')) {
                    const assignResponse = await customFetchMutation(`home-collection/orders/${order.id}/assign?employeeid=${employeeid}`, 'PUT', { assigned_to: Number(draft.assigned_to) });
                    if (assignResponse?.status !== 'success') {
                         setError(assignResponse?.message || 'Unable to assign staff.');
                         return;
                    }
               }

               if (draft.status && draft.status !== order.status) {
                    const statusResponse = await customFetchMutation(`home-collection/orders/${order.id}/status?employeeid=${employeeid}`, 'PUT', { status: draft.status });
                    if (statusResponse?.status !== 'success') {
                         setError(statusResponse?.message || 'Unable to update status.');
                         return;
                    }
               }

               await loadOrders(patientFilter);
          } finally {
               updateOrderDraft(order.id, { saving: false });
          }
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
                                   <th>Samples</th>
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
                                        <td>{dayjs(order.appointment_date).format('YYYY-MM-DD')} {order.appointment_time}</td>
                                        <td style={{ maxWidth: 220 }} className="text-truncate">{order.address}</td>
                                        <td style={{ minWidth: 180 }}>
                                             {order.tests?.length ? (
                                                  <div className="small">
                                                       {order.tests.map((test) => (
                                                            <div key={test.id}>{test.test_name_snapshot || `Test #${test.testid}`}</div>
                                                       ))}
                                                  </div>
                                             ) : (
                                                  <span className="text-muted small">No samples listed</span>
                                             )}
                                        </td>
                                        <td>{order.collection_fee}</td>
                                        <td>
                                             <select
                                                  className="form-select form-select-sm"
                                                  value={orderDrafts[order.id]?.assigned_to ?? ''}
                                                  onChange={(event) => updateOrderDraft(order.id, { assigned_to: event.target.value })}
                                             >
                                                  <option value="">Unassigned</option>
                                                  {staff.map((member) => (
                                                       <option key={member.id} value={member.employeeid}>
                                                            {member.staff_name || `Staff #${member.employeeid}`}{member.vehicle_number ? ` (${member.vehicle_number})` : ''}
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
                                                  value={orderDrafts[order.id]?.status ?? order.status}
                                                  onChange={(event) => updateOrderDraft(order.id, { status: event.target.value })}
                                             >
                                                  {Object.keys(STATUS_BADGE).map((status) => (
                                                       <option key={status} value={status}>{status}</option>
                                                  ))}
                                             </select>
                                             <button
                                                  className="btn btn-sm btn-primary mt-1"
                                                  disabled={orderDrafts[order.id]?.saving}
                                                  onClick={() => saveOrderChanges(order)}
                                             >
                                                  {orderDrafts[order.id]?.saving ? 'Saving…' : 'Save'}
                                             </button>
                                        </td>
                                   </tr>
                              ))}
                              {orders.length === 0 && (
                                   <tr>
                                        <td colSpan={8} className="text-center text-muted">No home collection orders yet.</td>
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

