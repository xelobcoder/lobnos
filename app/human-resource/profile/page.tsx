"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { customFetch, customPost, handleResponse, validateFormData } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { z } from 'zod';
// Zod schema for profile update (fields similar to registration, but only those editable)
const profileSchema = z.object({
     email: z.string().email('Invalid email address'),
     mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
     alternativeMobile: z.string().regex(/^\d{10}$/,'Alt mobile must be 10 digits').optional().or(z.literal('')),
     branch: z.string().min(1, 'Branch is required'),
     dob: z.string().optional(),
});
import { RiUser3Fill, RiMailFill, RiPhoneFill, RiBuilding2Fill, RiShieldUserFill, RiCake2Fill, RiCheckFill, RiCloseFill, RiKey2Fill, RiVerifiedBadgeFill } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';

interface UserProfile {
     employeeid: number;
     username: string;
     role: string;
     email: string;
     branch: string | number;
     emailAuthenticated: string;
     activation: number;
     mobile: string;
     alternativeMobile: string | null;
     dob: string | null;
     updated_on: string | null;
     date_created: string | null;
     pin: string | number;
}

export default function UserProfilePage() {
     const searchParams = useSearchParams();
     const employeeid = searchParams ? searchParams.get('employeeid') : null;
     const [user, setUser] = useState<UserProfile | null>(null);
     const [isLoading, setLoading] = useState(false);
     const [showPin, setShowPin] = useState(false);
     const [editMode, setEditMode] = useState(false);
     const [editData, setEditData] = useState<UserProfile | null>(null);
     const [saving, setSaving] = useState(false);
     // Modal state for password/PIN change
     // Password and PIN fields for unified form
     const [passwordFields, setPasswordFields] = useState({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          newPin: '',
          confirmPin: '',
     });

     const handlePasswordFieldsChange = (e: ChangeEvent<HTMLInputElement>) => {
          const { name, value } = e.target;
          setPasswordFields(prev => ({ ...prev, [name]: value }));
     };



     useEffect(() => {
          if (employeeid) {
               setLoading(true);
               customFetch(`logins/user?id=${employeeid}`)
                    .then((data: { statusCode: number; message: string; result: Array<any> }) => {
                         const { statusCode, message, result } = data;
                         if (statusCode === 200 && message === 'success' && result.length > 0) {
                              const u = result[0];
                              const userObj = {
                                   employeeid: u.employeeid,
                                   username: u.username || '',
                                   role: u.role || '',
                                   email: u.email || '',
                                   branch: u.branch ? String(u.branch) : '',
                                   emailAuthenticated: u.emailAuthenticated || '',
                                   activation: u.activation,
                                   mobile: u.mobile || '',
                                   alternativeMobile: u.alternativeMobile || '',
                                   dob: u.dob ? u.dob.substring(0, 10) : '',
                                   updated_on: u.updated_on ? u.updated_on.substring(0, 10) : '',
                                   date_created: u.date_created ? u.date_created.substring(0, 10) : '',
                                   pin: u.pin ? String(u.pin) : '',
                              };
                              setUser(userObj);
                              setEditData(userObj);
                         }
                         setLoading(false);
                    })
                    .catch(() => setLoading(false));
          }
     }, [employeeid]);

     const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
          if (!editData) return;
          const { name, value } = e.target;
          setEditData({ ...editData, [name]: value });
     };

     const handleEditSubmit = async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          if (!editData) return;
          // Validate with Zod
          try {
               profileSchema.parse({
                    email: editData.email,
                    mobile: editData.mobile,
                    alternativeMobile: editData.alternativeMobile || '',
                    branch: String(editData.branch),
                    dob: editData.dob || '',
               });
          } catch (error) {
               if (error instanceof z.ZodError) {
                    toast.error(error.errors[0].message);
               }
               return;
          }
          // Password and PIN validation
          if (passwordFields.newPassword) {
               if (passwordFields.newPassword.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    return;
               }
               if (passwordFields.newPassword !== passwordFields.confirmPassword) {
                    toast.error('Passwords do not match');
                    return;
               }
          }
          if (passwordFields.newPin) {
               if (!/^\d{4}$/.test(passwordFields.newPin)) {
                    toast.error('PIN must be 4 digits');
                    return;
               }
               if (passwordFields.newPin !== passwordFields.confirmPin) {
                    toast.error('PINs do not match');
                    return;
               }
          }
          setSaving(true);
          try {
               const data: any = {
                    employeeid: editData.employeeid,
                    email: editData.email,
                    mobile: editData.mobile,
                    alternativeMobile: editData.alternativeMobile,
                    dob: editData.dob,
                    branch: editData.branch,
                    username: editData.username,
               };
               if (passwordFields.newPassword) data.password = passwordFields.newPassword;
               if (passwordFields.newPin) data.pin = passwordFields.newPin;
               if (passwordFields.currentPassword) data.currentPassword = passwordFields.currentPassword;

               data['cpassword'] = passwordFields.currentPassword || '';
               
               validateFormData(
                    data,
                    false,
                    ["email", "mobile", "branch"],
                    'logins/update/user-updates?isUser=1',
                    (response) => {
                         handleResponse(response, toast);
                         if (response.status === "success") {
                              setUser(editData);
                              setEditMode(false);
                              setPasswordFields({ currentPassword: '', newPassword: '', confirmPassword: '', newPin: '', confirmPin: '' });
                         }
                    },
                    false
               );
          } catch (err) {
               toast.error('Failed to update profile');
          } finally {
               setSaving(false);
          }
     };

     if (isLoading) return <Loader w={100} h={100} />;
     if (!user) return <div className="container py-5">No user found.</div>;

     // Editable form
     if (editMode && editData) {
          return (
               <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
                    <div className="shadow border-0 bg-white rounded-4 p-0" style={{ maxWidth: 700, width: '100%' }}>
                         <div className="d-flex flex-column align-items-center p-4 pb-2 border-bottom" style={{ background: 'linear-gradient(90deg, #f8fafc 60%, #e9ecef 100%)' }}>
                              <RiUser3Fill size={90} className="text-secondary mb-2" />
                              <h3 className="fw-bold mb-0 text-dark">{editData.username}</h3>
                              <span className="text-muted mb-1">{editData.role}</span>
                              <span className="badge bg-light text-dark border mt-2" style={{ fontSize: 13 }}>{editData.activation === 1 ? <RiCheckFill className="text-success me-1" /> : <RiCloseFill className="text-danger me-1" />}{editData.activation === 1 ? 'Active' : 'Inactive'}</span>
                         </div>
                         <form className="p-4" onSubmit={handleEditSubmit}>
                              <div className="row g-3">
                                   {/* ...existing user info fields... */}
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="username">
                                             Username <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             name="username"
                                             id="username"
                                             value={editData.username}
                                             onChange={handleEditChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter username"
                                             required
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="email">
                                             Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="email"
                                             name="email"
                                             id="email"
                                             value={editData.email}
                                             onChange={handleEditChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter email address"
                                             required
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="mobile">
                                             Mobile Number <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="tel"
                                             name="mobile"
                                             id="mobile"
                                             value={editData.mobile}
                                             onChange={handleEditChange}
                                             className="form-control border-1 py-2"
                                             placeholder="10-digit mobile number"
                                             required
                                             minLength={10}
                                             maxLength={10}
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="alternativeMobile">
                                             Alternative Contact
                                        </label>
                                        <input
                                             type="tel"
                                             name="alternativeMobile"
                                             id="alternativeMobile"
                                             value={editData.alternativeMobile || ''}
                                             onChange={handleEditChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Alternative contact number"
                                             minLength={10}
                                             maxLength={10}
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="dob">
                                             Date of Birth <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="date"
                                             name="dob"
                                             id="dob"
                                             value={editData.dob || ''}
                                             onChange={handleEditChange}
                                             className="form-control border-1 py-2"
                                             required
                                             autoComplete="off"
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="currentPassword">
                                             Current Password
                                        </label>
                                        <input
                                             type="password"
                                             name="currentPassword"
                                             id="currentPassword"
                                             value={passwordFields.currentPassword}
                                             onChange={handlePasswordFieldsChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter current password"
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="newPassword">
                                             New Password
                                        </label>
                                        <input
                                             type="password"
                                             name="newPassword"
                                             id="newPassword"
                                             value={passwordFields.newPassword}
                                             onChange={handlePasswordFieldsChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter new password"
                                             minLength={6}
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="confirmPassword">
                                             Confirm New Password
                                        </label>
                                        <input
                                             type="password"
                                             name="confirmPassword"
                                             id="confirmPassword"
                                             value={passwordFields.confirmPassword}
                                             onChange={handlePasswordFieldsChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Confirm new password"
                                             minLength={6}
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="newPin">
                                             New PIN
                                        </label>
                                        <input
                                             type="password"
                                             name="newPin"
                                             id="newPin"
                                             value={passwordFields.newPin}
                                             onChange={handlePasswordFieldsChange}
                                             className="form-control border-1 py-2"
                                             placeholder="4-digit PIN"
                                             minLength={4}
                                             maxLength={4}
                                             autoComplete="off"
                                        />
                                   </div>
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="confirmPin">
                                             Confirm New PIN
                                        </label>
                                        <input
                                             type="password"
                                             name="confirmPin"
                                             id="confirmPin"
                                             value={passwordFields.confirmPin}
                                             onChange={handlePasswordFieldsChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Confirm new PIN"
                                             minLength={4}
                                             maxLength={4}
                                             autoComplete="off"
                                        />
                                   </div>
                              </div>
                              <div className="d-flex justify-content-end gap-2 mt-4">
                                   <button type="button" className="btn btn-secondary btn-sm px-4" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
                                   <button type="submit" className="btn btn-primary btn-sm px-4" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                              </div>
                         </form>
                    </div>
               </div>
          );
     }
     // Read-only profile view
     return (
          <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
               <div className="shadow border-0 bg-white rounded-4 p-0" style={{ maxWidth: 500, width: '100%' }}>
                    <div className="d-flex flex-column align-items-center p-4 pb-2 border-bottom" style={{ background: 'linear-gradient(90deg, #f8fafc 60%, #e9ecef 100%)' }}>
                         <RiUser3Fill size={90} className="text-secondary mb-2" />
                         <h3 className="fw-bold mb-0 text-dark">{user.username}</h3>
                         <span className="text-muted mb-1">{user.role}</span>
                         <span className="badge bg-light text-dark border mt-2" style={{ fontSize: 13 }}>{user.activation === 1 ? <RiCheckFill className="text-success me-1" /> : <RiCloseFill className="text-danger me-1" />}{user.activation === 1 ? 'Active' : 'Inactive'}</span>
                         <div className="d-flex gap-2 mt-3">
                              <button className="btn btn-outline-primary btn-sm" onClick={() => setEditMode(true)}>
                                   Edit Profile
                              </button>
                         </div>
                    </div>
                    <div className="p-4">
                         <ul className="list-unstyled mb-0">
                              <li className="mb-3 d-flex align-items-center">
                                   <RiMailFill className="me-2 text-primary" />
                                   <span className="fw-medium">{user.email}</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiPhoneFill className="me-2 text-success" />
                                   <span className="fw-medium">{user.mobile}</span>
                                   {user.alternativeMobile && <span className="ms-2 text-muted">/ {user.alternativeMobile}</span>}
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiBuilding2Fill className="me-2 text-info" />
                                   <span className="fw-medium">Branch: {user.branch}</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiShieldUserFill className="me-2 text-warning" />
                                   <span className="fw-medium">Employee ID: {user.employeeid}</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiCake2Fill className="me-2 text-danger" />
                                   <span className="fw-medium">DOB: {user.dob || '-'}</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiKey2Fill className="me-2 text-secondary" />
                                   <span className="fw-medium">PIN: </span>
                                   <span style={{ letterSpacing: 4, marginLeft: 8 }}>
                                        {showPin ? user.pin : '••••'}
                                   </span>
                                   <button
                                        type="button"
                                        className="btn btn-link btn-sm ms-2 p-0 align-baseline"
                                        style={{ fontSize: 14, textDecoration: 'none' }}
                                        onClick={() => setShowPin(v => !v)}
                                        aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                                   >
                                        {showPin ? 'Hide' : 'Show'}
                                   </button>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <RiVerifiedBadgeFill className="me-2 text-secondary" />
                                   <span className="fw-medium">Email Authenticated: {user.emailAuthenticated === 'true' ? 'Yes' : 'No'}</span>
                              </li>
                              <li className="mb-3 d-flex align-items-center">
                                   <span className="me-2 text-secondary">🗓️</span>
                                   <span className="fw-medium">Created: {user.date_created || '-'}</span>
                                   {user.updated_on && <span className="ms-3 text-muted">Updated: {user.updated_on}</span>}
                              </li>
                         </ul>
                    </div>
               </div>
          </div>
     );
}
