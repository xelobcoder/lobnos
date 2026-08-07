"use client";
import { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { customFetch, handleResponse, validateFormData } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import { toast } from 'react-toastify';
import { z } from 'zod';
// Zod schema for profile update (fields similar to registration, but only those editable)
const profileSchema = z.object({
     email: z.string().email('Invalid email address'),
     mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
     alternativeMobile: z.string().regex(/^\d{10}$/, 'Alt mobile must be 10 digits').optional().or(z.literal('')),
     branch: z.string().min(1, 'Branch is required'),
     dob: z.string().optional(),
});
import { RiUser3Fill, RiMailFill, RiPhoneFill, RiBuilding2Fill, RiShieldUserFill, RiCake2Fill, RiCheckFill, RiCloseFill, RiKey2Fill, RiVerifiedBadgeFill, RiEdit2Fill, RiCalendarEventFill } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';

export const dynamic = 'force-dynamic';

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

type DetailItemProps = {
     icon: React.ReactNode;
     label: string;
     value: React.ReactNode;
     tone?: string;
};

type SectionCardProps = {
     title: string;
     subtitle?: string;
     children: React.ReactNode;
};

function SectionCard({ title, subtitle, children }: SectionCardProps) {
     return (
          <div className="border rounded-4 h-100 overflow-hidden bg-white shadow-sm">
               <div className="p-4 border-bottom" style={{ background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)' }}>
                    <h2 className="fs-5 fw-bold text-dark mb-1">{title}</h2>
                    {subtitle ? <p className="text-muted mb-0 small">{subtitle}</p> : null}
               </div>
               <div className="p-4">{children}</div>
          </div>
     );
}

function DetailItem({ icon, label, value, tone = 'text-dark' }: DetailItemProps) {
     return (
          <div className="d-flex align-items-start gap-3 py-3 border-bottom">
               <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 44, height: 44, backgroundColor: '#fff3e6' }}
               >
                    {icon}
               </div>
               <div className="min-w-0">
                    <div className="text-uppercase text-muted small fw-semibold mb-1">{label}</div>
                    <div className={`fw-semibold ${tone}`}>{value}</div>
               </div>
          </div>
     );
}

function ProfileStat({ label, value }: { label: string; value: React.ReactNode }) {
     return (
          <div className="border rounded-4 p-3 bg-white h-100">
               <div className="text-uppercase text-muted small fw-semibold mb-2">{label}</div>
               <div className="fw-bold text-dark">{value}</div>
          </div>
     );
}

export default function UserProfilePage() {
     const searchParams = useSearchParams();
     const employeeid = searchParams?.get('employeeid')
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

     const getStatusBadge = (activation: number) => (
          <span className={`badge rounded-pill px-3 py-2 ${activation === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
               {activation === 1 ? 'Active account' : 'Inactive account'}
          </span>
     );

     const profileCompletion = [
          user?.email,
          user?.mobile,
          user?.branch,
          user?.dob,
          user?.alternativeMobile,
     ].filter(Boolean).length;

     const completionPercent = Math.round((profileCompletion / 5) * 100);

     if (isLoading) return <Loader w={100} h={100} />;
     if (!user) {
          return (
               <div className="container-fluid px-4 py-5">
                    <div className="border rounded-4 bg-white shadow-sm mx-auto p-5 text-center" style={{ maxWidth: 640 }}>
                         <RiUser3Fill size={56} className="mb-3" style={{ color: '#d97706' }} />
                         <h1 className="fs-3 fw-bold text-dark mb-2">Profile not available</h1>
                         <p className="text-muted mb-0">The requested staff profile could not be loaded for this employee record.</p>
                    </div>
               </div>
          );
     }

     // Editable form
     if (editMode && editData) {
          return (
               <div className="container-fluid px-4 py-4">
                    <div className="row g-4 align-items-start">
                         <div className="col-12">
                              <div className="border rounded-4 overflow-hidden shadow-sm bg-white">
                                   <div
                                        className="p-4 p-lg-5"
                                        style={{ background: 'linear-gradient(135deg, #1f2937 0%, #374151 42%, #f59e0b 160%)' }}
                                   >
                                        <div className="row g-4 align-items-center text-white">
                                             <div className="col-lg-8">
                                                  <div className="d-flex align-items-center gap-3 mb-3">
                                                       <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: 88, height: 88, backgroundColor: 'rgba(255,255,255,0.14)' }}>
                                                            <RiUser3Fill size={42} />
                                                       </div>
                                                       <div>
                                                            <div className="text-uppercase small fw-semibold" style={{ letterSpacing: '0.08em', opacity: 0.8 }}>HR Profile Editor</div>
                                                            <h1 className="display-6 fw-bold mb-1">{editData.username}</h1>
                                                            <div className="d-flex flex-wrap gap-2 align-items-center">
                                                                 <span className="badge rounded-pill text-bg-light text-dark px-3 py-2">{editData.role}</span>
                                                                 {getStatusBadge(editData.activation)}
                                                            </div>
                                                       </div>
                                                  </div>
                                                  <p className="mb-0" style={{ maxWidth: 760, color: 'rgba(255,255,255,0.8)' }}>
                                                       Update contact information and optional security credentials from a single workspace. Leave password and PIN fields blank when no credential change is needed.
                                                  </p>
                                             </div>
                                             <div className="col-lg-4">
                                                  <div className="row g-3">
                                                       <div className="col-6">
                                                            <ProfileStat label="Employee ID" value={editData.employeeid} />
                                                       </div>
                                                       <div className="col-6">
                                                            <ProfileStat label="Branch" value={editData.branch || '-'} />
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className="col-xl-8">
                              <form className="border rounded-4 bg-white shadow-sm overflow-hidden" onSubmit={handleEditSubmit}>
                                   <div className="p-4 border-bottom" style={{ background: 'linear-gradient(180deg, #fffaf0 0%, #ffffff 100%)' }}>
                                        <h2 className="fs-4 fw-bold text-dark mb-1">Edit Profile</h2>
                                        <p className="text-muted mb-0">Keep personal details current and submit credential changes only when required.</p>
                                   </div>

                                   <div className="p-4 p-lg-5">
                                        <div className="row g-4">
                                             <div className="col-12">
                                                  <h3 className="fs-5 fw-bold text-dark mb-3">Personal Information</h3>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="username">Username</label>
                                                  <input type="text" name="username" id="username" value={editData.username} onChange={handleEditChange} className="form-control form-control-lg" placeholder="Enter username" required />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="email">Email Address</label>
                                                  <input type="email" name="email" id="email" value={editData.email} onChange={handleEditChange} className="form-control form-control-lg" placeholder="Enter email address" required autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="mobile">Mobile Number</label>
                                                  <input type="tel" name="mobile" id="mobile" value={editData.mobile} onChange={handleEditChange} className="form-control form-control-lg" placeholder="10-digit mobile number" required minLength={10} maxLength={10} autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="alternativeMobile">Alternative Contact</label>
                                                  <input type="tel" name="alternativeMobile" id="alternativeMobile" value={editData.alternativeMobile || ''} onChange={handleEditChange} className="form-control form-control-lg" placeholder="Alternative contact number" minLength={10} maxLength={10} autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="dob">Date of Birth</label>
                                                  <input type="date" name="dob" id="dob" value={editData.dob || ''} onChange={handleEditChange} className="form-control form-control-lg" required autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="branch">Branch</label>
                                                  <input type="text" name="branch" id="branch" value={String(editData.branch || '')} onChange={handleEditChange} className="form-control form-control-lg" placeholder="Assigned branch" required autoComplete="off" />
                                             </div>

                                             <div className="col-12 pt-2">
                                                  <div className="border-top pt-4">
                                                       <h3 className="fs-5 fw-bold text-dark mb-2">Security Updates</h3>
                                                       <p className="text-muted mb-0">These fields are optional. Provide the current password when changing a password or PIN.</p>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="currentPassword">Current Password</label>
                                                  <input type="password" name="currentPassword" id="currentPassword" value={passwordFields.currentPassword} onChange={handlePasswordFieldsChange} className="form-control form-control-lg" placeholder="Enter current password" autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="newPassword">New Password</label>
                                                  <input type="password" name="newPassword" id="newPassword" value={passwordFields.newPassword} onChange={handlePasswordFieldsChange} className="form-control form-control-lg" placeholder="Enter new password" minLength={6} autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="confirmPassword">Confirm New Password</label>
                                                  <input type="password" name="confirmPassword" id="confirmPassword" value={passwordFields.confirmPassword} onChange={handlePasswordFieldsChange} className="form-control form-control-lg" placeholder="Confirm new password" minLength={6} autoComplete="off" />
                                             </div>
                                             <div className="col-md-6"></div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="newPin">New PIN</label>
                                                  <input type="password" name="newPin" id="newPin" value={passwordFields.newPin} onChange={handlePasswordFieldsChange} className="form-control form-control-lg" placeholder="4-digit PIN" minLength={4} maxLength={4} autoComplete="off" />
                                             </div>
                                             <div className="col-md-6">
                                                  <label className="form-label text-dark fw-semibold" htmlFor="confirmPin">Confirm New PIN</label>
                                                  <input type="password" name="confirmPin" id="confirmPin" value={passwordFields.confirmPin} onChange={handlePasswordFieldsChange} className="form-control form-control-lg" placeholder="Confirm new PIN" minLength={4} maxLength={4} autoComplete="off" />
                                             </div>
                                        </div>
                                   </div>

                                   <div className="p-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 bg-body-tertiary">
                                        <div className="text-muted small">Changes are applied to the staff login profile record.</div>
                                        <div className="d-flex gap-2">
                                             <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditMode(false)} disabled={saving}>Cancel</button>
                                             <button type="submit" className="btn btn-warning px-4 fw-semibold" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
                                        </div>
                                   </div>
                              </form>
                         </div>

                         <div className="col-xl-4">
                              <div className="d-grid gap-4">
                                   <SectionCard title="Editing Notes" subtitle="Use this panel as a quick checklist before you submit.">
                                        <ul className="list-unstyled mb-0">
                                             <li className="d-flex gap-2 mb-3"><RiCheckFill className="text-success mt-1 flex-shrink-0" /> <span className="text-muted">Mobile numbers should be exactly 10 digits.</span></li>
                                             <li className="d-flex gap-2 mb-3"><RiCheckFill className="text-success mt-1 flex-shrink-0" /> <span className="text-muted">Password changes require at least 6 characters.</span></li>
                                             <li className="d-flex gap-2"><RiCheckFill className="text-success mt-1 flex-shrink-0" /> <span className="text-muted">PIN updates must be 4 digits and match confirmation.</span></li>
                                        </ul>
                                   </SectionCard>

                                   <SectionCard title="Current Snapshot" subtitle="Useful reference while editing.">
                                        <div className="row g-3">
                                             <div className="col-6"><ProfileStat label="Role" value={editData.role || '-'} /></div>
                                             <div className="col-6"><ProfileStat label="Email Verified" value={editData.emailAuthenticated === 'true' ? 'Yes' : 'No'} /></div>
                                             <div className="col-6"><ProfileStat label="Created" value={editData.date_created || '-'} /></div>
                                             <div className="col-6"><ProfileStat label="Updated" value={editData.updated_on || '-'} /></div>
                                        </div>
                                   </SectionCard>
                              </div>
                         </div>
                    </div>
               </div>
          );
     }
     // Read-only profile view
     return (
          <div className="container-fluid px-4 py-4">
               <div className="row g-4 align-items-start">
                    <div className="col-lg-5 col-xl-4">
                         <div className="border rounded-4 overflow-hidden shadow-sm bg-white position-sticky" style={{ top: 24 }}>
                              <div className="p-4 p-lg-5 text-white" style={{ background: 'linear-gradient(160deg, #111827 0%, #374151 45%, #f59e0b 150%)' }}>
                                   <div className="rounded-circle d-flex align-items-center justify-content-center mb-4" style={{ width: 96, height: 96, backgroundColor: 'rgba(255,255,255,0.14)' }}>
                                        <RiUser3Fill size={44} />
                                   </div>
                                   <div className="text-uppercase small fw-semibold mb-2" style={{ letterSpacing: '0.08em', opacity: 0.8 }}>Human Resource Profile</div>
                                   <h1 className="display-6 fw-bold mb-2">{user.username}</h1>
                                   <p className="mb-3" style={{ color: 'rgba(255,255,255,0.78)' }}>{user.role}</p>
                                   <div className="d-flex flex-wrap gap-2 mb-4">
                                        {getStatusBadge(user.activation)}
                                        <span className="badge rounded-pill text-bg-light text-dark px-3 py-2">Employee #{user.employeeid}</span>
                                   </div>
                                   <button className="btn btn-warning fw-semibold px-4" onClick={() => setEditMode(true)}>
                                        <RiEdit2Fill size={18} className="me-2" />
                                        Edit Profile
                                   </button>
                              </div>
                              <div className="p-4">
                                   <div className="row g-3">
                                        <div className="col-6"><ProfileStat label="Profile completeness" value={`${completionPercent}%`} /></div>
                                        <div className="col-6"><ProfileStat label="Email verified" value={user.emailAuthenticated === 'true' ? 'Yes' : 'No'} /></div>
                                   </div>
                              </div>
                         </div>
                    </div>

                    <div className="col-lg-7 col-xl-8">
                         <div className="row g-4">
                              <div className="col-12">
                                   <SectionCard title="Contact Details" subtitle="Primary communication and reachability information.">
                                        <DetailItem icon={<RiMailFill size={20} style={{ color: '#d97706' }} />} label="Email address" value={user.email || '-'} />
                                        <DetailItem icon={<RiPhoneFill size={20} style={{ color: '#d97706' }} />} label="Phone numbers" value={<span>{user.mobile || '-'}{user.alternativeMobile ? <span className="text-muted fw-normal"> / {user.alternativeMobile}</span> : null}</span>} />
                                        <DetailItem icon={<RiBuilding2Fill size={20} style={{ color: '#d97706' }} />} label="Assigned branch" value={user.branch || '-'} />
                                   </SectionCard>
                              </div>

                              <div className="col-md-6">
                                   <SectionCard title="Employment Overview" subtitle="Core staff identity on the account.">
                                        <DetailItem icon={<RiShieldUserFill size={20} style={{ color: '#d97706' }} />} label="Employee ID" value={user.employeeid} />
                                        <DetailItem icon={<RiUser3Fill size={20} style={{ color: '#d97706' }} />} label="Role" value={user.role || '-'} />
                                        <DetailItem icon={<RiCake2Fill size={20} style={{ color: '#d97706' }} />} label="Date of birth" value={user.dob || '-'} />
                                   </SectionCard>
                              </div>

                              <div className="col-md-6">
                                   <SectionCard title="Security Snapshot" subtitle="Credential status and authentication details.">
                                        <DetailItem
                                             icon={<RiKey2Fill size={20} style={{ color: '#d97706' }} />}
                                             label="PIN"
                                             value={
                                                  <span>
                                                       <span style={{ letterSpacing: 4 }}>{showPin ? user.pin : '••••'}</span>
                                                       <button
                                                            type="button"
                                                            className="btn btn-link btn-sm p-0 ms-2 fw-semibold"
                                                            style={{ textDecoration: 'none', color: '#b45309' }}
                                                            onClick={() => setShowPin(v => !v)}
                                                            aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                                                       >
                                                            {showPin ? 'Hide' : 'Show'}
                                                       </button>
                                                  </span>
                                             }
                                        />
                                        <DetailItem icon={<RiVerifiedBadgeFill size={20} style={{ color: '#d97706' }} />} label="Email authenticated" value={user.emailAuthenticated === 'true' ? 'Yes' : 'No'} />
                                        <DetailItem icon={<RiCheckFill size={20} style={{ color: '#d97706' }} />} label="Account status" value={user.activation === 1 ? 'Enabled' : 'Disabled'} />
                                   </SectionCard>
                              </div>

                              <div className="col-12">
                                   <SectionCard title="Activity Timeline" subtitle="Quick audit reference for this login record.">
                                        <div className="row g-3">
                                             <div className="col-md-6">
                                                  <div className="border rounded-4 p-4 h-100 bg-body-tertiary">
                                                       <div className="d-flex align-items-center gap-3 mb-2">
                                                            <RiCalendarEventFill size={22} style={{ color: '#d97706' }} />
                                                            <div className="text-uppercase text-muted small fw-semibold">Profile created</div>
                                                       </div>
                                                       <div className="fw-bold text-dark">{user.date_created || '-'}</div>
                                                  </div>
                                             </div>
                                             <div className="col-md-6">
                                                  <div className="border rounded-4 p-4 h-100 bg-body-tertiary">
                                                       <div className="d-flex align-items-center gap-3 mb-2">
                                                            <RiCalendarEventFill size={22} style={{ color: '#d97706' }} />
                                                            <div className="text-uppercase text-muted small fw-semibold">Last updated</div>
                                                       </div>
                                                       <div className="fw-bold text-dark">{user.updated_on || 'No updates recorded'}</div>
                                                  </div>
                                             </div>
                                        </div>
                                   </SectionCard>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
