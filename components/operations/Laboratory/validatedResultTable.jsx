import React, { useState, useEffect } from 'react';
import { PrepareResultEntryHeader } from '../../Auth/customFetch';
// Handler for Print Multiple Results
function handlePrintMultipleResults(row) {
     const { testid, name, patientid, ascensionid, billingid } = row.original;
     const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
     const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
     const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=false&&multiple`;
     window.open(`/result/lab-report-multiple?${url}`);
}
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { ListGroup, Dropdown } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Loader from '../../accessories/Loader';
import { customFetch, generateRandomTextAndNumbers } from '../../Auth/customFetch';
import { handleServerSideProcessingAscensionData } from '../../serverActions/ActionFiltering';
import { RiMoreLine } from '@remixicon/react';
import { useApplication } from '../../Auth/useApplicationContext';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import dayjs from 'dayjs';


const Print = (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path d="M17 2C17.5523 2 18 2.44772 18 3V7H21C21.5523 7 22 7.44772 22 8V18C22 18.5523 21.5523 19 21 19H18V21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21V19H3C2.44772 19 2 18.5523 2 18V8C2 7.44772 2.44772 7 3 7H6V3C6 2.44772 6.44772 2 7 2H17ZM16 17H8V20H16V17ZM20 9H4V17H6V16C6 15.4477 6.44772 15 7 15H17C17.5523 15 18 15.4477 18 16V17H20V9ZM8 10V12H5V10H8ZM16 4H8V7H16V4Z"></path>
     </svg>
);

const MobileDataDisplay = ({ data, handleResult }) => {

     return (
          <React.Fragment>
               {data.map((item, index) => (
                    <ListGroup className='my-2' key={index}>
                         <ListGroup.Item className="fw-bold text-capitalize d-flex justify-content-between">
                              <div className="d-flex align-items-center">
                                   <span
                                        className='rounded-circle d-flex align-items-center justify-content-center bg-dark text-white me-2'
                                        style={{ width: '30px', height: '30px' }}
                                   >
                                        {index + 1}
                                   </span>
                                   <span>{item.fullname} ({item.patientid})</span>
                              </div>
                              <div>
                                   <button className='btn btn-light shadow' onClick={(ev) => { handleResult(item) }}>
                                        {Print}
                                   </button>
                              </div>
                         </ListGroup.Item>
                         <ListGroup.Item className='pls-color'>
                              <span>{item.name} <small className="text-muted">({item.department})</small></span>
                              <hr />
                              <span>Validators:</span>
                              <ul className="list-unstyled">
                                   {item.validators.map((validator, idx) => (
                                        <li key={idx}>
                                             <strong>{validator.username}</strong> ({validator.role})
                                        </li>
                                   ))}
                              </ul>
                         </ListGroup.Item>
                    </ListGroup>
               ))}
          </React.Fragment>
     );
};

export default function ValidatedResultTable({ employeeid }) {
     const { isLoading, collection, queryParams, setQueryParams } = useLaboratoryContext();
     const [isClient, setIsClient] = useState(false);
     const branchid = useApplication().branchid;


     const viewResultHandler = (item, multiple = false) => {
          const { testid, name, patientid, ascensionid, billingid } = item;
          const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
          const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
          const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&employeeid=${employeeid}&&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=${multiple}&&isUltrasound=false&&is_password_encrypted=false&&password=`;
          window.open(`/result/labreport?${url}`);
     };



     useEffect(() => {
          setIsClient(true);
     }, []);

     const isMobile = useMediaQuery({ maxWidth: 768 });


     const handleBrowserView = (data) => {
          const { testid, name, patientid, ascensionid, billingid } = data
          const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
          const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
          const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=`
          window.open(`/result/labreport/4?${url}`)
     }






     const downloadSvg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path></svg>


     const EmailSvg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path></svg>

     const columns = [
          {Header: 'Ascension ID', accessor: 'ascensionid'},
          {
               Header: 'Ascension Date',
               accessor: 'ascension_date',
               Cell: ({ row }) => <div>{dayjs(row.original.ascension_date).format('DD-MM-YYYY hh:mm:ss')}</div>
          },
          {
               Header: 'Patient ID',
               accessor: 'fullpatientid'
          },
          {
               Header: 'Full Name',
               accessor: 'fullname',
               Cell: ({ row }) => <div className='text-uppercase'>{row.original.fullname}</div>
          },
          {
               Header: 'Age',
               accessor: 'age'
          },
          {
               Header: 'Test',
               accessor: 'name',
          },
          {
               Header: 'Department',
               accessor: 'department',
          },

          {
               Header: 'Client Status',
               accessor: 'clientstatus',
          },
          {
               Header: "Validators",
               accessor: "validators",
               Cell: ({ row }) => {
                    const validators = row.original.validators;
                    return Array.isArray(validators) && validators.length > 0 ? (
                         <div className="list-group">
                              {validators.map((item, index) => (
                                   <span key={index} className="list-group-item text-sm py-0">{item.username}</span>
                              ))}
                         </div>
                    ) : <span></span>;
               }
          },
          {
               Header: 'Action',
               accessor: '',
               Cell: ({ row }) => (
                    <Dropdown>
                         <Dropdown.Toggle
                              variant='link'
                              size="sm">
                              <RiMoreLine fontSize="small" />
                         </Dropdown.Toggle>

                         <Dropdown.Menu>
                              <Dropdown.Item className='pls-label' onClick={() => handleBrowserView(row.original)}>
                                   {downloadSvg}  Print Result
                              </Dropdown.Item>
                              <Dropdown.Item className='pls-label' onClick={() => handlePrintMultipleResults(row)}>
                                   {downloadSvg}  Print Multiple Results
                              </Dropdown.Item>
                              <Dropdown.Item className='pls-label' onClick={() => {
                                   const { testid, patientid, ascensionid, billingid } = row.original;
                                   window.open(`/communications/sms/laboratory-lifecycle-events/sends?testid=${encodeURIComponent(testid)}&patientid=${encodeURIComponent(patientid)}&ascensionid=${encodeURIComponent(ascensionid)}&billingid=${encodeURIComponent(billingid)}`);
                              }}>
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path fill="none" d="M0 0h24v24H0z"></path><path d="M2 21l21-9-21-9v7l15 2-15 2z"></path></svg>
                                   Send Completed SMS
                              </Dropdown.Item>
                              <Dropdown.Item className='pls-label' as="a" target="_blank" href={`/operations/laboratory/validated/printing-tracking/${row.original.ascensionid}`}>
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ marginRight: '6px', verticalAlign: 'middle' }}><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14.93V19h-2v-2.07A8.001 8.001 0 0 1 4.07 13H2v-2h2.07A8.001 8.001 0 0 1 11 4.07V2h2v2.07A8.001 8.001 0 0 1 19.93 11H22v2h-2.07A8.001 8.001 0 0 1 13 19.93zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"></path></svg>
                                   View Result Tracking
                              </Dropdown.Item>
                              <Dropdown.Item className='pls-label' onClick={() => PrepareResultEntryHeader({ id: row.original.testid, ...row.original }, false, branchid,)}>
                                   {downloadSvg} Edit Patient Result
                              </Dropdown.Item>
                         </Dropdown.Menu>
                    </Dropdown>

               )
          },
     ];

     const updateValue = (value) => setQueryParams({ ...queryParams, page: value });


     if (isLoading) return <Loader />
     return (
          <div>
               {isClient && (isMobile ? (
                    <MobileDataDisplay data={collection} handleResult={viewResultHandler} />
               ) : (
                    <PrimeTable column={columns} data={collection}
                         urlparams={{
                              _dateFrom: queryParams._dateFrom,
                              searchString: queryParams.searchString,
                              _dateEnd: queryParams._dateEnd,
                              isUltrasound: queryParams.isUltrasound,
                              employeeid, ascension_stage: 'VALIDATED'
                         }}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessingAscensionData}
                    />
               ))}
          </div>
     );
}
