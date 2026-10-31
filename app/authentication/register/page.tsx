"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import {
     customFetch,
     customPost,
     getBranches,
     handleResponse,
     validateFormData,
} from "../../../components/Auth/customFetch";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { roleAllowed } from "../../../components/Auth/roles";
import Loader from "../../../components/accessories/Loader";
import { loadAllSectionPayloads, clearSectionDrafts, hydrateSectionDraftsFromUser, SECTION_CONFIGS } from "./sectionDraft";
import { designation as designationOptions } from "../../../components/registration/fields/Util";


const baseSchema = z.object({
     designation: z.string().min(1, "Designation is required"),
     firstname: z.string().min(1, "Firstname is required"),
     middlename: z.string().optional(),
     lastname: z.string().min(1, "Lastname is required"),
     name: z.string().min(1, "Name is required"),
     email: z.string().email("Invalid email address"),
     mobile: z.string().regex(/^\d{10}$/, "Mobile number must be 10 digits"),
     password: z.string().min(6, "Password must be at least 6 characters"),
     cpassword: z.string(),
     role: z.string().min(1, "Role is required"),
     pin: z.string().regex(/^\d{4}$/, "PIN must be 4 digits"),
});

const schema = baseSchema
     .refine((data) => data.password === data.cpassword, {
          message: "Passwords do not match",
          path: ["cpassword"],
     });

interface RegisterData {
     designation: string;
     firstname: string;
     middlename: string;
     lastname: string;
     name: string;
     email: string;
     password: string;
     cpassword: string;
     role: string;
     branch: string;
     mobile: string;
     altMobile: string;
     address: string;
     dob: string;
     startDate: string;
     accessLevel: string;
     department: string;
     employeeId: string;
     pin: string;
}

const defaultData: RegisterData = {
     designation: "",
     firstname: "",
     middlename: "",
     lastname: "",
     name: "",
     email: "",
     password: "",
     cpassword: "",
     role: "",
     branch: "",
     mobile: "",
     altMobile: "",
     address: "",
     dob: "",
     startDate: "",
     accessLevel: "",
     department: "",
     employeeId: "",
     pin: "",
};

interface Branch {
     branchid: string;
     name: string;
}

export default function AuthenticationIndexPage() {
     const searchParams = useSearchParams();
     const employeeid = searchParams ? searchParams.get("employeeid") : null;
     const sectionScope = employeeid || "new";

     const [register, setRegister] = useState<RegisterData>(defaultData);
     const [isLoading, setLoading] = useState<boolean>(false);
     const [branches, setBranches] = useState<Branch[]>([]);
     const currentUser = useApplication()?.user;
     const currentUserEmployeeid = currentUser?.employeeid;
     const canResetPassword = roleAllowed(currentUser?.role, ['admin', 'manager']);
     const [temporaryPassword, setTemporaryPassword] = useState<string>("");

     const numericOnlyFields = new Set(["mobile", "altMobile", "pin"]);

     const sanitizeNumericValue = (name: string, rawValue: string) => {
          const digitsOnly = rawValue.replace(/\D/g, "");

          if (name === "pin") {
               return digitsOnly.slice(0, 4);
          }

          if (name === "mobile" || name === "altMobile") {
               return digitsOnly.slice(0, 10);
          }

          return digitsOnly;
     };

     const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
          const { name, value } = e.target;

          if (numericOnlyFields.has(name)) {
               setRegister((prev) => ({ ...prev, [name]: sanitizeNumericValue(name, value) }));
               return;
          }

          setRegister((prev) => ({ ...prev, [name]: value }));
     };

     const buildFullName = () =>
          [register.designation, register.firstname, register.middlename, register.lastname]
               .filter(Boolean)
               .join(" ")
               .trim();

     const validateForm = (): boolean => {
          try {
               if (employeeid) {
                    baseSchema.omit({ password: true, cpassword: true }).parse({ ...register, name: buildFullName() });
                    if ((register.password || register.cpassword) && register.password !== register.cpassword) {
                         toast.error("Passwords do not match");
                         return false;
                    }
                    if ((register.password || register.cpassword) && register.password.length < 6) {
                         toast.error("Password must be at least 6 characters");
                         return false;
                    }
               } else {
                    schema.parse({ ...register, name: buildFullName() });
               }
               return true;
          } catch (error) {
               if (error instanceof z.ZodError) {
                    toast.error(error.errors[0].message);
               }
               return false;
          }
     };

     const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
          e.preventDefault();

          const sanitizedMobile = sanitizeNumericValue("mobile", register.mobile);
          const sanitizedAltMobile = sanitizeNumericValue("altMobile", register.altMobile);
          const sanitizedPin = sanitizeNumericValue("pin", register.pin);

          if (sanitizedMobile.length !== 10) {
               toast.error("Mobile number must be exactly 10 digits.");
               return;
          }

          if (sanitizedAltMobile && sanitizedAltMobile.length !== 10) {
               toast.error("Alternative contact must be exactly 10 digits.");
               return;
          }

          if (sanitizedPin.length !== 4) {
               toast.error("PIN must be exactly 4 digits.");
               return;
          }

          if (
               sanitizedMobile !== register.mobile ||
               sanitizedAltMobile !== register.altMobile ||
               sanitizedPin !== register.pin
          ) {
               setRegister((prev) => ({
                    ...prev,
                    mobile: sanitizedMobile,
                    altMobile: sanitizedAltMobile,
                    pin: sanitizedPin,
               }));
          }

          if (!validateForm()) {
               return;
          }

          setLoading(true);
          try {
               const fullName = buildFullName();
               const sectionPayloads = loadAllSectionPayloads(sectionScope);

               const data = {
                    name: fullName,
                    designation: register.designation,
                    firstname: register.firstname,
                    middlename: register.middlename,
                    lastname: register.lastname,
                    email: register.email,
                    mobile: register.mobile,
                    password: register.password,
                    cpassword: register.cpassword,
                    role: register.role,
                    branch: register.branch,
                    pin: register.pin,
                    altMobile: register.altMobile,
                    dob: register.dob,
                    startDate: register.startDate,
                    accessLevel: register.accessLevel,
                    department: register.department,
                    employeeId: register.employeeId,
                    address: register.address,
                    contacts: sectionPayloads.contacts,
                    documents: sectionPayloads.documents,
                    employmentHistory: sectionPayloads.employmentHistory,
                    certifications: sectionPayloads.certifications,
                    education: sectionPayloads.education,
                    licenses: sectionPayloads.licenses,
                    bankAccounts: sectionPayloads.bankAccounts,
                    attendance: sectionPayloads.attendance,
                    employeeid: employeeid || undefined,
               };

               if (employeeid && !register.password) {
                    delete (data as Partial<typeof data>).password;
                    delete (data as Partial<typeof data>).cpassword;
               }

               validateFormData(
                    data,
                    false,
                    employeeid ? [
                         "designation",
                         "firstname",
                         "lastname",
                         "name",
                         "email",
                         "role",
                         "mobile",
                         "pin",
                    ] : [
                         "designation",
                         "firstname",
                         "lastname",
                         "name",
                         "email",
                         "password",
                         "cpassword",
                         "role",
                         "mobile",
                         "pin",
                    ],
                    employeeid ? "logins/update?employeeid=" + currentUserEmployeeid : "logins",
                    (response) => {
                         handleResponse(response, toast);
                         if (response.status === "success" && !employeeid) {
                              setRegister(defaultData);
                              clearSectionDrafts(sectionScope);
                         }
                    },
                    false
               );
          } catch (error) {
               console.error("Error submitting form", error);
               toast.error("Failed to submit form. Please try again.");
          } finally {
               setLoading(false);
          }
     };

     const handleResetPassword = async () => {
          if (!employeeid || !currentUserEmployeeid) {
               toast.error("Employee and current user are required");
               return;
          }

          if (!canResetPassword) {
               toast.error("Only admin or manager can reset staff passwords");
               return;
          }

          const confirmed = window.confirm("Reset this employee password and show a temporary password?");
          if (!confirmed) return;

          setLoading(true);
          try {
               const response = await customPost("logins/reset-password", "POST", {
                    employeeid,
               });

               if (response?.status === "success" && response.temporaryPassword) {
                    setTemporaryPassword(response.temporaryPassword);
                    toast.success("Password reset successfully");
               } else {
                    toast.error(response?.message || "Failed to reset password");
               }
          } catch (error) {
               console.error(error);
               toast.error("Failed to reset password");
          } finally {
               setLoading(false);
          }
     };

     useEffect(() => {
          if (!employeeid) {
               return;
          }

          setLoading(true);
          customFetch(`logins/user?id=${employeeid}`)
               .then((data: { statusCode: number; message: string; result: Array<any> }) => {
                    const { statusCode, message, result } = data;
                    if (statusCode === 200 && message === "success" && result.length > 0) {
                         const user = result[0];
                         const fallbackParts = String(user.name || user.username || "")
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean);
                         const firstname = user.firstname || (fallbackParts.length > 1 ? fallbackParts[1] : "") || "";
                         const middlename =
                              user.middlename ||
                              (fallbackParts.length > 3 ? fallbackParts.slice(2, -1).join(" ") : "") ||
                              "";
                         const lastname =
                              user.lastname || (fallbackParts.length > 0 ? fallbackParts[fallbackParts.length - 1] : "") || "";

                         setRegister((prev) => ({
                              ...prev,
                              name: user.name || user.username || "",
                              designation: user.designation || "",
                              firstname,
                              middlename,
                              lastname,
                              email: user.email || "",
                              role: user.role || "",
                              branch: user.branch ? String(user.branch) : "",
                              mobile: user.mobile || "",
                              altMobile: user.alternativeMobile || "",
                              dob: user.dob ? user.dob.substring(0, 10) : "",
                              startDate: user.date_created ? user.date_created.substring(0, 10) : "",
                              pin: user.pin ? String(user.pin) : "",
                         }));

                         hydrateSectionDraftsFromUser(user, sectionScope);
                    }
                    setLoading(false);
               })
               .catch(() => setLoading(false));
     }, [employeeid, sectionScope]);

     useEffect(() => {
          getBranches(setBranches, undefined, undefined);
     }, []);

     if (isLoading) {
          return <Loader w={100} h={100} />;
     }

     const sectionQuery = employeeid ? `?employeeid=${employeeid}` : "";

     return (
          <div className="min-vh-100 bg-light">
               <div className="card border-0">
                    <div className="card-header bg-white border-bottom py-4">
                         <h4 className="mb-0 text-dark fw-semibold">
                              {employeeid ? "Update Employee Information" : "New Employee Registration"}
                         </h4>
                         <p className="text-muted mb-0 mt-2">
                              {employeeid
                                   ? "Modify core employee details and manage section pages below."
                                   : "Fill in core details, then open each section page to complete profile data."}
                         </p>
                    </div>

                    <div className="card-body p-4">
                         {employeeid ? (
                              <div className="border rounded-3 p-3 bg-white mb-4">
                                   <div className="d-flex justify-content-between align-items-center mb-3">
                                        <h5 className="mb-0 text-dark fw-semibold">Employee Sections</h5>
                                   </div>
                                   <div className="row g-2">
                                        {Object.entries(SECTION_CONFIGS).map(([key, config]) => (
                                             <div className="col-md-3 col-sm-6" key={key}>
                                                  <Link
                                                       href={`/authentication/register/sections/${key}${sectionQuery}`}
                                                       className="btn btn-outline-primary w-100 text-start"
                                                  >
                                                       {config.title}
                                                  </Link>
                                             </div>
                                        ))}
                                   </div>
                              </div>
                         ) : (
                              <div className="alert alert-info mb-4">
                                   Employee sections become available after the employee account is saved.
                              </div>
                         )}

                         <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                              <div className="row g-3 mb-4">
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="designation">
                                             Designation <span className="text-danger">*</span>
                                        </label>
                                        <select
                                             name="designation"
                                             id="designation"
                                             value={register.designation}
                                             onChange={handleChange}
                                             className="form-select border-1 py-2"
                                             required
                                        >
                                             <option value="">Select designation</option>
                                             {designationOptions.map((item) => (
                                                  <option value={item} key={item}>{item}</option>
                                             ))}
                                        </select>
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="firstname">
                                             Firstname <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             name="firstname"
                                             id="firstname"
                                             value={register.firstname}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter firstname"
                                             required
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="middlename">
                                             Middlename
                                        </label>
                                        <input
                                             type="text"
                                             name="middlename"
                                             id="middlename"
                                             value={register.middlename}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter middlename"
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="lastname">
                                             Lastname <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             name="lastname"
                                             id="lastname"
                                             value={register.lastname}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Enter lastname"
                                             required
                                        />
                                   </div>

                                   <div className="col-12">
                                        <label className="form-label text-dark fw-medium" htmlFor="fullname">
                                             Full Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="text"
                                             id="fullname"
                                             value={buildFullName()}
                                             className="form-control border-1 py-2"
                                             placeholder="Auto-generated full name"
                                             readOnly
                                        />
                                        <small className="text-muted">
                                             Generated from designation + firstname + middlename + lastname.
                                        </small>
                                   </div>
                              </div>

                              <div className="row g-3">
                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="email">
                                             Email Address <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="email"
                                             name="email"
                                             id="email"
                                             value={register.email}
                                             onChange={handleChange}
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
                                             value={register.mobile}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="10-digit mobile number"
                                             required
                                             inputMode="numeric"
                                             pattern="[0-9]{10}"
                                             title="Enter exactly 10 digits"
                                             minLength={10}
                                             maxLength={10}
                                             autoComplete="off"
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="altMobile">
                                             Alternative Contact
                                        </label>
                                        <input
                                             type="tel"
                                             name="altMobile"
                                             id="altMobile"
                                             value={register.altMobile}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="Alternative contact number"
                                             inputMode="numeric"
                                             pattern="[0-9]{10}"
                                             title="Enter exactly 10 digits"
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
                                             value={register.dob}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             required
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="role">
                                             Role <span className="text-danger">*</span>
                                        </label>
                                        <select
                                             className="form-select border-1 py-2"
                                             onChange={handleChange}
                                             value={register.role}
                                             name="role"
                                             id="role"
                                             required
                                        >
                                             <option value="">Select Role</option>
                                             <option value="admin">Admin</option>
                                             <option value="cashier">Cashier</option>
                                             <option value="marketer">Marketer</option>
                                             <option value="scientist">Scientist</option>
                                             <option value="customer service representative">Customer Service Representative</option>
                                             <option value="manager">Manager</option>
                                             <option value="accountant">Accountant</option>
                                             <option value="doctor">Doctor / Facility Practitioner</option><option value="medical_officer">Medical Officer</option><option value="consultant">Consultant</option><option value="nurse">Nurse / Triage</option><option value="pharmacy_doctor">Pharmacy Doctor</option><option value="pharmacy_nurse">Pharmacy Nurse</option>
                                             <option value="phlebotomist">Phlebotomist</option>
                                             <option value="sonographer">Sonographer</option><option value="head_of_laboratory">Head of Laboratory</option><option value="head_of_imaging">Head of Imaging</option>
                                             <option value="storekeeper">Storekeeper</option>
                                             <option value="pharmacy_manager">Pharmacy Manager</option>
                                             <option value="pharmacy_cashier">Pharmacy Cashier</option>
                                             <option value="pharmacy_storekeeper">Pharmacy Storekeeper</option>
                                             <option value="pharmacy_dispensary_officer">Pharmacy Dispensary Officer</option>
                                             <option value="pharmacy_accountant">Pharmacy Accountant</option>
                                        </select>
                                   </div>

                                   <div className="col-12">
                                        <label className="form-label text-dark fw-medium">Assign to Branch</label>
                                        <select
                                             value={register.branch}
                                             name="branch"
                                             onChange={handleChange}
                                             className="form-select border-1 py-2"
                                        >
                                             <option value="">Select branch assignment</option>
                                             {branches.map((item, index) => (
                                                  <option value={item.branchid} key={index}>
                                                       {item.name}
                                                  </option>
                                             ))}
                                        </select>
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="password">
                                             Password {!employeeid && <span className="text-danger">*</span>}
                                        </label>
                                        <input
                                             type="password"
                                             name="password"
                                             id="password"
                                             value={register.password}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder={employeeid ? "Leave blank to keep current password" : "Minimum 6 characters"}
                                             required={!employeeid}
                                             minLength={6}
                                             autoComplete="off"
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="cpassword">
                                             Confirm Password {!employeeid && <span className="text-danger">*</span>}
                                        </label>
                                        <input
                                             type="password"
                                             name="cpassword"
                                             id="cpassword"
                                             value={register.cpassword}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder={employeeid ? "Leave blank to keep current password" : "Re-enter password"}
                                             required={!employeeid}
                                             minLength={6}
                                             autoComplete="off"
                                        />
                                   </div>

                                   <div className="col-md-6">
                                        <label className="form-label text-dark fw-medium" htmlFor="pin">
                                             PIN Code <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             type="tel"
                                             name="pin"
                                             id="pin"
                                             value={register.pin}
                                             onChange={handleChange}
                                             className="form-control border-1 py-2"
                                             placeholder="4-digit PIN"
                                             required
                                             inputMode="numeric"
                                             pattern="[0-9]{4}"
                                             title="Enter exactly 4 digits"
                                             minLength={4}
                                             maxLength={4}
                                             autoComplete="off"
                                        />
                                   </div>
                              </div>

                              <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                                   {employeeid && canResetPassword && (
                                        <button type="button" className="btn btn-outline-warning btn-sm px-4 py-2 me-2" onClick={handleResetPassword} disabled={isLoading}>
                                             Reset Password
                                        </button>
                                   )}
                                   <button type="submit" className="btn btn-primary btn-sm px-4 py-2" disabled={isLoading}>
                                        {isLoading ? (
                                             <>
                                                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                  Saving...
                                             </>
                                        ) : (
                                             "Save Information"
                                        )}
                                   </button>
                              </div>
                              {temporaryPassword && (
                                   <div className="alert alert-warning mt-3 mb-0">
                                        Temporary password: <strong>{temporaryPassword}</strong>
                                   </div>
                              )}
                         </form>
                    </div>
               </div>
          </div>
     );
}
