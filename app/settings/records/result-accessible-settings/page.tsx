'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button, Form, Modal, Alert } from 'react-bootstrap';
import { RiShieldCheckLine, RiSettings4Line, RiSaveLine } from '@remixicon/react';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import PrimeTable from '../../../../components/accessories/Datatables/PrimeTable';
import { toast } from 'react-toastify';
import { useApplication } from '../../../../components/Auth/useApplicationContext';

interface Employee {
     employeeid: number;
     username: string;
     role: string;
     email: string;
     branch: number;
     branchname: string;
     emailAuthenticated: string;
     activation: number;
}

interface AccessWindow {
     id: number;
     employeeid: number;
     category: string;
     edit_window: string;
     access_window: string;
     applicable_role: string;
     require_approval: number;
     created_at: string;
     updated_at: string;
     username?: string;
     email?: string;
     employee_role?: string;
}

export default function ResultAccessibleSettingsPage() {
     const [defaultAccessWindow, setDefaultAccessWindow] = useState<'1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m'>('24h');
     const [defaultEditWindow, setDefaultEditWindow] = useState<'1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m'>('24h');
     const [defaultRequireApproval, setDefaultRequireApproval] = useState(true);
     const [showModal, setShowModal] = useState(false);
     const [showGlobalModal, setShowGlobalModal] = useState(false);
     const [employees, setEmployees] = useState<Employee[]>([]);
     const [employeeId, setEmployeeId] = useState<number | ''>('');
     const [employeeRole, setEmployeeRole] = useState<string>('');
     const [employeeEditWindow, setEmployeeEditWindow] = useState<'1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m'>('24h');
     const [employeeAccessWindow, setEmployeeAccessWindow] = useState<'1h' | '4h' | '8h' | '12h' | '24h' | '1d' | '1w' | '2w' | '1m'>('24h');
     const [employeeRequireApproval, setEmployeeRequireApproval] = useState(true);
     const currentUser = useApplication()?.user?.employeeid;

     const [isSavingDefaults, setIsSavingDefaults] = useState(false);
     const [isSavingIndividual, setIsSavingIndividual] = useState(false);

     const [existingAccesses, setExistingAccesses] = useState<AccessWindow[]>([]);
     const [editingId, setEditingId] = useState<number | null>(null);
     const [editingGlobalId, setEditingGlobalId] = useState<number | null>(null);

     useEffect(() => {
          const fetchEmployees = async () => {
               try {
                    const response = await customFetch('logins');
                    if (response.status === 'success') {
                         setEmployees(response.result);
                    }
               } catch (error) {
                    console.error('Failed to fetch employees:', error);
               }
          };
          const fetchAllAccessWindows = async () => {
               try {
                    const response = await customFetch('security-features/access-windows?page=1&&count=10');
                    if (response && response.status === true) {
                         setExistingAccesses(response.data)
                    }
               } catch (error) {
                    console.error('Failed to fetch access windows:', error);
               }
          };
          fetchEmployees();
          fetchAllAccessWindows();
     }, []);

     const employeeGeneration=useRef(0),loadedEmployee=useRef<number|null>(null);
     const [employeeLoading,setEmployeeLoading]=useState(false);
     const [employeeError,setEmployeeError]=useState('');
     useEffect(()=>{
          const generation=++employeeGeneration.current;
          loadedEmployee.current=null;
          setEditingId(null);
          setEmployeeEditWindow('24h');
          setEmployeeAccessWindow('24h');
          setEmployeeRequireApproval(true);
          setEmployeeError('');
          const selected=employees.find(employee=>employee.employeeid===employeeId);
          setEmployeeRole(selected?.role||'');
          if(!employeeId){setEmployeeLoading(false);return;}
          setEmployeeLoading(true);
          customFetch(`security-features/access-windows/employee/${employeeId}`).then(response=>{
               if(generation!==employeeGeneration.current)return;
               const missing=response?.status===false&&response.error==='Access window not found for this employee';
               if(!response||response.error&&!missing||response.statusCode>=500)throw new Error('Unable to load employee access settings');
               if(response.status===true){
                    const window=response.data??response;
                    if(window.employeeid!=null&&Number(window.employeeid)!==Number(employeeId))throw new Error('Employee identity mismatch');
                    setEmployeeEditWindow(window.edit_window);setEmployeeAccessWindow(window.access_window);setEmployeeRequireApproval(!!window.require_approval);setEditingId(window.id);
               }
               loadedEmployee.current=Number(employeeId);
          }).catch(error=>{if(generation===employeeGeneration.current)setEmployeeError(error.message);}).finally(()=>{if(generation===employeeGeneration.current)setEmployeeLoading(false);});
          return()=>{employeeGeneration.current++;};
     },[employeeId,employees]);

     const handleSaveDefaults = async () => {
          setIsSavingDefaults(true);
          try {
               const payload = {
                    ...(editingGlobalId && { id: editingGlobalId }),
                    employeeid:0,
                    category: "global",
                    edit_window: defaultEditWindow,
                    access_window: defaultAccessWindow,
                    applicable_role: "scientist",
                    require_approval: defaultRequireApproval
               };
               const response = await customPost('security-features/access-windows', 'POST', payload);
               if (response && response.status === true) {
                    toast.success(editingGlobalId ? 'Global settings updated successfully' : 'Global settings saved successfully');
                    setShowGlobalModal(false);
                    // Refresh the list
                    const updatedResponse = await customFetch('security-features/access-windows?page=1&&count=10');
                    if (updatedResponse && updatedResponse.status === true) {
                         setExistingAccesses(updatedResponse.data || updatedResponse);
                    }
                    // Reset editing state
                    setEditingGlobalId(null);
               } else {
                    console.error('Failed to save default settings');
               }
          } catch (error) {
               console.error('Error saving default settings:', error);
          } finally {
               setIsSavingDefaults(false);
          }
     };

     const handleSaveIndividual = async () => {
          if(!employeeId||employeeLoading||loadedEmployee.current!==Number(employeeId)||isSavingIndividual)return;
          setIsSavingIndividual(true);
          try {
               const payload = {
                    ...(editingId && { id: editingId }),
                    employeeid: employeeId,
                    category: "individual",
                    edit_window: employeeEditWindow,
                    access_window: employeeAccessWindow,
                    applicable_role: employeeRole,
                    require_approval: employeeRequireApproval
               };
               const url = editingId ? `security-features/access-windows/${editingId}` : 'security-features/access-windows';
               const method = editingId ? 'PUT' : 'POST';
               const response = await customPost(url, method, payload);
               if (response && response.status === true) {
                    toast.success(editingId ? 'Individual access settings updated successfully' : 'Individual access settings saved successfully');
                    setShowModal(false);
                    // Refresh the list
                    const updatedResponse = await customFetch('security-features/access-windows?page=1&&count=10');
                    if (updatedResponse && updatedResponse.status === true) {
                         setExistingAccesses(updatedResponse.data || updatedResponse);
                    }
                    // Reset editing state
                    setEditingId(null);
               } else {
                    console.error('Failed to save individual access settings');
               }
          } catch (error) {
               console.error('Error saving individual access settings:', error);
          } finally {
               setIsSavingIndividual(false);
          }
     };

     const handleDelete = async (employeeid: number) => {
          try {
               const response = await customPost(`security-features/access-windows/employee/${employeeid}`, 'DELETE', {});
               if (response && response.status === true) {
                    // Refresh the list
                    const updatedResponse = await customFetch('security-features/access-windows?page=1&&count=10');
                    if (updatedResponse && updatedResponse.status === true) {
                         setExistingAccesses(updatedResponse.data || updatedResponse);
                    }
                    toast.success('Access settings deleted successfully');
               }
          } catch (error) {
               console.error('Error deleting access settings:', error);
          }
     };

     const columns = [
          {
               Header: 'Employee',
               accessor: 'username',
               Cell: ({ value, row }) => row.original.employeeid === 0 ? 'Global Default' : value || 'N/A',
          },
          {
               Header: 'Role',
               accessor: 'applicable_role',
          },
          {
               Header: 'Access Window',
               accessor: 'access_window',
          },
          {
               Header: 'Edit Window',
               accessor: 'edit_window',
          },
          {
               Header: 'Require Approval',
               accessor: 'require_approval',
               Cell: ({ value }) => value ? 'Yes' : 'No',
          },
          {
               Header: 'Actions',
               Cell: ({ row }) => (
                    <div className="d-flex gap-1">
                         <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                   const access = row.original;
                                   if (access.employeeid === 0 && access.category === 'global') {
                                        // Global settings
                                        setDefaultAccessWindow(access.access_window);
                                        setDefaultEditWindow(access.edit_window);
                                        setDefaultRequireApproval(!!access.require_approval);
                                        setEditingGlobalId(access.id);
                                        setShowGlobalModal(true);
                                   } else {
                                        // Individual settings
                                        setEmployeeId(access.employeeid);
                                        setEmployeeRole(access.applicable_role);
                                        setEmployeeAccessWindow(access.access_window);
                                        setEmployeeEditWindow(access.edit_window);
                                        setEmployeeRequireApproval(!!access.require_approval);
                                        setEditingId(access.id);
                                        setShowModal(true);
                                   }
                              }}
                         >
                              Edit
                         </Button>
                         <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(row.original.employeeid)}
                         >
                              Delete
                         </Button>
                    </div>
               ),
          },
     ];

     const handleServerSideProcessing = async (pagination: { page: number; count: number }) => {
          const url = `security-features/access-windows?page=${pagination.page}&&count=${pagination.count}`;
          try {
               const response = await customFetch(url);
               if (Array.isArray(response.data) && response.status === true) {
                    return { result: response.data, error: false };
               } else {
                    return { result: [], error: false }
               }
          } catch (error) {
               return { result: [], error: true }
          }
     }

     return (
          <>
               <div className="container-fluid p-4">
                    <div className="d-flex align-items-center justify-content-between mb-4">
                         <div>
                              <h2 className="mb-1 h5">Staff Result Access Permissions</h2>
                              <p className="text-muted mb-0 small">Control global staff access windows after initial result entry and approval</p>
                         </div>
                         <div className="d-flex gap-2">
                              <Button variant="outline-primary" onClick={() => { setShowGlobalModal(true); setEditingGlobalId(null); }} className="d-flex align-items-center gap-2">
                                   <RiSettings4Line size={16} />
                                   Edit Global Settings
                              </Button>
                              <Button variant="primary" onClick={() => { setShowModal(true); setEditingId(null); }} className="d-flex align-items-center gap-2">
                                   <RiSettings4Line size={16} />
                                   Add Individual Access
                              </Button>
                         </div>
                    </div>

                    <Alert variant="warning" className="mb-4">
                         <div className="d-flex align-items-start gap-3">
                              <RiShieldCheckLine size={20} className="text-warning mt-1" />
                              <div className="small">
                                   <strong>Quality Control:</strong> These settings ensure result integrity by limiting
                                   unauthorized access after initial approval. Changes affect laboratory workflows and compliance.
                              </div>
                         </div>
                    </Alert>

                    <div className="mt-4">
                         <h5 className="mb-3">Individual Access Settings</h5>
                         {existingAccesses.length > 0 ? (
                              <PrimeTable
                                   column={columns}
                                   data={existingAccesses}
                                   filtering={true}
                                   serverSideFiltering={true}
                                   handleSeverSideProcessing={handleServerSideProcessing}
                              />
                         ) : (
                              <p className="text-muted">No individual access settings configured yet.</p>
                         )}
                    </div>

                    <Modal show={showModal} onHide={() => setShowModal(false)} >
                         <Modal.Header closeButton>
                              <Modal.Title className="h6">{editingId ? 'Edit' : 'Add'} Individual Employee Access</Modal.Title>
                         </Modal.Header>
                         <Modal.Body>
                              {employeeLoading&&<p role="status">Loading employee settings...</p>}{employeeError&&<p role="alert" className="text-danger">{employeeError}</p>}<Form>
                                   <Form.Group className="mb-3">
                                        <Form.Label>Select Employee</Form.Label>
                                        <Form.Select
                                             value={employeeId}
                                             onChange={(e) => setEmployeeId(e.target.value ? Number(e.target.value) : '')}
                                        >
                                             <option value="">Select an employee...</option>
                                             {employees.map((emp) => (
                                                  <option key={emp.employeeid} value={emp.employeeid}>{emp.username}</option>
                                             ))}
                                        </Form.Select>
                                   </Form.Group>

                                   <Form.Group className="mb-3">
                                        <Form.Label>Role</Form.Label>
                                        <Form.Control
                                             value={employeeRole}
                                             readOnly
                                        />
                                   </Form.Group>

                                   {editingId && (
                                        <div className='border br-5 p-2 my-2'>
                                             <p className="mb-2 small fw-bold">Current Access Settings</p>
                                             <hr />
                                             <div className="small fw-light">
                                                  <p className="mb-1"><strong>Access Window:</strong> {employeeAccessWindow}</p>
                                                  <p className="mb-1"><strong>Edit Window:</strong> {employeeEditWindow}</p>
                                                  <p className="mb-0"><strong>Require Approval:</strong> {employeeRequireApproval ? 'Yes' : 'No'}</p>
                                             </div>
                                        </div>
                                   )}

                                   <Form.Group className="mb-3">
                                        <Form.Check
                                             type="switch"
                                             id="employee-require-approval"
                                             label="Require Approval"
                                             checked={employeeRequireApproval}
                                             onChange={(e) => setEmployeeRequireApproval(e.target.checked)}
                                        />
                                   </Form.Group>

                                   <Form.Group className="mb-3">
                                        <Form.Label>Access Window</Form.Label>
                                        <Form.Select
                                             value={employeeAccessWindow}
                                             onChange={(e) => setEmployeeAccessWindow(e.target.value as typeof employeeAccessWindow)}
                                             disabled={!employeeRequireApproval}
                                        >
                                             <option value="1h">1 hour</option>
                                             <option value="4h">4 hours</option>
                                             <option value="8h">8 hours</option>
                                             <option value="12h">12 hours</option>
                                             <option value="24h">24 hours</option>
                                             <option value="1d">1 day</option>
                                             <option value="1w">1 week</option>
                                             <option value="2w">2 weeks</option>
                                             <option value="1m">1 month</option>
                                        </Form.Select>
                                   </Form.Group>

                                   <Form.Group className="mb-3">
                                        <Form.Label>Edit Window</Form.Label>
                                        <Form.Select
                                             value={employeeEditWindow}
                                             onChange={(e) => setEmployeeEditWindow(e.target.value as typeof employeeEditWindow)}
                                             disabled={!employeeRequireApproval}
                                        >
                                             <option value="1h">1 hour</option>
                                             <option value="4h">4 hours</option>
                                             <option value="8h">8 hours</option>
                                             <option value="12h">12 hours</option>
                                             <option value="24h">24 hours</option>
                                             <option value="1d">1 day</option>
                                             <option value="1w">1 week</option>
                                             <option value="2w">2 weeks</option>
                                             <option value="1m">1 month</option>
                                        </Form.Select>
                                   </Form.Group>
                              </Form>
                         </Modal.Body>
                         <Modal.Footer>
                              <Button variant="secondary" onClick={() => setShowModal(false)}>
                                   Cancel
                              </Button>
                              <Button variant="primary" onClick={handleSaveIndividual} disabled={isSavingIndividual||employeeLoading||!employeeId||loadedEmployee.current!==Number(employeeId)}>
                                   {isSavingIndividual ? 'Saving...' : <><RiSaveLine size={14} className="me-1" />{editingId ? 'Update' : 'Save'} Individual Access</>}
                              </Button>
                         </Modal.Footer>
                    </Modal>

                    <Modal show={showGlobalModal} onHide={() => setShowGlobalModal(false)}>
                         <Modal.Header closeButton>
                              <Modal.Title className="h6">{editingGlobalId ? 'Edit' : 'Set'} Global Settings</Modal.Title>
                         </Modal.Header>
                         <Modal.Body>
                              <Form>
                                   <div className="mb-3">
                                        <Form.Check
                                             type="switch"
                                             id="require-approval-default"
                                             label="Require Approval"
                                             checked={defaultRequireApproval}
                                             onChange={(e) => setDefaultRequireApproval(e.target.checked)}
                                        />
                                   </div>

                                   <div className="mb-3">
                                        <Form.Label className="small fw-semibold">Default Access Window</Form.Label>
                                        <Form.Select value={defaultAccessWindow} onChange={(e) => setDefaultAccessWindow(e.target.value as typeof defaultAccessWindow)} disabled={!defaultRequireApproval}>
                                             <option value="1h">1 hour</option>
                                             <option value="4h">4 hours</option>
                                             <option value="8h">8 hours</option>
                                             <option value="12h">12 hours</option>
                                             <option value="24h">24 hours</option>
                                             <option value="1d">1 day</option>
                                             <option value="1w">1 week</option>
                                             <option value="2w">2 weeks</option>
                                             <option value="1m">1 month</option>
                                        </Form.Select>
                                   </div>

                                   <div className="mb-3">
                                        <Form.Label className="small fw-semibold">Default Edit Window</Form.Label>
                                        <Form.Select value={defaultEditWindow} onChange={(e) => setDefaultEditWindow(e.target.value as typeof defaultEditWindow)} disabled={!defaultRequireApproval}>
                                             <option value="1h">1 hour</option>
                                             <option value="4h">4 hours</option>
                                             <option value="8h">8 hours</option>
                                             <option value="12h">12 hours</option>
                                             <option value="24h">24 hours</option>
                                             <option value="1d">1 day</option>
                                             <option value="1w">1 week</option>
                                             <option value="2w">2 weeks</option>
                                             <option value="1m">1 month</option>
                                        </Form.Select>
                                   </div>
                              </Form>
                         </Modal.Body>
                         <Modal.Footer>
                              <Button variant="secondary" onClick={() => setShowGlobalModal(false)}>
                                   Cancel
                              </Button>
                              <Button variant="primary" onClick={handleSaveDefaults} disabled={isSavingDefaults}>
                                   {isSavingDefaults ? 'Saving...' : <><RiSaveLine size={14} className="me-1" />{editingGlobalId ? 'Update' : 'Save'} Global Settings</>}
                              </Button>
                         </Modal.Footer>
                    </Modal>
               </div>
          </>
     );
}
