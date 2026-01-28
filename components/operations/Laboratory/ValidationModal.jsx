import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Spinner } from "react-bootstrap";
import { toast } from 'react-toastify';
import PreviewPatientInformation from "../../petientsComponent/PreviewPatientInformation";
import UseCustomResultTemplating from "../../ResutlUI/useCustomResultTemplating";
import UseResultCommentSingle from "../../ResutlUI/useResultCommentSingle";
import { customFetch, customPost, getResultEntrySettings, ResultEntrydefaultData, validatePin } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import { getAscensionStaffApproved } from "./Lib";

const ValidationModal = ({ show, onClose, selectedAscension, isBulk }) => {
     const { employeeid, role } = useApplicationSettings().applicationsettings.user;
     const [resultSettings, setResultSettings] = useState(ResultEntrydefaultData);
     const [staff, setStaff] = useState([]);
     const [pinValue, setPin] = useState('');
     const [sucessfulValidation, setSuccessfulValidation] = useState(null);
     const [isApproved, setIsApproved] = useState(false);
     const [isMobile, setIsMobile] = useState(window.innerWidth > 768);
     const [isPinValidated, setIsPinValidated] = useState(false);
     const [validatingSpinner, setValidatingSpinner] = useState(false);
     const ascensions = Array.isArray(selectedAscension) ? selectedAscension : [selectedAscension];
     // Remove Bootstrap Toast state, use react-toastify

     useEffect(() => {
          const handleResize = () => setIsMobile(window.innerWidth > 768);
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
     }, []);

     async function getInitData() {
          if (employeeid && !isBulk) {
               const [resultSettings, staffs] = await Promise.all([getResultEntrySettings(employeeid), getAscensionStaffApproved(selectedAscension.ascensionid, employeeid)]);
               setResultSettings(resultSettings);
               setStaff(staffs);
          } else if (isBulk && employeeid) {
               const resultSettings = await getResultEntrySettings(employeeid);
               setResultSettings(resultSettings);
          }
     }

     useEffect(() => { getInitData() }, []);

     const handleAddApproved = async () => {
          setValidatingSpinner(true);
          try {
               if (isApproved && pinValue.toString().length > 0) {
                    // Validate PIN first
                    const { status, message } = await validatePin(employeeid, pinValue);
                    if (status == false) {
                         setIsPinValidated(false);
                         toast.error(message || 'PIN validation failed');
                    }
                    setIsPinValidated(true);
                    if (status && staff.length < resultSettings.maximumResultValidation) {
                         setIsApproved(true);
                         setStaff([...staff, { username: selectedAscension.fullname, employeeid, ascensionid: selectedAscension.ascensionid }]);
                    }
               }
               setValidatingSpinner(false);
          } catch (error) {
               console.error("Error adding approved staff:", error);
               setIsPinValidated(false);
          } finally {
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
          if (!pinValue || pinValue.toString().length === 0) {
               toast.warn('Pin Must be filled before saving');
               return;
          }

          if (isBulk && Array.isArray(ascensions) && ascensions.length > 0) {
               // Bulk validation
               const validationPromises = ascensions.map(asc => {
                    return customPost(`test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${asc.ascensionid}&&ascensionId=${asc.ascensionid}`, 'PUT', { username: asc.fullname, employeeid, ascensionid: asc.ascensionid });
               });

               try {
                    setValidatingSpinner(true);
                    const results = await Promise.all(validationPromises);
                    const allSuccess = results.every(r => r.status === true);

                    if (allSuccess) {
                         toast.success(`All ${ascensions.length} tests validated successfully`);
                         setSuccessfulValidation(true);
                         onClose();
                    } else {
                         const failedCount = results.filter(r => r.status !== true).length;
                         toast.error(`${failedCount} test(s) failed validation`);
                    }
               } catch (error) {
                    console.error("Error in bulk validation:", error);
                    toast.error("Error during bulk validation");
               } finally {
                    setValidatingSpinner(false);
               }
          } else if (!isBulk && selectedAscension) {
               // Single validation
               const { ascensionid } = selectedAscension;

               if (pinValue && isApproved && staff.length > 0) {
                    const currentStaffApproval = staff.filter((a) => a.employeeid === employeeid);
                    if (currentStaffApproval.length > 0) {
                         const sendReponse = await customPost(`test/approval/get/staffQualifiedToValidationResult?employeeid=${employeeid}&&ascensionid=${ascensionid}&&ascensionId=${ascensionid}`, 'PUT', currentStaffApproval[0]);
                         const { status } = sendReponse;
                         if (status === true) {
                              toast.success('Validation successful');
                              setSuccessfulValidation(selectedAscension.ascensionid);
                         } else {
                              toast.error(sendReponse?.message || 'Validation failed');
                              setSuccessfulValidation(null);
                         }
                    }
               }
          }
     };

     return (
          <Modal show={show} onHide={onClose} size='xl' backdrop={false}>
               <Modal.Header closeButton className="fw-bold bg-secondary-subtle">
                    <Modal.Title>{isBulk ? `Bulk Validation (${ascensions.length} tests)` : 'Result Validation'}</Modal.Title>
               </Modal.Header>
               <Modal.Body>
                    {!isBulk ? (
                         <>
                              <PreviewPatientInformation patientid={selectedAscension.patientid} />
                              <h5></h5>
                              <div style={{ overflowX: 'auto' }} className="my-3">
                                   <UseCustomResultTemplating
                                        isResultView={false}
                                        testid={selectedAscension.id}
                                        patientid={selectedAscension.patientid}
                                        test={selectedAscension.test || ""}
                                        billingid={selectedAscension.billingid}
                                   />
                              </div>
                              <ListGroup className="my-2">
                                   <ListGroup.Item className="bg-secondary-subtle fw-bold">Comments</ListGroup.Item>
                                   <ListGroup.Item>
                                        <UseResultCommentSingle
                                             patientid={selectedAscension.patientid}
                                             testid={selectedAscension.id}
                                             billingid={selectedAscension.billingid}
                                        />
                                   </ListGroup.Item>
                              </ListGroup>
                         </>
                    ) : (
                         <div>
                              <h6 className="mb-3">Validating {ascensions.length} tests with a single PIN:</h6>
                              <ListGroup className="mb-3">
                                   {ascensions.map((asc, idx) => (
                                        <ListGroup.Item key={idx} className="text-capitalize">
                                             <small><strong>{idx + 1}.</strong> {asc.fullname} - {asc.name}</small>
                                        </ListGroup.Item>
                                   ))}
                              </ListGroup>
                         </div>
                    )}
                    <ListGroup>
                         <ListGroup.Item className="fw-bold bg-secondary-subtle">Approvals</ListGroup.Item>
                         <ListGroup.Item>
                              <div className="form-group d-flex justify-content-between">
                                   <h6>{isBulk ? 'Approve all selected tests?' : 'Do you approve this result?'}</h6>
                                   <Form.Switch
                                        checked={isApproved}
                                        onChange={(ev) => { handleCheck(ev) }}
                                        style={{ fontSize: '24px' }}
                                   />
                              </div>
                         </ListGroup.Item>
                         {isApproved && (
                              <ListGroup.Item>
                                   <div className="grid-reg">
                                        <label htmlFor="pin">PIN</label>
                                        <input autoComplete="new-password"
                                             autoCorrect="off"
                                             name="pin" value={pinValue} onChange={(ev) => { setPin(ev.target.value) }} className="custom-input" type="password" />
                                   </div>
                                   <div className="d-flex justify-content-end mt-2">
                                        <button onClick={handleAddApproved} className="btn btn-sm btn-light">
                                             {validatingSpinner && <Spinner animation="border" size="sm" />}
                                             Approve</button>
                                   </div>
                              </ListGroup.Item>
                         )}
                    </ListGroup>
                    {!isBulk && Array.isArray(staff) && staff.length > 0 && (
                         <ListGroup className="my-3">
                              <ListGroup.Item className="bg-secondary-subtle fw-bold">Approved By this Staffs</ListGroup.Item>
                              {Array.isArray(staff) && staff.length > 0 && staff.map((item, index) => (
                                   <ListGroup.Item key={index} className="text-capitalize pls-color d-flex justify-content-between">
                                        <span>{item.username}</span>
                                        {role == "admin" && <span><button className="btn  btn-outline-danger btn-sm" disabled>Remove Validation</button></span>}
                                   </ListGroup.Item>
                              ))}
                         </ListGroup>
                    )}
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={(ev) => { onClose(sucessfulValidation) }}>Close</Button>
                    <Button variant="primary" onClick={handleSaveValue} disabled={isBulk ? !isApproved || !pinValue : !isPinValidated}>{isBulk ? 'Validate All' : 'Validate'}</Button>
               </Modal.Footer>
          </Modal>
     );
};

export default ValidationModal;
