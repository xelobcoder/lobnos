'use client';
import PatientDuplicateReview, { RegistrationMatchDrawer, type RegistrationMatch } from './PatientDuplicateReview';
import NewPasswordInput, { validatePasswordControl } from '../Auth/NewPasswordInput';


import React, { useState, useEffect, useRef } from 'react';
import { Form, Modal, Button, Spinner, Alert } from 'react-bootstrap';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import {
     RiUser3Line,
     RiMapPinLine,
     RiCameraLine,
     RiCheckLine,
     RiArrowRightLine,
     RiArrowLeftLine,
     RiCashFill,
     RiSearchLine,
     RiUserAddLine,
     RiHeartPulseLine,
     RiCheckboxCircleLine,
     RiImageAddLine
} from '@remixicon/react';
import styles from './RegistrationWizard.module.css';
import { customFetch, customPost } from '../Auth/customFetch';
import { useApplication } from '../Auth/useApplicationContext';
import { designation, PatientPersonalInformationFields, ghanaDistricts } from './fields/Util';
import { handleAgeCalculations } from '../Auth/registerclient';
import { plsEncryption } from '../../lib/encryption';
import { uploadPatientImage, validatePatientImage } from '../../lib/patientImages';
import usePatientImage from '../petientsComponent/usePatientImage';
import { linkSavedRecordToQueue, parseQueueHandoff, withQueueHandoff } from '../../lib/queueHandoff';

const COUNTRY_CODES_GROUPED = {
     'West Africa': [
          { code: '+233', abbreviation: 'GH', name: 'Ghana' },
          { code: '+234', abbreviation: 'NG', name: 'Nigeria' },
          { code: '+221', abbreviation: 'SN', name: 'Senegal' },
          { code: '+225', abbreviation: 'CI', name: 'Ivory Coast' },
          { code: '+223', abbreviation: 'ML', name: 'Mali' },
          { code: '+231', abbreviation: 'LR', name: 'Liberia' },
          { code: '+232', abbreviation: 'SL', name: 'Sierra Leone' },
          { code: '+228', abbreviation: 'TG', name: 'Togo' },
          { code: '+229', abbreviation: 'BJ', name: 'Benin' },
          { code: '+226', abbreviation: 'BF', name: 'Burkina Faso' },
     ],
     'International': [
          { code: '+44', abbreviation: 'GB', name: 'UK' },
          { code: '+1', abbreviation: 'US', name: 'USA/Canada' },
          { code: '+358', abbreviation: 'FI', name: 'Finland' },
          { code: '+33', abbreviation: 'FR', name: 'France' },
          { code: '+49', abbreviation: 'DE', name: 'Germany' },
     ],
};

interface RegistrationWizardProps {
     initialPatientId?: number;
     initialStep?: number;
}

export default function RegistrationWizard({ initialPatientId, initialStep = 0 }: RegistrationWizardProps) {
     const router = useRouter();
     const params = useParams();
     const searchParams = useSearchParams();
     const queueHandoff = parseQueueHandoff(searchParams);
     const [queueWarning, setQueueWarning] = useState('');
     const [registrationMatches, setRegistrationMatches] = useState<RegistrationMatch[]>([]);
     const employeeid = useApplication()?.user?.employeeid || null;

     const [currentStep, setCurrentStep] = useState(initialStep);
     const [patientId, setPatientId] = useState<number | null>(
          initialPatientId || (params?.patientid ? Number(params.patientid) : null)
     );

     const [isSubmitting, setIsSubmitting] = useState(false);
     const [isLoadingPatient, setIsLoadingPatient] = useState(false);
     const syncQueuePatient = async (id: number) => {
          const result = await linkSavedRecordToQueue(queueHandoff, { patientid: id });
          setQueueWarning(result.warning);
          return result.warning;
     };
     const billingUrlForPatient = (id: number, pending = false) => withQueueHandoff(`/billing/patientid/${plsEncryption(id.toString())}/multi`, queueHandoff, pending);
     const goToBilling = async (id: number) => {
          const warning = await syncQueuePatient(id);
          window.location.href = billingUrlForPatient(id, Boolean(warning));
     };

     // --- Step 1: Personal Details State ---
     const [personalData, setPersonalData] = useState({ ...PatientPersonalInformationFields });
     const [contacts, setContacts] = useState({ relationship: 'self', owner: '', backup: '', backupOwner: '', backupRelationship: 'relative', backupPatientId: null as number | null });
     const [mobileCountryCode, setMobileCountryCode] = useState('+233');
     const [whatsappCountryCode, setWhatsappCountryCode] = useState('+233');
     const [isMobileExist, setIsMobileExist] = useState(false);
     const [contactConflict, setContactConflict] = useState('');

     // Search patient
     const [searchQuery, setSearchQuery] = useState('');
     const [isSearchingPatient, setIsSearchingPatient] = useState(false);
     const [foundPatients, setFoundPatients] = useState<any[]>([]);
     const [showPatientFoundModal, setShowPatientFoundModal] = useState(false);

     // --- Step 2: Address Data ---
     const [addressData, setAddressData] = useState({
          region: '',
          district: '',
          area: '',
          gpsLocation: '',
          address: ''
     });

     // --- Step 3: Emergency Contact Data ---
     const [emergencyData, setEmergencyData] = useState({
          emmergencyContactName: '',
          relationship: '',
          emmergencyContactNumber: '',
          address: '',
          occupation: ''
     });

     // --- Step 4: Photo & Credentials Data ---
     const savedPhoto = usePatientImage(patientId);
     const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
     const [pendingPreview, setPendingPreview] = useState<string | null>(null);
     const [photoError, setPhotoError] = useState('');
     const profileImage = pendingPhoto ? pendingPreview : savedPhoto.imageUrl;
     const [showPhotoModal, setShowPhotoModal] = useState(false);
     const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
     const [cameraReady, setCameraReady] = useState(false);
     const [cameraError, setCameraError] = useState('');
     const videoRef = useRef<HTMLVideoElement | null>(null);
     const canvasRef = useRef<HTMLCanvasElement | null>(null);
     const fileInputRef = useRef<HTMLInputElement | null>(null);

     const [credentials, setCredentials] = useState({
          username: '',
          password: ''
     });

     useEffect(() => {
          setPendingPhoto(null);
          setPhotoError('');
     }, [patientId]);

     useEffect(() => {
          if (!pendingPhoto) { setPendingPreview(null); return; }
          const url = URL.createObjectURL(pendingPhoto);
          setPendingPreview(url);
          return () => URL.revokeObjectURL(url);
     }, [pendingPhoto]);

     const persistPhoto = async () => {
          if (!patientId) throw new Error('Save the patient record before uploading a photo.');
          if (!pendingPhoto) return;
          await uploadPatientImage(patientId, pendingPhoto);
          setPendingPhoto(null);
          try { await savedPhoto.refresh(); }
          catch { throw new Error('The photo was saved, but its preview could not be reloaded. Retry loading the photo before continuing.'); }
     };

     const handleSavePhoto = async () => {
          try {
               setIsSubmitting(true);
               setPhotoError('');
               await persistPhoto();
               toast.success('Patient photo saved successfully.');
          } catch (error: any) {
               setPhotoError(error?.message || 'Unable to save patient photo. Please try again.');
          } finally { setIsSubmitting(false); }
     };

     // Load Existing Patient Data if patientId is present
     useEffect(() => {
          if (!patientId) return;
          const loadPatient = async () => {
               try {
                    setIsLoadingPatient(true);
                    const [personalRes, addressRes, emergencyRes] = await Promise.all([
                         customFetch(`register/personalinformation?patientid=${patientId}`).catch(() => null),
                         customFetch(`register/addressinginformation?patientid=${patientId}`).catch(() => null),
                         customFetch(`register/emmergencycontactinformation?patientid=${patientId}`).catch(() => null)
                    ]);

                    if (personalRes?.statusCode === 200 && personalRes?.result) {
                         const p = personalRes.result;
                         let days = '';
                         let months = '';
                         let years = '';
                         if (p.dob) {
                              const dob = new Date(p.dob);
                              if (!isNaN(dob.getTime())) {
                                   years = String(dob.getFullYear());
                                   months = String(dob.getMonth() + 1);
                                   days = String(dob.getDate());
                              }
                         }
                         setContacts({
                              relationship: p.contact_relationship || (p.contactpointer === 'relative' ? 'relative' : 'self'),
                              owner: p.relativecontactname || '',
                              backup: p.backup_phone || '',
                              backupOwner: p.backup_contact_name || '',
                              backupRelationship: p.backup_relationship || 'relative',
                              backupPatientId: p.backup_patient_id ?? null,
                         });
                         setPersonalData({
                              firstname: p.firstname || '',
                              middlename: p.middlename || '',
                              lastname: p.lastname || '',
                              designation: p.designation || 'Mr.',
                              age: p.age !== undefined && p.age !== null ? String(p.age) : '',
                              ageType: p.agetype || p.ageType || 'years',
                              gender: p.gender || '',
                              mobile_number: (p.contactpointer === 'relative' ? p.relativecontactnumber : p.mobile_number) || '',
                              mobileCountryCode: p.mobile_country_code || p.mobileCountryCode || '+233',
                              whatsappCountryCode: p.whatsapp_country_code || p.whatsappCountryCode || '+233',
                              relativeCountryCode: p.relative_country_code || p.relativeCountryCode || '+233',
                              whatAppcontact: p.whatAppcontact || p.whatsapp_number || '',
                              relativecontactname: p.relativecontactname || p.relative_contact_name || '',
                              relativecontactnumber: p.relativecontactnumber || p.relative_contact_number || '',
                              email: p.email || '',
                              occupation: p.occupation || '',
                              organization: p.organization || '',
                              marital_status: p.marital_status || '',
                              contact_pointer: p.contact_pointer || 'self',
                              years,
                              months,
                              days,
                              registeredby: p.registeredby || ''
                         });

                         if (p.mobile_country_code) setMobileCountryCode(p.mobile_country_code);
                         if (p.whatsapp_country_code) setWhatsappCountryCode(p.whatsapp_country_code);
                    }

                    if (addressRes?.statusCode === 200 && addressRes?.result) {
                         setAddressData((prev) => ({ ...prev, ...addressRes.result }));
                    }

                    if (emergencyRes?.statusCode === 200 && emergencyRes?.result) {
                         setEmergencyData((prev) => ({ ...prev, ...emergencyRes.result }));
                    }
               } catch (error) {
                    console.error('Error loading patient record:', error);
               } finally {
                    setIsLoadingPatient(false);
               }
          };
          loadPatient();
     }, [patientId]);

     // Check Mobile Number Existence
     const handleCheckMobileNumber = async (mobile: string) => {
          if (!mobile || mobile.length < 9) {
               setIsMobileExist(false);
               return;
          }
          try {
               const checking = await customFetch(`register/checkmobile?mobileno=${mobile}&&isGetData=true`);
               setIsMobileExist(Boolean(checking?.exist));
          } catch {
               setIsMobileExist(false);
          }
     };

     // Patient Search
     const handlePatientSearch = async () => {
          const query = searchQuery.trim();
          if (!query) return;
          setIsSearchingPatient(true);
          try {
               const response = await customFetch(`register/checkmobile?mobileno=${encodeURIComponent(query)}&&isGetData=true`);
               const records = Array.isArray(response?.result)
                    ? response.result.filter(Boolean)
                    : response?.result
                         ? [response.result]
                         : [];

               if (response?.statusCode === 200 && response?.exist && records.length > 0) {
                    setFoundPatients(records);
                    setShowPatientFoundModal(true);
               } else {
                    toast.info("No existing patient matches this query. You can proceed with registration.");
               }
          } catch {
               toast.error("Unable to search patients at this time.");
          } finally {
               setIsSearchingPatient(false);
          }
     };

     const secondaryPhone = contacts.backup;
     const linkedPatientId = contacts.backupPatientId;
     const [secondaryLookup, setSecondaryLookup] = useState('');
     useEffect(() => {
          setSecondaryLookup('');
          if (linkedPatientId || secondaryPhone.replace(/[^0-9]/g, '').length < 9) return;
          let active = true;
          const timer = window.setTimeout(async () => {
               try {
                    const result = await customFetch(`register/checkmobile?mobileno=${encodeURIComponent(secondaryPhone)}&isGetData=true`);
                    if (!active) return;
                    if (result?.status !== 'success' || !Array.isArray(result.result)) throw new Error();
                    const owners = result.result.filter((record: { patientid: number; matched_priority: string; matched_relationship: string }) =>
                         record.matched_priority === 'Primary' && record.matched_relationship === 'self' && Number(record.patientid) !== patientId
                    );
                    if (owners.length !== 1) {
                         setSecondaryLookup(owners.length ? 'Several patient records own this number. Check which record is correct.' : 'You can enter the contact name manually.');
                         return;
                    }
                    const owner = owners[0];
                    setContacts(current => current.backup !== secondaryPhone || current.backupPatientId ? current : {
                         ...current,
                         backup: owner.matched_phone,
                         backupPatientId: Number(owner.patientid),
                         backupRelationship: current.backupRelationship === 'self' ? 'relative' : current.backupRelationship,
                         backupOwner: [owner.firstname, owner.middlename, owner.lastname].filter(Boolean).join(' '),
                    });
               } catch {
                    if (active) setSecondaryLookup('Unable to check this number. Check the number or try again.');
               }
          }, 350);
          return () => { active = false; window.clearTimeout(timer); };
     }, [secondaryPhone, linkedPatientId, patientId]);

     // --- STEP 1 SUBMIT (Save Personal Info) ---
     const handleSaveStep1 = async (redirectToBilling = false) => {
          setContactConflict('');
          const firstname = String(personalData.firstname || '').trim();
          const lastname = String(personalData.lastname || '').trim();

          if (!firstname || !lastname) {
               toast.error("Please enter patient's First Name and Last Name.");
               return false;
          }
          if (!personalData.gender) {
               toast.error("Please select patient's Gender.");
               return false;
          }

          const primary = String(personalData.mobile_number || '').replace(/\D/g, '');
          const enteredBackup = contacts.backup.trim();
          const backup = enteredBackup.replace(/[\s()+-]/g, '').replace(/^00(?=[1-9])/, '')
               .replace(/^233(\d{9})$/, '0$1').replace(/^(\d{9})$/, '0$1');
          if ((primary && !/^\d{10}$/.test(primary)) || (backup && !/^\d{10,15}$/.test(backup))) {
               toast.error('Check the primary or secondary number you entered.');
               return false;
          }
          if ((primary && contacts.relationship !== 'self' && !contacts.owner.trim()) ||
               (backup && backup === primary)) {
               toast.error('Enter the primary contact owner and use a different number for the secondary contact.');
               return false;
          }

          try {
               setIsSubmitting(true);
               const method = patientId ? "PUT" : "POST";
               const endpoint =
                    method === "POST"
                         ? `register?employeeid=${employeeid}`
                         : `register/personalinformation?patientid=${patientId}&employeeid=${employeeid}`;

               const payload: any = {
                    firstname: firstname,
                    middlename: personalData.middlename || '',
                    lastname: lastname,
                    designation: personalData.designation || 'Mr.',
                    age: personalData.age ? parseInt(String(personalData.age), 10) : 0,
                    agetype: personalData.ageType || 'years',
                    gender: personalData.gender,
                    mobile_number: !primary || contacts.relationship === "self" ? primary || null : undefined,
                    contact_pointer: !primary || contacts.relationship === "self" ? "self" : "relative",
                    contact_relationship: primary ? contacts.relationship : "self",
                    backup_phone: backup,
                    backup_patient_id: contacts.backupPatientId,
                    backup_contact_name: backup && contacts.backupRelationship !== 'self' ? contacts.backupOwner.trim() : '',
                    backup_relationship: backup ? contacts.backupRelationship : '',
                    mobile_country_code: mobileCountryCode,
                    whatsapp_country_code: whatsappCountryCode,
                    registeredby: employeeid,
               };

               if (contacts.relationship !== 'self' && primary) {
                    payload.relativecontactnumber = primary;
                    payload.relativecontactname = contacts.owner.trim();
               }
               if (personalData.whatAppcontact) payload.whatAppcontact = personalData.whatAppcontact;
               if (personalData.email) payload.email = personalData.email;
               if (personalData.marital_status) payload.marital_status = personalData.marital_status;
               if (personalData.occupation) payload.occupation = personalData.occupation;
               if (personalData.organization) payload.organization = personalData.organization;

               if (personalData.years && personalData.months && personalData.days) {
                    const parsedYears = parseInt(String(personalData.years), 10) || 0;
                    const parsedMonths = parseInt(String(personalData.months), 10) || 0;
                    const parsedDays = parseInt(String(personalData.days), 10) || 0;
                    const date = new Date(Date.UTC(parsedYears, parsedMonths - 1, parsedDays));
                    if (date.getUTCFullYear() !== parsedYears || date.getUTCMonth() !== parsedMonths - 1 || date.getUTCDate() !== parsedDays) {
                         toast.error('Enter a valid date of birth, or leave it blank and enter age.');
                         return false;
                    }
                    payload.dob = date.toISOString().slice(0, 10);
               }

               const response = await customPost(endpoint, method, payload);
               if (response?.code === 'PATIENT_PRIMARY_CONTACT_IN_USE') {
                    setContactConflict(response.message);
                    toast.error(response.message);
                    return false;
               }
               if (response?.code === 'PATIENT_DUPLICATE_MATCH' && Array.isArray(response.matches)) {
                    setRegistrationMatches(response.matches);
                    return false;
               }
               if (response?.status === true || response?.status === "success") {
                    const registeredId = response.patientid || patientId;
                    if (registeredId) {
                         setPatientId(Number(registeredId));
                    }
                    const warning = registeredId ? await syncQueuePatient(Number(registeredId)) : '';

                    toast.success(method === "POST" ? "Basic Patient Information Registered Successfully!" : "Personal Information Updated!");

                    if (redirectToBilling && registeredId) {
                         const billingUrl = billingUrlForPatient(Number(registeredId), Boolean(warning));
                         window.location.href = billingUrl;
                         return true;
                    }

                    return true;
               } else {
                    toast.error(response?.message || "Failed to save personal information.");
                    return false;
               }
          } catch (err: any) {
               toast.error(err?.message || "Error submitting registration.");
               return false;
          } finally {
               setIsSubmitting(false);
          }
     };

     // --- STEP 2 SUBMIT (Save Address) ---
     const handleSaveStep2 = async (redirectToBilling = false) => {
          if (!patientId) {
               toast.error("Please complete Step 1 first.");
               return false;
          }
          try {
               setIsSubmitting(true);
               const payload = {
                    region: addressData.region,
                    district: addressData.district,
                    area: addressData.area,
                    gpsLocation: addressData.gpsLocation,
                    address: addressData.address,
                    patientid: patientId
               };
               const response = await customPost(`register/addressinginformation?patientid=${patientId}`, 'PUT', payload);
               if (response && Number(response.statusCode) === 200 && response.status === "success") {
                    toast.success("Address & Location Information Saved!");
                    if (redirectToBilling) {
                         await goToBilling(patientId);
                         return true;
                    }
                    return true;
               } else {
                    toast.error(response?.message || "Failed to save addressing information.");
                    return false;
               }
          } catch {
               toast.error("Error saving address details.");
               return false;
          } finally {
               setIsSubmitting(false);
          }
     };

     // --- STEP 3 SUBMIT (Save Emergency Contact) ---
     const handleSaveStep3 = async (redirectToBilling = false) => {
          if (!patientId) {
               toast.error("Please complete Step 1 first.");
               return false;
          }
          try {
               setIsSubmitting(true);
               const payload = {
                    emmergencyContactName: emergencyData.emmergencyContactName,
                    relationship: emergencyData.relationship,
                    emmergencyContactNumber: emergencyData.emmergencyContactNumber,
                    address: emergencyData.address,
                    occupation: emergencyData.occupation,
                    patientid: patientId
               };
               const response = await customPost(`register/emmergencycontactinformation?patientid=${patientId}`, 'PUT', payload);
               if (response && Number(response.statusCode) === 200 && response.status === "success") {
                    toast.success("Emergency Contact Information Saved!");
                    if (redirectToBilling) {
                         await goToBilling(patientId);
                         return true;
                    }
                    return true;
               } else {
                    toast.error(response?.message || "Failed to save emergency contact.");
                    return false;
               }
          } catch {
               toast.error("Error saving emergency contact.");
               return false;
          } finally {
               setIsSubmitting(false);
          }
     };

     // --- STEP 4 SUBMIT (Save Photo & Credentials) ---
     const handleSaveStep4 = async () => {
          if (credentials.password && !validatePasswordControl('registration-password')) return;
          if (!patientId) {
               toast.error("Please complete Step 1 first.");
               return;
          }
          if (Boolean(credentials.username) !== Boolean(credentials.password)) {
               toast.error('Enter both a username and password, or leave both fields empty.');
               return;
          }
          try {
               setIsSubmitting(true);
               setPhotoError('');
               await persistPhoto();
               if (savedPhoto.error && !pendingPhoto) await savedPhoto.refresh();
               if (credentials.username && credentials.password) {
                    const response = await customPost('patients/updatecredentials', 'POST', {
                         opassword: credentials.password,
                         npassword: credentials.password,
                         nppassword: credentials.password,
                         employeeid,
                         patientid: patientId,
                         providedUsername: credentials.username
                    });
                    if (response?.status !== true && response?.status !== 'success') {
                         throw new Error(response?.message || 'Patient portal credentials could not be saved.');
                    }
               }
               toast.success("Patient Registration Completed Successfully!");
               await goToBilling(patientId);
          } catch (error: any) {
               const message = error?.message || 'Unable to finish saving this patient record.';
               setPhotoError(message);
               toast.error(message);
          } finally {
               setIsSubmitting(false);
          }
     };

     // District options for Step 2
     const districtOptions = addressData.region && (ghanaDistricts as any)[addressData.region]
          ? Object.entries((ghanaDistricts as any)[addressData.region]).map(([code, val]: any) => ({
               code,
               name: val.name
          }))
          : [];

     // Step labels
     const stepsConfig = [
          { id: 0, title: 'Personal Details', name: 'Basic Info', icon: RiUser3Line },
          { id: 1, title: 'Address & Location', name: 'Address', icon: RiMapPinLine },
          { id: 2, title: 'Emergency Contact', name: 'Emergency', icon: RiHeartPulseLine },
          { id: 3, title: 'Photo & Credentials', name: 'Identity', icon: RiCameraLine },
     ];

     const progressPercent = Math.round(((currentStep + 1) / stepsConfig.length) * 100);

     return (
          <div className={styles.wizardContainer}>
               {queueHandoff ? <div className="alert alert-info" role="status">Registering client from queue ticket #{queueHandoff.ticketId}. The saved patient and bill will be linked to this visit. <a href="/operations/queue">Return to queue</a></div> : null}
               <PatientDuplicateReview key={patientId || 'new'} patientId={patientId} />
               <RegistrationMatchDrawer matches={registrationMatches} onClose={() => setRegistrationMatches([])} onSelect={match => {
                    setRegistrationMatches([]);
                    setPatientId(Number(match.patientid));
                    setCurrentStep(0);
               }} />
               {queueWarning ? <div className="alert alert-warning" role="alert">{queueWarning} <a href="/operations/queue">Open queue</a></div> : null}
               {/* Header Stepper Card */}
               <div className={styles.stepperCard}>
                    <div className={styles.stepperHeader}>
                         <div className={styles.wizardTitleGroup}>
                              <div className={styles.wizardTitleIcon}>
                                   <RiUserAddLine size={24} />
                              </div>
                              <div>
                                   <h5 className={styles.wizardTitle}>Patient Registration Wizard</h5>
                                   <p className={styles.wizardSubtitle}>
                                        {patientId ? (
                                             <span className="badge bg-success-subtle text-success border border-success-subtle me-2">
                                                  Patient ID: #{patientId}
                                             </span>
                                        ) : (
                                             <span className="badge bg-primary-subtle text-primary border border-primary-subtle me-2">
                                                  New Registration
                                             </span>
                                        )}
                                        Fill basic information to bill immediately or proceed through all steps.
                                   </p>
                              </div>
                         </div>

                         <div className="d-flex flex-wrap align-items-center gap-2">
                              <Button
                                   variant="outline-secondary"
                                   size="sm"
                                   className="fw-semibold d-inline-flex align-items-center gap-1"
                                   disabled={isSubmitting}
                                   onClick={() => router.push('/crm/customers')}
                              >
                                   <RiUser3Line size={18} /> Customers
                              </Button>
                              {patientId && (
                                   <Button
                                        variant="outline-success"
                                        size="sm"
                                        className="fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={isSubmitting}
                                        onClick={async () => {
                                             await goToBilling(patientId);
                                        }}
                                   >
                                        <RiCashFill size={18} /> Proceed to Billing Directly
                                   </Button>
                              )}
                         </div>
                    </div>

                    {/* Step Navigation Pills */}
                    <div className={styles.stepperNav}>
                         {stepsConfig.map((s) => {
                              const IconComp = s.icon;
                              const isActive = currentStep === s.id;
                              const isCompleted = patientId !== null && s.id < currentStep;
                              const isUnlocked = s.id === 0 || patientId !== null;

                              return (
                                   <button
                                        key={s.id}
                                        type="button"
                                        className={`${styles.stepPill} ${isActive ? styles.stepPillActive : isCompleted ? styles.stepPillCompleted : ''
                                             } ${!isUnlocked ? styles.stepPillDisabled : ''}`}
                                        onClick={() => {
                                             if (isUnlocked) setCurrentStep(s.id);
                                        }}
                                        disabled={!isUnlocked || isSubmitting}
                                   >
                                        <div className={styles.stepBadge}>
                                             {isCompleted ? <RiCheckLine size={16} /> : s.id + 1}
                                        </div>
                                        <div className={styles.stepLabelGroup}>
                                             <span className={styles.stepStepName}>{s.name}</span>
                                             <span className={styles.stepTitleText}>{s.title}</span>
                                        </div>
                                   </button>
                              );
                         })}
                    </div>

                    {/* Progress Bar */}
                    <div className={styles.progressBarTrack}>
                         <div className={styles.progressBarFill} style={{ width: `${progressPercent}%` }} />
                    </div>
               </div>

               {/* STEP 1: PERSONAL & BASIC DETAILS */}
               {currentStep === 0 && (
                    <div className={styles.formCard}>
                         {/* Phone Lookup Tool Bar */}
                         <div className="card border-0 bg-light-subtle rounded-3 p-3 mb-4 ">
                              <div className="row align-items-center g-2">
                                   <div className="col-md-5 col-12">
                                        <label className="form-label text-xs font-semibold text-uppercase text-muted mb-1 d-flex align-items-center gap-1">
                                             <RiSearchLine size={14} /> Quick Duplicate Check
                                        </label>
                                        <div className="input-group">
                                             <input
                                                  type="text"
                                                  className="form-control form-control-sm"
                                                  placeholder="Search by mobile number..."
                                                  value={searchQuery}
                                                  onChange={(e) => setSearchQuery(e.target.value)}
                                                  onKeyDown={(e) => {
                                                       if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handlePatientSearch();
                                                       }
                                                  }}
                                             />
                                             <Button
                                                  variant="primary"
                                                  size="sm"
                                                  disabled={!searchQuery.trim() || isSearchingPatient}
                                                  onClick={handlePatientSearch}
                                             >
                                                  {isSearchingPatient ? <Spinner size="sm" /> : "Check Mobile"}
                                             </Button>
                                        </div>
                                   </div>
                                   <div className="col-md-7 col-12">
                                        <div className="text-xs text-muted">
                                             Check existing client records by phone number before filling in details to prevent creating duplicate profiles.
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <div className={styles.sectionHeader}>
                              <div>
                                   <h6 className={styles.sectionTitle}>
                                        <RiUser3Line size={20} className="text-primary" /> Personal Information
                                   </h6>
                                   <p className={styles.sectionSubtitle}>Enter basic demographics to register patient</p>
                              </div>
                              <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                                   * Mandatory Fields
                              </span>
                         </div>

                         {contactConflict && <Alert variant="warning" role="alert">{contactConflict}</Alert>}
                         {isMobileExist && !contactConflict && <Alert variant="info" className="mb-3">
                              This number is already linked to a patient. Select the contact owner below or use phone search to review linked records.
                         </Alert>}

                         {/* 2-COLUMN VERTICAL FORM LAYOUT */}
                         <div className="row g-4">
                              {/* LEFT COLUMN VERTICAL STACK */}
                              <div className="col-md-6 col-12">
                                   {/* Title */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Designation / Title</label>
                                        <select
                                             tabIndex={1}
                                             className={`form-select form-select-lg ${styles.largeSelect}`}
                                             value={personalData.designation || 'Mr.'}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, designation: e.target.value }))}
                                        >
                                             {designation.map((title) => (
                                                  <option key={title} value={title}>{title}</option>
                                             ))}
                                        </select>
                                   </div>

                                   {/* First Name */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>
                                             First Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             tabIndex={2}
                                             type="text"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="First Name"
                                             value={personalData.firstname || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, firstname: e.target.value }))}
                                        />
                                   </div>

                                   {/* Last Name */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>
                                             Last Name <span className="text-danger">*</span>
                                        </label>
                                        <input
                                             tabIndex={3}
                                             type="text"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="Last Name"
                                             value={personalData.lastname || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, lastname: e.target.value }))}
                                        />
                                   </div>

                                   {/* Middle Name */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Middle Name</label>
                                        <input
                                             tabIndex={4}
                                             type="text"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="Middle Name (Optional)"
                                             value={personalData.middlename || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, middlename: e.target.value }))}
                                        />
                                   </div>

                                   {/* Gender */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>
                                             Gender <span className="text-danger">*</span>
                                        </label>
                                        <div className={styles.genderChoiceGroup}>
                                             <button
                                                  type="button"
                                                  tabIndex={5}
                                                  className={`${styles.genderCard} ${personalData.gender === 'female' ? styles.genderCardActive : ''}`}
                                                  onClick={() => setPersonalData((prev) => ({ ...prev, gender: 'female' }))}
                                             >
                                                  Female
                                             </button>
                                             <button
                                                  type="button"
                                                  tabIndex={6}
                                                  className={`${styles.genderCard} ${personalData.gender === 'male' ? styles.genderCardActive : ''}`}
                                                  onClick={() => setPersonalData((prev) => ({ ...prev, gender: 'male' }))}
                                             >
                                                  Male
                                             </button>
                                        </div>
                                   </div>

                                   {/* Date of Birth & Age Calculation */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Date Of Birth & Age</label>
                                        <div className="row g-2">
                                             <div className="col-3">
                                                  <input
                                                       tabIndex={7}
                                                       type="number"
                                                       className={`form-control form-control-lg text-center ${styles.largeInput}`}
                                                       placeholder="DD"
                                                       min={1}
                                                       max={31}
                                                       value={personalData.days || ''}
                                                       onChange={(e) => setPersonalData((prev) => ({ ...prev, days: e.target.value }))}
                                                  />
                                             </div>
                                             <div className="col-3">
                                                  <input
                                                       tabIndex={8}
                                                       type="number"
                                                       className={`form-control form-control-lg text-center ${styles.largeInput}`}
                                                       placeholder="MM"
                                                       min={1}
                                                       max={12}
                                                       value={personalData.months || ''}
                                                       onChange={(e) => setPersonalData((prev) => ({ ...prev, months: e.target.value }))}
                                                  />
                                             </div>
                                             <div className="col-3">
                                                  <input
                                                       tabIndex={9}
                                                       type="number"
                                                       className={`form-control form-control-lg text-center ${styles.largeInput}`}
                                                       placeholder="YYYY"
                                                       min={1900}
                                                       max={new Date().getFullYear()}
                                                       value={personalData.years || ''}
                                                       onChange={(e) => setPersonalData((prev) => ({ ...prev, years: e.target.value }))}
                                                       onBlur={() => {
                                                            handleAgeCalculations(
                                                                 { days: personalData.days, months: personalData.months, years: personalData.years },
                                                                 (key, val) => setPersonalData((prev) => ({ ...prev, [key]: val }))
                                                            );
                                                       }}
                                                  />
                                             </div>
                                             <div className="col-3">
                                                  <div className="input-group">
                                                       <input
                                                            tabIndex={10}
                                                            type="number"
                                                            className={`form-control form-control-lg text-center fw-bold ${styles.largeInput}`}
                                                            placeholder="Age"
                                                            value={personalData.age || ''}
                                                            onChange={(e) => setPersonalData((prev) => ({ ...prev, age: e.target.value }))}
                                                       />
                                                       <select
                                                            tabIndex={11}
                                                            className={`form-select form-select-lg ${styles.largeSelect}`}
                                                            style={{ maxWidth: '85px' }}
                                                            value={personalData.ageType || 'years'}
                                                            onChange={(e) => setPersonalData((prev) => ({ ...prev, ageType: e.target.value }))}
                                                       >
                                                            <option value="years">Yrs</option>
                                                            <option value="months">Mths</option>
                                                            <option value="days">Days</option>
                                                       </select>
                                                  </div>
                                             </div>
                                        </div>
                                   </div>
                              </div>

                              {/* RIGHT COLUMN VERTICAL STACK */}
                              <div className="col-md-6 col-12">
                                   {/* Primary Mobile */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>
                                             Primary mobile (optional)
                                        </label>
                                        <div className={styles.phoneInputRow}>
                                             <select
                                                  tabIndex={12}
                                                  className={`form-select form-select-lg ${styles.phoneCodeSelect}`}
                                                  value={mobileCountryCode}
                                                  onChange={(e) => setMobileCountryCode(e.target.value)}
                                             >
                                                  {Object.entries(COUNTRY_CODES_GROUPED).map(([region, countries]) => (
                                                       <optgroup key={region} label={region}>
                                                            {countries.map((c) => (
                                                                 <option key={c.code} value={c.code}>{c.abbreviation} {c.code}</option>
                                                            ))}
                                                       </optgroup>
                                                  ))}
                                             </select>
                                             <input
                                                  tabIndex={13}
                                                  type="tel"
                                                  className={`form-control form-control-lg ${styles.phoneNumberInput}`}
                                                  placeholder="10-digit mobile number"
                                                  maxLength={10}
                                                  value={personalData.mobile_number || ''}
                                                  onChange={(e) => { setContactConflict(''); setPersonalData((prev) => ({ ...prev, mobile_number: e.target.value })); }}
                                                  onBlur={(e) => handleCheckMobileNumber(e.target.value)}
                                             />
                                        </div>
                                   </div>

                                   {/* WhatsApp Contact */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>WhatsApp Contact</label>
                                        <div className={styles.phoneInputRow}>
                                             <select
                                                  tabIndex={14}
                                                  className={`form-select form-select-lg ${styles.phoneCodeSelect}`}
                                                  value={whatsappCountryCode}
                                                  onChange={(e) => setWhatsappCountryCode(e.target.value)}
                                             >
                                                  {Object.entries(COUNTRY_CODES_GROUPED).map(([region, countries]) => (
                                                       <optgroup key={region} label={region}>
                                                            {countries.map((c) => (
                                                                 <option key={c.code} value={c.code}>{c.abbreviation} {c.code}</option>
                                                            ))}
                                                       </optgroup>
                                                  ))}
                                             </select>
                                             <input
                                                  tabIndex={15}
                                                  type="tel"
                                                  className={`form-control form-control-lg ${styles.phoneNumberInput}`}
                                                  placeholder="WhatsApp contact"
                                                  maxLength={10}
                                                  value={personalData.whatAppcontact || ''}
                                                  onChange={(e) => setPersonalData((prev) => ({ ...prev, whatAppcontact: e.target.value }))}
                                             />
                                        </div>
                                   </div>

                                   {/* Email */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Email Address</label>
                                        <input
                                             tabIndex={16}
                                             type="email"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="patient@example.com"
                                             value={personalData.email || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, email: e.target.value }))}
                                        />
                                   </div>

                                   {/* Occupation */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Occupation</label>
                                        <input
                                             tabIndex={17}
                                             type="text"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="Occupation / Job Title"
                                             value={personalData.occupation || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, occupation: e.target.value }))}
                                        />
                                   </div>

                                   {/* Organization */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Organization / Employer</label>
                                        <input
                                             tabIndex={18}
                                             type="text"
                                             className={`form-control form-control-lg ${styles.largeInput}`}
                                             placeholder="Company / Institution"
                                             value={personalData.organization || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, organization: e.target.value }))}
                                        />
                                   </div>

                                   {/* Marital Status */}
                                   <div className={styles.formGroup}>
                                        <label className={styles.fieldLabel}>Marital Status</label>
                                        <select
                                             tabIndex={19}
                                             className={`form-select form-select-lg ${styles.largeSelect}`}
                                             value={personalData.marital_status || ''}
                                             onChange={(e) => setPersonalData((prev) => ({ ...prev, marital_status: e.target.value }))}
                                        >
                                             <option value="">-- Select Marital Status --</option>
                                             <option value="single">Single</option>
                                             <option value="married">Married</option>
                                             <option value="divorced">Divorced</option>
                                             <option value="widowed">Widowed</option>
                                        </select>
                                   </div>

                                   <fieldset className="border rounded p-3">
                                        <legend className="h6">Contact ownership</legend>
                                        <label className="d-block mb-2">Who owns the primary number?
                                             <select className="form-select" value={contacts.relationship} onChange={e => { setContactConflict(''); setContacts({ ...contacts, relationship: e.target.value }); }}>
                                                  <option value="self">Patient (self)</option>
                                                  {['mother', 'father', 'guardian', 'relative', 'other'].map(relation => <option className="text-capitalize" key={relation} value={relation}>{relation}</option>)}
                                             </select>
                                        </label>
                                        {contacts.relationship !== 'self' && <label className="d-block mb-3">Primary contact name
                                             <input className="form-control" value={contacts.owner} onChange={e => setContacts({ ...contacts, owner: e.target.value })} />
                                        </label>}
                                        <label className="d-block mb-2">Secondary phone (optional)
                                             <input type="tel" inputMode="tel" className="form-control" value={contacts.backup} onChange={e => setContacts({ ...contacts, backup: e.target.value, backupPatientId: null })} />
                                        </label>
                                        {contacts.backup && <>
                                             {secondaryLookup && <p className="small text-muted mb-2" role="status">{secondaryLookup}</p>}
                                             {contacts.backupPatientId && <div className="mb-2">
                                                  <a href={`/crm/registration/${contacts.backupPatientId}/personal-information`} target="_blank" rel="noreferrer">
                                                       {contacts.backupOwner} · Patient #{contacts.backupPatientId}
                                                  </a>

                                             </div>}
                                             <label className="d-block mb-2">Who owns the backup number?
                                                  <select className="form-select" value={contacts.backupRelationship} onChange={e => setContacts({ ...contacts, backupRelationship: e.target.value })}>
                                                       <option value="self" disabled={!!contacts.backupPatientId}>Patient (self)</option>
                                                       {['mother', 'father', 'guardian', 'relative', 'other'].map(relation => <option key={relation} value={relation}>{relation}</option>)}
                                                  </select>
                                             </label>
                                             {contacts.backupRelationship !== 'self' && <label className="d-block">Backup contact name
                                                  <input className="form-control" value={contacts.backupOwner} readOnly={!!contacts.backupPatientId} onChange={e => setContacts({ ...contacts, backupOwner: e.target.value })} />
                                             </label>}
                                        </>}
                                   </fieldset>
                              </div>
                         </div>

                         {/* Step 1 Action Bar */}
                         <div className={styles.actionFooter}>
                              <div>
                                   <span className="text-xs text-muted">
                                        Basic info can be saved immediately to issue bills.
                                   </span>
                              </div>
                              <div className={styles.rightActions}>
                                   <Button
                                        variant="success"
                                        className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={isSubmitting}
                                        onClick={() => handleSaveStep1(true)}
                                   >
                                        {isSubmitting ? <Spinner size="sm" /> : <RiCashFill size={18} />}
                                        Save & Proceed to Billing
                                   </Button>

                                   <Button
                                        variant="primary"
                                        className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={isSubmitting}
                                        onClick={async () => {
                                             const ok = await handleSaveStep1(false);
                                             if (ok) setCurrentStep(1);
                                        }}
                                   >
                                        {isSubmitting ? <Spinner size="sm" /> : null}
                                        Save & Continue to Address <RiArrowRightLine size={18} />
                                   </Button>
                              </div>
                         </div>
                    </div>
               )}

               {/* STEP 2: ADDRESS & LOCATION */}
               {currentStep === 1 && (
                    <div className={styles.formCard}>
                         <div className={styles.sectionHeader}>
                              <div>
                                   <h6 className={styles.sectionTitle}>
                                        <RiMapPinLine size={20} className="text-primary" /> Address & Geographical Location
                                   </h6>
                                   <p className={styles.sectionSubtitle}>Patient residential region, district, and digital address</p>
                              </div>
                         </div>

                         <div className="row g-3">
                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Region</label>
                                   <select
                                        className={`form-select form-select-lg ${styles.largeSelect}`}
                                        value={addressData.region || ''}
                                        onChange={(e) => setAddressData((prev) => ({ ...prev, region: e.target.value, district: '' }))}
                                   >
                                        <option value="">-- Select Region --</option>
                                        {Object.keys(ghanaDistricts).map((regionName) => (
                                             <option key={regionName} value={regionName}>{regionName}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>District / Municipality</label>
                                   <select
                                        className={`form-select form-select-lg ${styles.largeSelect}`}
                                        value={addressData.district || ''}
                                        onChange={(e) => setAddressData((prev) => ({ ...prev, district: e.target.value }))}
                                        disabled={!addressData.region}
                                   >
                                        <option value="">-- Select District --</option>
                                        {districtOptions.map((d: any) => (
                                             <option key={d.code} value={d.code}>{d.name}</option>
                                        ))}
                                   </select>
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Area / Suburb / Town</label>
                                   <input
                                        type="text"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="e.g. East Legon, Kumasi Central"
                                        value={addressData.area || ''}
                                        onChange={(e) => setAddressData((prev) => ({ ...prev, area: e.target.value }))}
                                   />
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>GhanaPost Digital Address / GPS</label>
                                   <input
                                        type="text"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="e.g. GA-183-9020"
                                        value={addressData.gpsLocation || ''}
                                        onChange={(e) => setAddressData((prev) => ({ ...prev, gpsLocation: e.target.value }))}
                                   />
                              </div>

                              <div className="col-md-12">
                                   <label className={styles.fieldLabel}>Full Street / House Address</label>
                                   <textarea
                                        className="form-control form-control-lg fs-6"
                                        rows={3}
                                        placeholder="House Number, Street Name, Landmarks..."
                                        value={addressData.address || ''}
                                        onChange={(e) => setAddressData((prev) => ({ ...prev, address: e.target.value }))}
                                   />
                              </div>
                         </div>

                         <div className={styles.actionFooter}>
                              <Button
                                   variant="light"
                                   className="px-3"
                                   onClick={() => setCurrentStep(0)}
                              >
                                   <RiArrowLeftLine size={18} /> Back to Personal Info
                              </Button>

                              <div className={styles.rightActions}>
                                   {patientId && (
                                        <Button
                                             variant="outline-success"
                                             className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                             onClick={() => handleSaveStep2(true)}
                                        >
                                             <RiCashFill size={18} /> Save & Proceed to Billing
                                        </Button>
                                   )}

                                   <Button
                                        variant="primary"
                                        className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={isSubmitting}
                                        onClick={async () => {
                                             const ok = await handleSaveStep2(false);
                                             if (ok) setCurrentStep(2);
                                        }}
                                   >
                                        {isSubmitting ? <Spinner size="sm" /> : null}
                                        Save & Continue to Emergency Contact <RiArrowRightLine size={18} />
                                   </Button>
                              </div>
                         </div>
                    </div>
               )}

               {/* STEP 3: EMERGENCY CONTACT */}
               {currentStep === 2 && (
                    <div className={styles.formCard}>
                         <div className={styles.sectionHeader}>
                              <div>
                                   <h6 className={styles.sectionTitle}>
                                        <RiHeartPulseLine size={20} className="text-primary" /> Emergency Contact Details
                                   </h6>
                                   <p className={styles.sectionSubtitle}>Primary emergency contact person in case of urgent notice</p>
                              </div>
                         </div>

                         <div className="row g-3">
                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Emergency Contact Full Name</label>
                                   <input
                                        type="text"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="Contact Full Name"
                                        value={emergencyData.emmergencyContactName || ''}
                                        onChange={(e) => setEmergencyData((prev) => ({ ...prev, emmergencyContactName: e.target.value }))}
                                   />
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Relationship</label>
                                   <select
                                        className={`form-select form-select-lg ${styles.largeSelect}`}
                                        value={emergencyData.relationship || ''}
                                        onChange={(e) => setEmergencyData((prev) => ({ ...prev, relationship: e.target.value }))}
                                   >
                                        <option value="">-- Select Relationship --</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Parent">Parent</option>
                                        <option value="Sibling">Sibling</option>
                                        <option value="Child">Child</option>
                                        <option value="Guardian">Guardian</option>
                                        <option value="Employer">Employer</option>
                                        <option value="Relative">Relative</option>
                                        <option value="Friend">Friend</option>
                                        <option value="Other">Other</option>
                                   </select>
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Emergency Contact Phone</label>
                                   <input
                                        type="tel"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="Contact Phone Number"
                                        value={emergencyData.emmergencyContactNumber || ''}
                                        onChange={(e) => setEmergencyData((prev) => ({ ...prev, emmergencyContactNumber: e.target.value }))}
                                   />
                              </div>

                              <div className="col-md-6 col-12">
                                   <label className={styles.fieldLabel}>Occupation</label>
                                   <input
                                        type="text"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="Contact Occupation"
                                        value={emergencyData.occupation || ''}
                                        onChange={(e) => setEmergencyData((prev) => ({ ...prev, occupation: e.target.value }))}
                                   />
                              </div>

                              <div className="col-md-12">
                                   <label className={styles.fieldLabel}>Residential Address</label>
                                   <input
                                        type="text"
                                        className={`form-control form-control-lg ${styles.largeInput}`}
                                        placeholder="Contact Residential Location"
                                        value={emergencyData.address || ''}
                                        onChange={(e) => setEmergencyData((prev) => ({ ...prev, address: e.target.value }))}
                                   />
                              </div>
                         </div>

                         <div className={styles.actionFooter}>
                              <Button
                                   variant="light"
                                   className="px-3"
                                   onClick={() => setCurrentStep(1)}
                              >
                                   <RiArrowLeftLine size={18} /> Back to Address
                              </Button>

                              <div className={styles.rightActions}>
                                   {patientId && (
                                        <Button
                                             variant="outline-success"
                                             className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                             onClick={() => handleSaveStep3(true)}
                                        >
                                             <RiCashFill size={18} /> Save & Proceed to Billing
                                        </Button>
                                   )}

                                   <Button
                                        variant="primary"
                                        className="px-3 fw-semibold d-inline-flex align-items-center gap-1"
                                        disabled={isSubmitting}
                                        onClick={async () => {
                                             const ok = await handleSaveStep3(false);
                                             if (ok) setCurrentStep(3);
                                        }}
                                   >
                                        {isSubmitting ? <Spinner size="sm" /> : null}
                                        Save & Continue to Photo <RiArrowRightLine size={18} />
                                   </Button>
                              </div>
                         </div>
                    </div>
               )}

               {/* STEP 4: PHOTO & IDENTITY */}
               {currentStep === 3 && (
                    <div className={styles.formCard}>
                         <div className={styles.sectionHeader}>
                              <div>
                                   <h6 className={styles.sectionTitle}>
                                        <RiCameraLine size={20} className="text-primary" /> Profile Photo & Identity
                                   </h6>
                                   <p className={styles.sectionSubtitle}>Upload patient photograph or setup portal login credentials</p>
                              </div>
                         </div>

                         {(photoError || savedPhoto.error) && <Alert variant="danger" role="alert">{photoError || savedPhoto.error}<Button variant="link" size="sm" disabled={isSubmitting || savedPhoto.loading} onClick={async () => { setPhotoError(''); try { await savedPhoto.refresh(); } catch { /* The photo loader displays the error. */ } }}>Retry loading photo</Button></Alert>}
                         <div className="row g-4 align-items-center">
                              <div className="col-md-5 text-center border-end pe-md-4">
                                   <div className="mb-3">
                                        {savedPhoto.loading && !pendingPhoto ? <div role="status"><Spinner size="sm" /> Loading saved photo...</div> : profileImage ? (
                                             <img
                                                  src={profileImage}
                                                  alt="Profile Preview"
                                                  className="img-thumbnail rounded-circle shadow-sm"
                                                  style={{ width: '160px', height: '160px', objectFit: 'cover' }}
                                             />
                                        ) : (
                                             <div
                                                  className="rounded-circle bg-light d-flex flex-column align-items-center justify-content-center mx-auto border"
                                                  style={{ width: '160px', height: '160px' }}
                                             >
                                                  <RiImageAddLine size={48} className="text-muted" />
                                                  <small className="text-muted mt-1 text-xs">No Photo</small>
                                             </div>
                                        )}
                                   </div>

                                   <div className="d-flex justify-content-center gap-2">
                                        <Button
                                             variant="outline-primary"
                                             size="sm"
                                             disabled={isSubmitting}
                                             onClick={() => fileInputRef.current?.click()}
                                        >
                                             Upload File
                                        </Button>
                                        {pendingPhoto && <Button variant="primary" size="sm" disabled={isSubmitting} onClick={handleSavePhoto}>Save photo</Button>}
                                        {pendingPhoto && (
                                             <Button
                                                  variant="outline-danger"
                                                  size="sm"
                                                  disabled={isSubmitting}
                                                  onClick={() => { setPendingPhoto(null); setPhotoError(''); }}
                                             >
                                                  Discard selected photo
                                             </Button>
                                        )}
                                   </div>
                                   <p className="small text-muted mt-2">JPEG, PNG or GIF, up to 5 MB. {pendingPhoto ? 'This photo has not been saved. Use Save photo or Complete Registration.' : 'Saved photos appear here when you reopen this record.'}</p>
                              </div>

                              {/* Optional Credentials */}
                              <div className="col-md-7 ps-md-4">
                                   <h6 className="fw-bold text-dark fs-6 mb-2">Patient Portal Credentials (Optional)</h6>
                                   <p className="text-muted text-xs mb-3">Setup a client portal account for the patient to view online lab results.</p>

                                   <div className="row g-3">
                                        <div className="col-md-6">
                                             <label className="form-label text-xs fw-semibold text-uppercase text-muted mb-1">Username</label>
                                             <input
                                                  type="text"
                                                  className="form-control form-control-sm"
                                                  placeholder="Min 6 characters"
                                                  value={credentials.username}
                                                  disabled={isSubmitting}
                                                  onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                                             />
                                        </div>
                                        <div className="col-md-6">
                                             <label className="form-label text-xs fw-semibold text-uppercase text-muted mb-1">Password</label>
                                             <NewPasswordInput
                                                  id="registration-password"
                                                  type="password"
                                                  className="form-control form-control-sm"
                                                  placeholder="At least 12 characters"
                                                  value={credentials.password}
                                                  disabled={isSubmitting}
                                                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                                              confirmation />
                                        </div>
                                   </div>
                              </div>
                         </div>

                         <input
                              type="file"
                              id="patient-photo-file"
                              ref={fileInputRef}
                              accept="image/jpeg,image/png,image/gif"
                              disabled={isSubmitting}
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   e.target.value = '';
                                   if (file) {
                                        try {
                                             validatePatientImage(file);
                                             setPendingPhoto(file);
                                             setPhotoError('');
                                        } catch (error: any) { setPhotoError(error?.message || 'Choose a valid patient photo.'); }
                                   }
                              }}
                         />

                         <div className={styles.actionFooter}>
                              <Button
                                   variant="light"
                                   className="px-3"
                                   disabled={isSubmitting}
                                   onClick={() => setCurrentStep(2)}
                              >
                                   <RiArrowLeftLine size={18} /> Back to Emergency Contact
                              </Button>

                              <div className={styles.rightActions}>
                                   <Button
                                        variant="success"
                                        size="lg"
                                        className="px-4 fw-semibold d-inline-flex align-items-center gap-2"
                                        disabled={isSubmitting || savedPhoto.loading}
                                        onClick={handleSaveStep4}
                                   >
                                        {isSubmitting ? <Spinner size="sm" /> : <RiCheckboxCircleLine size={20} />}
                                        Complete Registration & Go to Billing
                                   </Button>
                              </div>
                         </div>
                    </div>
               )}

               {/* MATCHING PATIENTS FOUND MODAL */}
               <Modal
                    show={showPatientFoundModal}
                    onHide={() => setShowPatientFoundModal(false)}
                    backdrop="static"
                    size="xl"
               >
                    <Modal.Header closeButton>
                         <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
                              <RiSearchLine size={20} className="text-primary" /> Matching Patient Records Found
                         </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-3">
                         <p className="text-muted text-xs mb-3">
                              The following patient records match your search number. Select an existing patient to proceed directly to billing or edit their record.
                         </p>

                         <div className="table-responsive">
                              <table className="table table-hover align-middle text-sm mb-0">
                                   <thead className="table-light text-uppercase text-xs">
                                        <tr>
                                             <th>Patient Name</th>
                                             <th>Phone Number</th>
                                             <th>Gender & Age</th>
                                             <th>Registered Date</th>
                                             <th className="text-end">Actions</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {foundPatients.map((p, idx) => {
                                             const fullName = [p.firstname, p.middlename, p.lastname].filter(Boolean).join(' ');
                                             return (
                                                  <tr key={p.patientid || idx}>
                                                       <td className="fw-semibold text-primary">{fullName || 'Unnamed Patient'}</td>
                                                       <td>{p.matched_phone || p.mobile_number || 'N/A'}
                                                            {p.matched_priority && <small className="d-block text-capitalize">{p.matched_priority} � {p.matched_relationship}{p.matched_contact_name ? ` � ${p.matched_contact_name}` : ''}</small>}
                                                       </td>
                                                       <td className="text-capitalize">{p.gender || 'N/A'} · {p.age || 'N/A'} {p.agetype || ''}</td>
                                                       <td>{p.date ? new Date(p.date).toLocaleDateString() : 'N/A'}</td>
                                                       <td className="text-end">
                                                            <Button
                                                                 variant="success"
                                                                 size="sm"
                                                                 className="me-2"
                                                                 onClick={async () => {
                                                                      setShowPatientFoundModal(false);
                                                                      await goToBilling(Number(p.patientid));
                                                                 }}
                                                            >
                                                                 <RiCashFill size={14} className="me-1" /> Bill Patient
                                                            </Button>

                                                            <Button
                                                                 variant="outline-primary"
                                                                 size="sm"
                                                                 onClick={() => {
                                                                      setShowPatientFoundModal(false);
                                                                      setPatientId(p.patientid);
                                                                 }}
                                                            >
                                                                 Edit Profile
                                                            </Button>
                                                       </td>
                                                  </tr>
                                             );
                                        })}
                                   </tbody>
                              </table>
                         </div>
                    </Modal.Body>
                    <Modal.Footer>
                         <Button variant="secondary" size="sm" onClick={() => setShowPatientFoundModal(false)}>
                              Dismiss & Register New Patient
                         </Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}
