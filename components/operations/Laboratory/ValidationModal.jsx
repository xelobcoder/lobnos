import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import PreviewPatientInformation from "../../petientsComponent/PreviewPatientInformation";
import UseCustomResultTemplating from "../../ResutlUI/useCustomResultTemplating";
import UseResultCommentSingle from "../../ResutlUI/useResultCommentSingle";
import { customFetch, customPost, getResultEntrySettings, ResultEntrydefaultData, validatePin } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import styles from "./ValidationModal.module.css";


const ValidationModal = ({ show, onClose, selectedAscension, isBulk }) => {
     const { employeeid } = useApplicationSettings().applicationsettings.user;
     const [resultSettings, setResultSettings] = useState(ResultEntrydefaultData);
     const [staff, setStaff] = useState([]);
     const [snapshots, setSnapshots] = useState({});
     const [snapshotsReady, setSnapshotsReady] = useState(false);
     const [reviewKey,setReviewKey]=useState(0);
     const [snapshotError, setSnapshotError] = useState('');
     const snapshotRequest = useRef(0);
     const [pinValue, setPin] = useState('');
     const [successfulValidation, setSuccessfulValidation] = useState(null);
     const [isApproved, setIsApproved] = useState(false);
     const [isPinValidated, setIsPinValidated] = useState(false);
     const [validatingSpinner, setValidatingSpinner] = useState(false);
     const ascensions = Array.isArray(selectedAscension) ? selectedAscension : [selectedAscension];
     const { settings } = useApplicationSettings().applicationsettings;
     const pinOnResultValidation = settings?.pinOnResultValidation == 1 ? true : false;


     // Auto-approve when PIN is not required and user checks the approve toggle
     useEffect(() => {
          if (!pinOnResultValidation && isApproved && !isBulk) {
               const alreadyApproved = staff.some(s => s.employeeid === employeeid);
               if (!alreadyApproved) {
                    setStaff([...staff, { username: selectedAscension.fullname, employeeid, ascensionid: selectedAscension.ascensionid }]);
                    setIsPinValidated(true);
               }
          }
     }, [isApproved, pinOnResultValidation, isBulk]);


     const paymentBlocked = Object.values(snapshots).some(snapshot => snapshot.payment_allowed === false);
     const disableButton = () => {
          if (paymentBlocked) return true;
          if (!snapshotsReady || validatingSpinner) return true;
          if (pinOnResultValidation) {
               return isBulk ? !isApproved || !pinValue : !isPinValidated
          }
          // When PIN is not required, enable if approved and staff has current user
          return isBulk ? !isApproved : !(isApproved && staff.some(s => s.employeeid === employeeid));
     }

     const selectionKey = ascensions.map(item => item?.ascensionid).join(',');
     async function getInitData() {
          const request = ++snapshotRequest.current;
          setSnapshotsReady(false); setSnapshotError(''); setIsApproved(false); setIsPinValidated(false); setPin(''); setStaff([]);
          try {
               const [nextSettings, details] = await Promise.all([
                    getResultEntrySettings(employeeid),
                    Promise.all(ascensions.map(asc => customFetch(`test/approval/get/staffQualifiedToValidationResult?ascensionid=${asc.ascensionid}`))),
               ]);
               if (request !== snapshotRequest.current) return;
               if (details.some(item => !Array.isArray(item?.staff) || !Number.isSafeInteger(item.approval_revision))) throw new Error('Unable to load the current result revision. Reload before validating.');
               setResultSettings(nextSettings);
               setSnapshots(Object.fromEntries(ascensions.map((asc, index) => [asc.ascensionid, details[index]])));
               if (!isBulk) setStaff(details[0].staff);
               setReviewKey(request);
               setSnapshotsReady(true);
          } catch (error) { if (request === snapshotRequest.current) setSnapshotError(error.message || 'Unable to load result revisions'); }
     }
     useEffect(() => { if (show && employeeid) void getInitData(); return () => { snapshotRequest.current++; }; }, [show, selectionKey, employeeid, isBulk]);

     const handleAddApproved = async () => {
          setValidatingSpinner(true);
          try {
               if (isApproved) {
                    // If PIN validation is required, validate PIN first
                    if (pinOnResultValidation) {
                         if (!pinValue || pinValue.toString().length === 0) {
                              toast.warn('PIN is required for approval');
                              setValidatingSpinner(false);
                              return;
                         }
                         const response = await validatePin(employeeid, pinValue);
                         if (response?.status !== true) {
                              toast.error(response?.message || 'PIN validation failed');
                              setIsPinValidated(false);
                              setValidatingSpinner(false);
                              return;
                         }
                         setIsPinValidated(true);
                    } else {
                         // PIN not required, directly approve
                         setIsPinValidated(true);
                    }

                    if (staff.length < resultSettings.maximumResultValidation) {
                         setStaff([...staff, { username: selectedAscension.fullname, employeeid, ascensionid: selectedAscension.ascensionid }]);
                    }
               }
               setValidatingSpinner(false);
          } catch (error) {
               console.error("Error adding approved staff:", error);
               setIsPinValidated(false);
               setValidatingSpinner(false);
          }
     };


     const handleCheck = (ev) => {
          const { checked } = ev.target;
          setIsApproved(checked);
          if (checked == false && staff.length > 0) {
               const unMatched = staff.filter((item) => item.employeeid !== employeeid);
               setStaff(unMatched);
          }
     }

     const handleSaveValue = async () => {
          if (validatingSpinner || !snapshotsReady || paymentBlocked) return;
          if (isBulk && Array.isArray(ascensions) && ascensions.length > 0) {
               try {
                    setValidatingSpinner(true);
                    if(pinOnResultValidation){const pinResponse=await validatePin(employeeid,pinValue);if(pinResponse?.status!==true)throw new Error(pinResponse?.message||'PIN validation failed');}
                    const results=await Promise.all(ascensions.map(asc=>customPost('test/approval/get/staffQualifiedToValidationResult?ascensionid='+asc.ascensionid,'PUT',{employeeid,ascensionid:asc.ascensionid,approval_revision:snapshots[asc.ascensionid]?.approval_revision})));
                    const allSuccess = results.every(r => r.status === true);

                    if (allSuccess) {
                         const finalizedIds = selectedAscension.filter((a, index) => results[index]?.finalized).map(a => a.ascensionid);
                         if (!finalizedIds.length) { toast.info('Your approvals were recorded. Other validators are still required.'); onClose(selectedAscension.map(a => a.ascensionid)); return; }
                         toast.success('Approvals recorded; finalized results are ready');
                         const successfulValidation = finalizedIds;
                         setSuccessfulValidation(successfulValidation);
                         onClose(successfulValidation);
                    } else {
                         const failedCount = results.filter(r => r.status !== true).length;
                         toast.error(`${failedCount} test(s) need review: ${results.find(r => r.status !== true)?.message || 'validation failed'}`);
                         await getInitData();
                    }
               } catch (error) {
                    toast.error(error.message || "Error during bulk validation");
               } finally {
                    setValidatingSpinner(false);
               }
          } else if (!isBulk && selectedAscension) {
               // Single validation
               const { ascensionid } = selectedAscension;

               // Check if approval is satisfied (with or without PIN depending on settings)
               const isApprovalSatisfied = isApproved && staff.length > 0;

               if (isApprovalSatisfied) {
                    const currentStaffApproval = staff.filter((a) => a.employeeid === employeeid);
                    if (currentStaffApproval.length > 0) {
                         setValidatingSpinner(true);
                         try {
                         const sendReponse = await customPost(`test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${ascensionid}&&ascensionId=${ascensionid}`, 'PUT', { ...currentStaffApproval[0], approval_revision: snapshots[ascensionid]?.approval_revision });
                         const { status } = sendReponse;
                         if (status === true) {
                              setStaff(sendReponse.staff || []);
                              setSnapshots(current => ({ ...current, [ascensionid]: { ...current[ascensionid], staff: sendReponse.staff || [] } }));
                              if (!sendReponse.finalized) { toast.info('Your approval was recorded. Other validators are still required.'); onClose(selectedAscension.ascensionid); return; }
                              toast.success('Result finalized');
                              setSuccessfulValidation(selectedAscension.ascensionid);
                              onClose(selectedAscension.ascensionid);
                         } else {
                              toast.error(sendReponse?.message || 'Validation failed');
                              await getInitData();
                              setSuccessfulValidation(null);
                         }
                         } catch (error) { toast.error(error.message || 'Validation failed'); } finally { setValidatingSpinner(false); }
                    }
               }
          }
     };

     return (
          <>
               <Modal show={show} onHide={() => { if (!validatingSpinner) onClose(successfulValidation); }} size="xl" scrollable backdrop="static" dialogClassName={styles.dialog}>
                    <Modal.Header closeButton={!validatingSpinner} className={styles.header}>
                         <div>
                              <Modal.Title className="h5 fw-bold mb-1">{isBulk ? `Bulk Result Validation (${ascensions.length} ${ascensions.length === 1 ? 'test' : 'tests'})` : 'Result Validation'}</Modal.Title>
                              <p className="small text-muted mb-0">Review the patient, current values, and comments before recording your approval.</p>
                         </div>
                    </Modal.Header>
                    <Modal.Body className={styles.body}>
                         <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                              <span className="small fw-semibold text-muted">Current revision review{isBulk ? ` - ${ascensions.length} selected tests` : ''}</span>
                              <Button variant="outline-secondary" size="sm" disabled={validatingSpinner || (!snapshotsReady && !snapshotError)} onClick={getInitData}>Reload latest results</Button>
                         </div>
                         {snapshotError && <div role="alert" className="alert alert-danger mb-3"><strong>Unable to load this review.</strong><div>{snapshotError}</div><div className="small mt-1">Reload latest results before approving.</div></div>}
                         {!snapshotsReady ? <div role="status" className="text-center py-5"><Spinner as="span" size="sm" aria-hidden="true" /> <span className="ms-2">{snapshotError ? 'Approval is unavailable until the review loads.' : 'Loading current result revisions...'}</span></div> : <>
                         {Object.values(snapshots).some(item => item.requires_revalidation) && <div role="alert" className="alert alert-warning mb-3"><strong>Updated result - revalidation required</strong><div className="small mt-1">These values changed after validation. Review them again; previous approvals do not apply to this revision.</div></div>}
                         <div className={styles.layout}>
                              <div className="d-grid gap-3">
                                   {ascensions.map((asc, idx) => (
                                        <section key={asc.ascensionid} className={styles.review} aria-label={`Result review: ${asc.name || asc.test || 'selected test'}`}>
                                             <div className={styles.sectionHeading}>
                                                  <div><h2 className="h6 fw-bold mb-1">{isBulk ? `${idx + 1}. ` : ''}{asc.name || asc.test || 'Test results'}</h2><div className="small text-muted">Ordered test #{asc.ascensionid}</div></div>
                                                  <span className="badge rounded-pill text-bg-light border">Revision {snapshots[asc.ascensionid]?.approval_revision}</span>
                                             </div>
                                             <div className={styles.patient}><PreviewPatientInformation patientid={asc.patientid} compact /></div>
                                             <div className={styles.results}>
                                                  <UseCustomResultTemplating key={`result-${reviewKey}-${asc.ascensionid}`} isResultView={false}
                                                       testid={asc.id} patientid={asc.patientid} test={asc.test || ""} billingid={asc.billingid} />
                                             </div>
                                             <section className={styles.comments} aria-label="Result comments">
                                                  <h3 className="h6 fw-semibold mb-2">Comments</h3>
                                                  <UseResultCommentSingle key={`comment-${reviewKey}-${asc.ascensionid}`} reviewMode
                                                       patientid={asc.patientid} testid={asc.id} billingid={asc.billingid} />
                                             </section>
                                        </section>
                                   ))}
                              </div>
                              <aside className={styles.approval} aria-label="Approval review">
                                   <div className={styles.sectionHeading}><h2 className="h6 fw-bold mb-0">Your approval</h2></div>
                                   <div className={styles.approvalBody}>
                                        {paymentBlocked && <div role="alert" className="alert alert-warning">Payment is required before validating one or more selected services. Reload after payment or review your selection.</div>}
                                        <p className="small text-muted">Recorded as your signed-in account. Final release requires all configured validators to approve this revision.</p>
                                        <Form.Check id="result-review-confirmation" type="checkbox" checked={isApproved} disabled={validatingSpinner || paymentBlocked}
                                             onChange={handleCheck} label={isBulk ? 'I have reviewed the current results for every selected test.' : 'I have reviewed the patient details and current results.'} />
                                        {isApproved && pinOnResultValidation && <div className="mt-3">
                                             <label className="form-label small fw-semibold" htmlFor="result-validation-pin">Your secure PIN</label>
                                             <input id="result-validation-pin" autoComplete="new-password" autoCorrect="off" inputMode="numeric"
                                                  name="pin" value={pinValue} disabled={validatingSpinner}
                                                  onChange={ev => { setPin(ev.target.value); setIsPinValidated(false); }}
                                                  className="form-control" type="password" />
                                             {!isBulk && <Button variant={isPinValidated ? 'outline-success' : 'outline-primary'} size="sm" className="mt-2 w-100"
                                                  disabled={validatingSpinner || !pinValue || isPinValidated} onClick={handleAddApproved}>
                                                  {validatingSpinner && <Spinner animation="border" size="sm" className="me-2" />}
                                                  {isPinValidated ? 'PIN verified' : 'Verify PIN'}
                                             </Button>}
                                        </div>}
                                        {isApproved && <div className="small text-muted mt-3">Your approval is not saved until you select <strong>{isBulk ? 'Record all approvals' : 'Record approval'}</strong>.</div>}
                                        <hr className="my-4" />
                                        <h3 className="h6 mb-3">Recorded approvals</h3>
                                        {ascensions.map(asc => {
                                             const recorded = snapshots[asc.ascensionid]?.staff || [];
                                             return <div key={asc.ascensionid} className="mb-3">
                                                  {isBulk && <div className="small fw-semibold mb-1">{asc.name || asc.test || `Test #${asc.ascensionid}`}</div>}
                                                  <div className="small text-muted mb-2">{recorded.length} recorded{Number(resultSettings.minimumResultValidation) > 0 ? ` / ${resultSettings.minimumResultValidation} required` : ''} for this revision</div>
                                                  {recorded.length ? <ul className="list-unstyled mb-0">{recorded.map(item => <li key={item.employeeid} className="small border rounded px-2 py-2 mb-1">{item.username || `Employee #${item.employeeid}`}{Number(item.employeeid) === Number(employeeid) ? ' (you)' : ''}</li>)}</ul> : <p className="small text-muted mb-0">No approvals recorded yet.</p>}
                                             </div>;
                                        })}
                                   </div>
                              </aside>
                         </div>
                         </>}
                    </Modal.Body>
                    <Modal.Footer className={styles.footer}>
                         <span className="small text-muted">Approval applies only to the reviewed revision.</span>
                         <div className="d-flex gap-2">
                              <Button variant="outline-secondary" disabled={validatingSpinner} onClick={() => onClose(successfulValidation)}>Close</Button>
                              <Button variant="primary" onClick={handleSaveValue} disabled={validatingSpinner || disableButton()}>
                                   {validatingSpinner && <Spinner animation="border" size="sm" className="me-2" />}
                                   {validatingSpinner ? 'Recording approval...' : isBulk ? 'Record all approvals' : 'Record approval'}
                              </Button>
                         </div>
                    </Modal.Footer>
               </Modal>

          </>
     );
};

export default ValidationModal;
