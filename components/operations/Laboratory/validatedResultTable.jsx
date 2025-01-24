import React, { useState, useEffect } from 'react';
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { ListGroup } from 'react-bootstrap';
import Pagination from '../../accessories/pagination';
import { useMediaQuery } from 'react-responsive';
import Loader from '../../accessories/Loader';
import { useRouter } from 'next/navigation';
import { generateRandomTextAndNumbers } from '../../Auth/customFetch';
import PrimeTable from '../../accessories/Datatables/PrimeTable';

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

export default function ValidatedResultTable() {
     const { isLoading, collection, queryParams, setQueryParams, setLoadPage, canloadPage, updatePageValue, setCollection } = useLaboratoryContext();
     const [isClient, setIsClient] = useState(false);
     const router = useRouter()
          ;
     const viewResultHandler = (item, multiple = false) => {

          const { testid, name, patientid, department, ascensionid, billingid } = item
          const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
          const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;

          window.open(`${process.env.PLS_PDF_GENERATOR}result/pdf/generate?csvid=${csvid}&&testid=${testid}&&testname=${name.toLowerCase()}&&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=${multiple}&&isUltrasound=false`)
     };



     useEffect(() => {
          setIsClient(true);
     }, []);

     const isMobile = useMediaQuery({ maxWidth: 768 });

     const columns = [
          {
               Header: 'Patient ID',
               accessor: 'patientid'
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
               Header: 'Print Count',
               accessor: 'printCount',
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
                    <div className="btn-group" role="group" aria-label="Button group">
                         <button
                              onClick={(ev) => { viewResultHandler(row.original) }}
                              className="btn btn-outline-secondary btn-sm"
                         >
                              Print Result
                         </button>
                         <button
                              onClick={() => { viewResultHandler(row.original, true) }}
                              className="btn btn-outline-secondary text-capitalize btn-sm"
                         >
                              print multiple result
                         </button>
                    </div>

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
                    <PrimeTable column={columns} data={collection} />
               ))}
               <div className='d-flex justify-content-center'>
                    <Pagination page={queryParams.page} load={setLoadPage} updateFunction={updateValue} />
               </div>
          </div>
     );
}
