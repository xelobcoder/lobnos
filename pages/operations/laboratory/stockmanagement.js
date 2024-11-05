import React, { useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { getAscensionData } from "../../../components/operations/Laboratory/Lib";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import TableDisplay from "../../../components/accessories/TableDisplay";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DocumentModal from "../../../components/operations/Laboratory/DocumentInventoryDeductionLab";
import { Button } from "react-bootstrap";

export default function StockManagement() {
     const employeeid = useApplicationSettings().applicationsettings.user.employeeid;
     const [ascensionList, setAscensionList] = useState([]);
     const [isLoading, setIsLoading] = useState(true);
     const [queryParams, setQueryParams] = useState({
          _dateFrom: null,
          _dateEnd: null,
          searchString: '',
          page: 1,
          count: 10,
          isUltrasound: false
     });

     const [showModal, setShowModal] = useState(false);
     const [selectedDoc, setSelectedDoc] = useState(null);

     const columns = [
          { Header: 'Full Name', accessor: 'fullname' },
          { Header: 'Age', accessor: 'age' },
          { Header: 'Patient ID', accessor: 'patientid' },
          { Header: 'Billing ID', accessor: 'billingid' },
          { Header: 'Billing Date', accessor: 'billing_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
          { Header: 'Department', accessor: 'department' },
          { Header: 'Ascension ID', accessor: 'ascensionid' },
          { Header: 'Ascension Date', accessor: 'ascension_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
          { Header: 'Test Name', accessor: 'name' },
          { Header: 'Approval Status', accessor: 'approvalstatus', Cell: ({ value }) => (value === 1 ? 'Approved' : 'Pending') },
          {
               Header: 'Action',
               Cell: ({ row }) => (
                    <Button variant="outline-primary" className="btn-sm br-0" onClick={() => handleActionClick(row.original)}>
                         View Details
                    </Button>
               ),
          },
     ];

     const handleActionClick = (doc) => {
          setSelectedDoc(doc);
          setShowModal(true);
     };

     const handleCloseModal = () => {
          setShowModal(false);
          setSelectedDoc(null);
     };

     useEffect(() => {
          getAscensionData('COMPLETED', setAscensionList, queryParams, setIsLoading, employeeid);
     }, []);

     return (
          <LaboratoryLayout>
               <h4>Stocks Management</h4>

               {/* Table view for larger screens */}
               <div className="d-none d-md-block">
                    <section style={{ overflowX: 'auto' }}>
                         <TableDisplay filtering={true} data={ascensionList} column={columns} />
                    </section>
               </div>

               {/* List view for smaller screens */}
               <div className="d-block d-md-none">
                    <ul className="list-group m-0">
                         {ascensionList.map((item) => (
                              <React.Fragment key={item.ascensionid}>
                                   <li className="list-group-item bg-secondary-subtle fw-bold text-capitalize">
                                        {item.fullname} ({item.patientid})
                                   </li>
                                   <div className="list-group-item">
                                        <div className="d-flex flex-column pls-color">
                                             <span>Ascension ID: {item.ascensionid}</span>
                                             <span>Unit: {item.department}</span>
                                             <span>Test: {item.name}</span>
                                             <span>Deduction Quantity: {item.quantity}</span>
                                        </div>
                                   </div>
                                   <div className="list-group-item d-flex justify-content-end">
                                        <span
                                             onClick={() => handleActionClick(item)}
                                             aria-label="View"
                                        >
                                             <VisibilityIcon />
                                        </span>
                                   </div>
                              </React.Fragment>
                         ))}
                    </ul>
               </div>

               {selectedDoc && <DocumentModal
                    selectedDoc={selectedDoc}
                    showModal={showModal}
                    handleCloseModal={handleCloseModal}
               />} 
          </LaboratoryLayout>
     );
}
