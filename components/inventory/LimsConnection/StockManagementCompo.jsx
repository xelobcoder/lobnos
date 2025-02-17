'use client'
import React, { useState } from "react";
import { useApplicationSettings } from "../../Auth/useApplicationContext";
import DocumentModal from "../../operations/Laboratory/DocumentInventoryDeductionLab";
import { Alert, Button } from "react-bootstrap";
import StockManagementSmallerScreen from "../../operations/Laboratory/stockMangementSmallerScreen";
import PrimeTable from "../../accessories/Datatables/PrimeTable";
import { handleServerSideProcessingAscensionData } from "../../serverActions/ActionFiltering";
import { RemoveRedEye } from "@mui/icons-material";


export default function StockManagementCompo({ascensionList}) {
     const { user, services } = useApplicationSettings().applicationsettings;
     const employeeid = user.employeeid;

     const [isLoading, setIsLoading] = useState(true);
     const [queryParams, setQueryParams] = useState({
          _dateFrom: null,
          _dateEnd: null,
          searchString: '',
          page: 1,
          count: 10,
          isUltrasound: false,
     });

     const [showModal, setShowModal] = useState(false);
     const [selectedDoc, setSelectedDoc] = useState(null);

     const columns = [
          { Header: 'Asc. ID', accessor: 'ascensionid' },
          { Header: 'BillID', accessor: 'billingid' },
          { Header: 'Full Name', accessor: 'fullname' },
          { Header: 'Age', accessor: 'age' },
          { Header: 'Patient ID', accessor: 'fullpatientid' },
          { Header: 'Billing Date', accessor: 'billing_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
          { Header: 'Department', accessor: 'department' },
          { Header: 'Ascension Date', accessor: 'ascension_date', Cell: ({ value }) => (value ? new Date(value).toLocaleString() : 'N/A') },
          { Header: 'Test Name', accessor: 'name' },
          { Header: 'Approval Status', accessor: 'approvalstatus', Cell: ({ value }) => (value === 1 ? 'Approved' : 'Pending') },
          {
               Header: 'Action',
               Cell: ({ row }) => (
                    <Button variant="outline-primary" className="btn-sm br-5 border-primary-2 border" onClick={() => handleActionClick(row.original)}>
                         <RemoveRedEye />
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


     if (services.isConnectedInventory === 0) {
          return (
               <Alert className="m-2 p-2 pls-color col-3">
                    <Alert.Heading style={{ fontSize: '14px' }} className="text-capitalize text-sm pls-color fw-bold">
                         Inventory services feature not activated
                    </Alert.Heading>
                    <hr />
               </Alert>
          );
     }

     return (
          <div>
               <h4 className="p-2 bg-secondary-subtle br-5">Stocks Management</h4>
               <section >
                    <PrimeTable
                         column={columns}
                         data={ascensionList}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessingAscensionData}
                         urlparams={{
                              _dateFrom: queryParams._dateFrom,
                              searchString: queryParams.searchString,
                              _dateEnd: queryParams._dateEnd,
                              isUltrasound: queryParams.isUltrasound,
                              employeeid,
                              ascension_stage: 'COMPLETED'
                         }}
                    />
               </section>
               <div className="d-block d-md-none">
                    <ul className="list-group m-0">
                         {ascensionList.map((item, index) => (
                              <StockManagementSmallerScreen
                                   key={index}
                                   item={item}
                                   handleActionClick={handleActionClick}
                              />
                         ))}\
                         =
                         0-89
                         ;z
                    </ul>
               </div>

               {selectedDoc && (
                    <DocumentModal selectedDoc={selectedDoc} showModal={showModal} handleCloseModal={handleCloseModal} />
               )}
          </div>
     );
}
