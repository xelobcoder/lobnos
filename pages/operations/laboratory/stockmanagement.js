import React, { useEffect, useState } from "react";
import LaboratoryLayout from "../../../components/Layout/LaboratoryLayout";
import { getAscensionData } from "../../../components/operations/Laboratory/Lib";
import { useApplicationSettings } from "../../../components/Auth/useApplicationContext";
import TableDisplay from "../../../components/accessories/TableDisplay";
import DocumentModal from "../../../components/operations/Laboratory/DocumentInventoryDeductionLab";
import { Alert, Button } from "react-bootstrap";
import StockManagementSmallerScreen from "../../../components/operations/Laboratory/stockMangementSmallerScreen";
import Loader from "../../../components/accessories/Loader";


export default function StockManagement() {
     const { user, services } = useApplicationSettings().applicationsettings;
     const employeeid = user.employeeid;

     if (services.isConnectedInventory === 0) {
          return (
               <LaboratoryLayout>
                    <Alert className="m-2 p-2 pls-color" dismissible>
                         <Alert.Heading className="text-capitalize text-sm pls-color">
                              Inventory services feature not activated
                         </Alert.Heading>
                         <hr />
                    </Alert>
               </LaboratoryLayout>)
     }

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
          { Header: 'Full Name', accessor: 'fullname', isMenu: true, },
          { Header: 'Age', accessor: 'age' },
          { Header: 'Patient ID', accessor: 'patientid', isMenu: true },
          { Header: 'Billing ID', accessor: 'billingid' },
          { Header: 'Billing Date', accessor: 'billing_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
          { Header: 'Department', accessor: 'department' },
          { Header: 'Ascension ID', accessor: 'ascensionid' },
          {
               Header: 'Ascension Date', accessor: 'ascension_date',
               Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A')
          },
          { Header: 'Test Name', accessor: 'name', isMenu: true, },
          { Header: 'Approval Status', accessor: 'approvalstatus', Cell: ({ value }) => (value === 1 ? 'Approved' : 'Pending') },
          {
               Header: 'Action',
               sortable: false,
               filterable: false,
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


     if (isLoading) return <Loader />
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
                         {ascensionList.map((item, index) => <StockManagementSmallerScreen key={index} item={item} handleActionClick={handleActionClick} />)}
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
