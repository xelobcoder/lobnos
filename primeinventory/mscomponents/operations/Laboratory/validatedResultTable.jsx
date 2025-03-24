import React, { useState, useEffect } from 'react';
import TableDisplay from "../../accessories/TableDisplay";
import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { ListGroup } from 'react-bootstrap';
import ShowTableCount from './ShowCountTable';
import Pagination from '../../accessories/pagination';
import { useMediaQuery } from 'react-responsive';
import Loader from '../../accessories/Loader';
import { useRouter } from 'next/router';
import { printResultNavigator } from '../../Auth/customFetch';

const Print = (
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
          <path fill="none" d="M0 0h24v24H0z"></path>
          <path d="M17 2C17.5523 2 18 2.44772 18 3V7H21C21.5523 7 22 7.44772 22 8V18C22 18.5523 21.5523 19 21 19H18V21C18 21.5523 17.5523 22 17 22H7C6.44772 22 6 21.5523 6 21V19H3C2.44772 19 2 18.5523 2 18V8C2 7.44772 2.44772 7 3 7H6V3C6 2.44772 6.44772 2 7 2H17ZM16 17H8V20H16V17ZM20 9H4V17H6V16C6 15.4477 6.44772 15 7 15H17C17.5523 15 18 15.4477 18 16V17H20V9ZM8 10V12H5V10H8ZM16 4H8V7H16V4Z"></path>
     </svg>
);

const MobileDataDisplay = ({ data,handleResult }) => {

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
                                   <button className='btn btn-light shadow' onClick={(ev) =>  {handleResult(item)}}>
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
     const viewResultHandler = (item) => {
          printResultNavigator(router, item.billingid, item, true);
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
                    return Array.isArray(validators) ? (
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
               Cell: ({row}) => (
                    <button onClick={(ev) =>  {viewResultHandler(row.original)}} className="btn btn-outline-secondary btn-sm br-0">
                         {Print} Print Result
                    </button>
               )
          },
     ];

     const updateValue = (value) => setQueryParams({ ...queryParams, page: value });


     if(isLoading) return <Loader/>
     return (
          <div>
               <ShowTableCount queryParams={queryParams} setQueryParams={setQueryParams} />
               {isClient && (isMobile ? (
                    <MobileDataDisplay data={collection} handleResult={viewResultHandler} />
               ) : (
                    <TableDisplay column={columns} data={collection} />
               ))}
               <div className='d-flex justify-content-center'>
                    <Pagination page={queryParams.page} load={setLoadPage} updateFunction={updateValue} />
               </div>
          </div>
     );
}
