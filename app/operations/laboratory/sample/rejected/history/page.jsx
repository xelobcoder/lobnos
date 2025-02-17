"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { customFetch, customPost } from "../../../../../../components/Auth/customFetch";
import Loader from "../../../../../../components/accessories/Loader";
import { ToastContainer, toast } from 'react-toastify';
import { useApplicationSettings } from "../../../../../../components/Auth/useApplicationContext";
import { plsDecryption } from "../../../../../../lib/encryption";
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import { Modal, Button } from "react-bootstrap";
import { handlePaginationServerRejectedHistory } from "../../../../../../components/serverActions/ActionFiltering";

export default function RejectedSampleHistory() {
     const [isLoading, setLoading] = useState(false);
     const [dispute, setDispute] = useState('');
     const [logs, setLogs] = useState([]);
     const [showModal, setShowModal] = useState(false);
     let ascensionid = useSearchParams().get('ascensionid');
     const { user, branchid } = useApplicationSettings().applicationsettings;
     const employeeid = user?.employeeid;

     if (ascensionid) {
          ascensionid = plsDecryption(ascensionid);
     }

     useEffect(() => {
          async function getLogs() {
               if (employeeid && ascensionid) {
                    try {
                         setLoading(true);
                         const { data } = await customFetch(`sample/disputed/log/single?ascensionid=${ascensionid}&&branch=${branchid}&&page=1&&count=10`);
                         setLogs(Array.isArray(data) ? data : []);
                         setLoading(false);
                    } catch (err) {
                         setLoading(false);
                    }
               }
          }
          getLogs();
     }, [employeeid, ascensionid]);

     const handleDispute = async () => {
          if (dispute.length < 10) return;
          try {
               const body = { ascensionid, disputedby: employeeid, disputedon: new Date(), disputereason: dispute };
               const response = await customPost(`sample/rejection/disputed`, 'PUT', body);
               const { statusCode, status, message } = response;
               if (statusCode == 200 && status == 'success') {
                    toast.success(message, { autoClose: 2000, position: 'top-center' });
                    setDispute('');
                    setLoading(true);
                    setLogs((prev) => [body, ...prev]);
                    setLoading(false);
                    setShowModal(false);
               } else {
                    toast.error(message, { autoClose: 5000, position: 'top-center' });
               }
          } catch (err) {
               console.log(err);
               toast.error('Something wrong occurred', { autoClose: 1000 });
          }
     };

     const columns = [
          { Header: "#", accessor: "index", Cell: ({ row }) => row.index + 1 },
          { Header: "Date", accessor: "disputedon", Cell: ({ value }) => new Date(value).toLocaleDateString() },
          { Header: "Username", accessor: "username" },
          { Header: "Dispute Reason", accessor: "disputereason", Cell: ({ value }) => (<div style={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}>{value}</div>) }
     ];





     if (isLoading) return <Loader />;

     return (
          <div>
               <ToastContainer theme="dark" />
               <div className="d-flex justify-content-end">
                    <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                         Add New Dispute Note
                    </Button>
               </div>
               <div >
                    {logs.length > 0 && (
                         <PrimeTable column={columns} data={logs} filtering={false} serverSideFiltering={true}
                              urlparams={{ ascensionid, branchid }}
                              handleSeverSideProcessing={handlePaginationServerRejectedHistory} />
                    )}

               </div>
               <Modal backdrop="static" show={showModal} onHide={() => setShowModal(false)} size="lg">
                    <Modal.Header closeButton className=" bg-secondary-subtle pls-color">
                         <h5>{logs.length > 0 ? "Add Dispute Notes" : "New Dispute Note"}</h5>
                    </Modal.Header>
                    <Modal.Body>
                         <textarea
                              value={dispute}
                              onChange={(ev) => setDispute(ev.target.value)}
                              rows={5}
                              className="form-control"
                         />
                    </Modal.Body>
                    <Modal.Footer>
                         <Button size="sm" variant="danger" onClick={() => setShowModal(false)}>Close</Button>
                         <Button size="sm" variant="success" onClick={handleDispute}>Submit</Button>
                    </Modal.Footer>
               </Modal>
          </div>
     );
}