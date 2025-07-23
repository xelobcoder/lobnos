import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup } from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PreviewPatientInformation from "../../petientsComponent/PreviewPatientInformation";
import UseCustomResultTemplating from "../../ResutlUI/useCustomResultTemplating";
import UseResultCommentSingle from "../../ResutlUI/useResultCommentSingle";
import { customPost, getResultEntrySettings, ResultEntrydefaultData } from "../../Auth/customFetch";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import { getAscensionStaffApproved } from "./Lib";

const ValidationModal = ({ show, onClose, selectedAscension }) => {
     const { employeeid, role } = useApplicationSettings().applicationsettings.user;
     const [resultSettings, setResultSettings] = useState(ResultEntrydefaultData);
     const [staff, setStaff] = useState([]);
     const [pinValue, setPin] = useState('');
     const [sucessfulValidation, setSuccessfulValidation] = useState(null); 
     const [isApproved, setIsApproved] = useState(false);
     const [isMobile, setIsMobile] = useState(window.innerWidth > 768);
     // Remove Bootstrap Toast state, use react-toastify

     useEffect(() => {
          const handleResize = () => setIsMobile(window.innerWidth > 768);
          window.addEventListener("resize", handleResize);
          return () => window.removeEventListener("resize", handleResize);
     }, []);

     async function getInitData() {
          if (employeeid) {
               const [resultSettings, staffs] = await Promise.all([getResultEntrySettings(employeeid), getAscensionStaffApproved(selectedAscension.ascensionid, employeeid)]);
               setResultSettings(resultSettings);
               setStaff(staffs);
          }
     }

     useEffect(() => { getInitData() }, []);

     const handleAddApproved = () => {
          if (isApproved && pinValue.toString().length > 0) {
               if (staff.length < resultSettings.maximumResultValidation) {
                    setIsApproved(true);
                    setStaff([...staff, { username: selectedAscension.fullname, employeeid, ascensionid: selectedAscension.ascensionid }]);
               }
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
          const { ascensionid } = selectedAscension;

          if (!pinValue || pinValue.toString().length === 0) {
               toast.warn('Pin Must be filled before saving');
               return;
          }

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
     };

     return (
          <Modal show={show} onHide={onClose} size='xl' backdrop={false}>
               <Modal.Header closeButton className="fw-bold bg-secondary-subtle">
                    <Modal.Title>Result Validation</Modal.Title>
               </Modal.Header>
               <Modal.Body>
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
                    <ListGroup>
                         <ListGroup.Item className="fw-bold bg-secondary-subtle">Approvals</ListGroup.Item>
                         <ListGroup.Item>
                              <div className="form-group d-flex justify-content-between">
                                   <h6>Do you approve this result?</h6>
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
                                        <button onClick={handleAddApproved} className="btn btn-sm btn-light">Approve</button>
                                   </div>
                              </ListGroup.Item>
                         )}
                    </ListGroup>
                    {Array.isArray(staff) && staff.length > 0 && (
                         <ListGroup className="my-3">
                              <ListGroup.Item className="bg-secondary-subtle fw-bold">Approved By this Staffs</ListGroup.Item>
                              {staff.map((item, index) => (
                                   <ListGroup.Item key={index} className="text-capitalize pls-color d-flex justify-content-between">
                                        <span>{item.username}</span>
                                        {role == "admin" && <span><button className="btn  btn-outline-danger btn-sm" disabled>Remove Validation</button></span>}
                                   </ListGroup.Item>
                              ))}
                         </ListGroup>
                    )}
               </Modal.Body>
               <Modal.Footer>
                    <Button variant="secondary" onClick={(ev) => { onClose(sucessfulValidation)}}>Close</Button>
                    <Button variant="primary" onClick={handleSaveValue}>Validate</Button>
               </Modal.Footer>
               <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
          </Modal>
     );
};

export default ValidationModal;
