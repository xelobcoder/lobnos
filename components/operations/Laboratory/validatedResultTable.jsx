import React, { useState, useEffect } from 'react';
import { PrepareResultEntryHeader } from '../../Auth/customFetch';

function isPaidResult(item) {
     const paymentStatus = item?.paymentstatus ?? item?.clientstatus;
     return String(paymentStatus || '').trim().toLowerCase() === 'paid';
}

function canPrintResult(item, allowPrintingUnpaid) {
     const printableItems = Array.isArray(item?.tests) ? item.tests : [item];
     if (Number(allowPrintingUnpaid) === 1 || printableItems.some(isPaidResult)) return true;
     alert("Printing of results is not allowed for unpaid tests.");
     return false;
}

function handlePrintMultipleResults(row, allowPrintingUnpaid) {
     const item = Array.isArray(row.original?.tests)
          ? row.original.tests.find((test) => isPaidResult(test)) || row.original.tests[0]
          : row.original;
     if (!canPrintResult(row.original, allowPrintingUnpaid)) return;
     const { testid, name, patientid, ascensionid, billingid } = item

     const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`
     const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`

     const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=false&&multiple`

     const popup = window.open(
          `/result/lab-report-multiple?${url}`,
          "LabReportMultiple"
     )

     if (popup) popup.focus()
}

import { useLaboratoryContext } from "./LaboratoryStagesContext";
import { ListGroup, Dropdown, Tabs, Tab } from 'react-bootstrap';
import { useMediaQuery } from 'react-responsive';
import Loader from '../../accessories/Loader';
import { generateRandomTextAndNumbers } from '../../Auth/customFetch';
import { handleServerSideProcessingAscensionData } from '../../serverActions/ActionFiltering';
import { RiAlertLine, RiExternalLinkLine, RiFileTextLine, RiInformationLine, RiMailLine, RiMoreLine, RiPhoneLine, RiTimeLine, RiTruckLine, RiUser3Line, RiWhatsappLine } from '@remixicon/react';
import { useApplication } from '../../Auth/useApplicationContext';
import PrimeTable from '../../accessories/Datatables/PrimeTable';
import dayjs from 'dayjs';
import SingleWorkFlowResultDeliveryModal from './singleWorkFlowDeliveryResult';
import BulkWorkFlowResultDeliveryModal from './bulkWorkFlowDeliveryResult';




const normalizeDeliveryMode = (mode) => {
     const raw = (mode ?? '').toString().trim();
     if (!raw) return '';
     const normalized = raw.toLowerCase();
     if (normalized === 'whatapp') return 'whatsapp';
     if (normalized === 'hardcopy') return 'hard copy';
     return normalized;
};

const formatDeliveryModeLabel = (mode) => {
     const normalized = normalizeDeliveryMode(mode);
     if (!normalized) return 'Not set';
     if (normalized === 'whatsapp') return 'WhatsApp';
     if (normalized === 'email') return 'Email';
     if (normalized === 'phone call') return 'Phone call';
     if (normalized === 'hard copy') return 'Hard copy';
     return normalized;
};

const DeliveryModeIcon = ({ mode }) => {
     const normalized = normalizeDeliveryMode(mode);
     if (!normalized) return <RiInformationLine size={16} />;
     if (normalized === 'whatsapp') return <RiWhatsappLine size={16} />;
     if (normalized === 'email') return <RiMailLine size={16} />;
     if (normalized.includes('phone')) return <RiPhoneLine size={16} />;
     if (normalized.includes('hard')) return <RiFileTextLine size={16} />;
     return <RiInformationLine size={16} />;
};

const DeliveryBadges = ({ requested_mode, delivered_mode, delivered_by_username, delivered_at }) => {
     const requested = normalizeDeliveryMode(requested_mode);
     const delivered = normalizeDeliveryMode(delivered_mode);
     const isMismatch = Boolean(delivered && requested && delivered !== requested);

     const requestedClass = requested ? 'text-bg-info' : 'text-bg-light border';
     const deliveredClass = delivered ? (isMismatch ? 'text-bg-warning text-dark' : 'text-bg-success') : 'text-bg-secondary';

     return (
          <div className="d-flex flex-column gap-1" style={{ minWidth: 180 }}>
               <span className={`badge d-inline-flex align-items-center gap-1 ${requestedClass}`}>
                    <RiTruckLine size={16} />
                    <span>Requested:</span>
                    <span className="fw-semibold">{formatDeliveryModeLabel(requested_mode)}</span>
               </span>
               <span className={`badge d-inline-flex align-items-center gap-1 ${deliveredClass}`}>
                    <DeliveryModeIcon mode={delivered_mode} />
                    <span>Delivered:</span>
                    <span className="fw-semibold">{delivered ? formatDeliveryModeLabel(delivered_mode) : 'Not delivered'}</span>
                    {isMismatch ? <RiAlertLine size={16} /> : null}
               </span>
               {(delivered_by_username || delivered_at) ? (
                    <div className="text-muted d-flex flex-wrap align-items-center gap-2" style={{ fontSize: 12 }}>
                         {delivered_by_username ? (
                              <span className="d-inline-flex align-items-center gap-1">
                                   <RiUser3Line size={14} />
                                   <span className="text-truncate" style={{ maxWidth: 160 }}>{delivered_by_username}</span>
                              </span>
                         ) : null}
                         {delivered_at ? (
                              <span className="d-inline-flex align-items-center gap-1">
                                   <RiTimeLine size={14} />
                                   <span>{dayjs(delivered_at).format('DD-MM-YYYY HH:mm')}</span>
                              </span>
                         ) : null}
                    </div>
               ) : null}
          </div>
     );
};


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
                                   <span>{item.fullname} ({item.fullpatientid || item.patientid})</span>
                              </div>
                              <div>
                                   <button className='btn btn-light shadow' onClick={(ev) => { handleResult(Array.isArray(item.tests) && item.tests.length > 0 ? item.tests[0] : item) }}>
                                        {Print}
                                   </button>
                              </div>
                         </ListGroup.Item>
                         <ListGroup.Item className='pls-color'>
                              {Array.isArray(item.tests) ? (
                                   <>
                                        <div className="d-flex align-items-center justify-content-between">
                                             <span className="fw-semibold">Tests</span>
                                             <span className="text-muted">{item.tests.length} item{item.tests.length !== 1 ? 's' : ''}</span>
                                        </div>
                                        <div className="mt-2 d-flex flex-column gap-2">
                                             {item.tests.slice(0, 3).map((t, idx) => (
                                                  <div key={idx} className="d-flex flex-column">
                                                       <div className="fw-semibold">{t.name} <small className="text-muted">({t.department})</small></div>
                                                       <DeliveryBadges
                                                            requested_mode={t.requested_mode}
                                                            delivered_mode={t.delivered_mode}
                                                            delivered_by_username={t.delivered_by_username}
                                                            delivered_at={t.delivered_at}
                                                       />
                                                  </div>
                                             ))}
                                             {item.tests.length > 3 ? (
                                                  <div className="text-muted small">+ {item.tests.length - 3} more</div>
                                             ) : null}
                                        </div>
                                   </>
                              ) : (
                                   <>
                                        <div className="fw-semibold">{item.name} <small className="text-muted">({item.department})</small></div>
                                        <div className="mt-2">
                                             <DeliveryBadges
                                                  requested_mode={item.requested_mode}
                                                  delivered_mode={item.delivered_mode}
                                                  delivered_by_username={item.delivered_by_username}
                                                  delivered_at={item.delivered_at}
                                             />
                                        </div>
                                   </>
                              )}
                              <hr />
                              <span>Validators:</span>
                              <ul className="list-unstyled">
                                   {(item.validators && Array.isArray(item.validators) ? item.validators : (item.allValidators && Array.isArray(item.allValidators) ? item.allValidators : [])).map((validator, idx) => (
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

export default function ValidatedResultTable({ employeeid, mode = 'full' }) {
     const { isLoading, collection, queryParams, setQueryParams, setCollection, _getAscensionData, category = 'grouped' } = useLaboratoryContext();
     const [isClient, setIsClient] = useState(false);
     const [groupByPatient, setGroupByPatient] = useState(mode === 'crm' ? false : category === 'grouped');
     const appSettings = useApplication();
     const branchid = appSettings?.branchid;
     const settings = appSettings?.settings || {};
     const allowPrintingUnpaid = settings?.allowPrintingUnpaid;
     const [showDeliveryModal, setShowDeliveryModal] = useState(false);
     const [selectedDeliveryItem, setSelectedDeliveryItem] = useState(null);
     const [selectedRows, setSelectedRows] = useState(new Set());
     const [showBulkDeliveryModal, setShowBulkDeliveryModal] = useState(false);

     const viewResultHandler = (item, multiple = false) => {
          if (!canPrintResult(item, allowPrintingUnpaid)) return;
          if (Array.isArray(item?.tests)) {
               item = item.tests.find((test) => isPaidResult(test)) || item.tests[0];
          }
          const { testid, name, patientid, ascensionid, billingid } = item;
          const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`;
          const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`;
          const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&employeeid=${employeeid}&&ptid=${ptid}&&ascensionId=${ascensionid}&&isMultiple=${multiple}&&isUltrasound=false&&is_password_encrypted=false&&password=`;
          window.open(`/result/labreport?${url}`);
     };


     const allowCrmToPrintResult = useApplication()?.settings?.allowCrmToPrintResult || 0;
     const role = useApplication()?.user?.role || '';



     useEffect(() => {
          setIsClient(true);
     }, []);

     const isMobile = useMediaQuery({ maxWidth: 768 });


     const handleBrowserView = (data) => {
          if (!canPrintResult(data, allowPrintingUnpaid)) return;

          const { testid, name, patientid, ascensionid, billingid } = data

          const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`
          const ptid = `${generateRandomTextAndNumbers(50)}${patientid}`

          const url = `csvid=${csvid}&&testid=${testid}&&testname=${name}&&ptid=${ptid}&&target=70,50&&ascensionId=${ascensionid}&&isMultiple=false&&isUltrasound=false&&is_password_encrypted=false&&password=`

          const popup = window.open(
               `/result/labreport/4?${url}`,
               "LabReportView",
          )

          if (popup) popup.focus()
     }





     const downloadSvg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z"></path></svg>
     const EmailSvg = <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3ZM20 7.23792L12.0718 14.338L4 7.21594V19H20V7.23792ZM4.51146 5L12.0619 11.662L19.501 5H4.51146Z"></path></svg>;

     const columns = [
          {
               Header: ({ column }) => (
                    <div className="d-flex align-items-center">
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={collection.length > 0 && selectedRows.size === collection.length}
                              onChange={handleSelectAll}
                         />
                    </div>
               ),
               id: 'selection',
               accessor: 'ascensionid',
               Cell: ({ row }) => (
                    <div className="d-flex align-items-center">
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedRows.has(row.original.ascensionid)}
                              onChange={() => handleRowSelection(row.original.ascensionid)}
                         />
                    </div>
               ),
               width: 40,
               disableSortBy: true,
          },
          {
               Header: 'Full Name',
               accessor: 'fullname',
               Cell: ({ row }) => <div className='text-uppercase fw-bold'>{row.original.fullname} <br /> ({row.original.fullpatientid})
                    <br /> <span className='text-muted fw-normal'>({row.original.patientid}) ({row.original.age})</span>
               </div>
          },
          { Header: 'BillingId/Ascension ID', accessor: 'ascensionid', Cell: ({ row }) => <div><div>Bill:{row.original.billingid}</div><br /><div>Ascension:{row.original.ascensionid}</div></div> },
          {
               Header: 'Ascension Date',
               accessor: 'ascension_date',
               Cell: ({ row }) => <div>{dayjs(row.original.ascension_date).format('DD-MM-YYYY hh:mm:ss')}</div>
          },

          {
               Header: 'Test/Department',
               accessor: 'name',
               Cell: ({ row }) => <div>{row.original.name}<br />({row.original.department})</div>
          },

          {
               Header: 'Delivery',
               accessor: 'requested_mode',
               Cell: ({ row }) => (
                    <DeliveryBadges
                         requested_mode={row.original.requested_mode}
                         delivered_mode={row.original.delivered_mode}
                         delivered_by_username={row.original.delivered_by_username}
                         delivered_at={row.original.delivered_at}
                    />
               )
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
               Cell: ({ row }) => {
                    return <Dropdown align="end">
                         <Dropdown.Toggle variant='link' size="sm" className="p-0 text-decoration-none border-0 shadow-none">
                              <RiMoreLine fontSize="small" />
                         </Dropdown.Toggle>
                         <Dropdown.Menu className="validated-action-menu py-1" style={{ display: 'block', minWidth: '15rem' }}>
                              {role === "clinician" ? (
                                   <Dropdown.Item
                                        className='pls-label d-flex align-items-center gap-2' onClick={() => handlePrintMultipleResults(row, allowPrintingUnpaid)}>
                                        {downloadSvg}  Print Multiple Results
                                   </Dropdown.Item>
                              ) : (
                                   <>
                                        <Dropdown.Item
                                             className='pls-label d-flex align-items-center gap-2'
                                             onClick={() => {
                                                  const normalizedItem = {
                                                       ...row.original,
                                                       ascension_id: row.original.ascension_id ?? row.original.ascensionid,
                                                  };
                                                  setSelectedDeliveryItem(normalizedItem);
                                                  setShowDeliveryModal(true);
                                             }}
                                        >
                                             <RiTruckLine size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                                             {row.original?.delivered_mode ? 'Update Result Delivery' : 'Record Result Delivery'}
                                        </Dropdown.Item>
                                        {
                                             allowCrmToPrintResult && role == "customer service representative" ? (
                                                  <>
                                                       <Dropdown.Item
                                                            className='pls-label d-flex align-items-center gap-2' onClick={() => handleBrowserView(row.original)}>
                                                            {downloadSvg}  Print Result
                                                       </Dropdown.Item>
                                                       <Dropdown.Item
                                                            className='pls-label d-flex align-items-center gap-2' onClick={() => handlePrintMultipleResults(row, allowPrintingUnpaid)}>
                                                            {downloadSvg}  Print Multiple Results
                                                       </Dropdown.Item>
                                                  </>
                                             ) : null
                                        }

                                        {mode !== 'crm' ? (
                                             <>
                                                  <Dropdown.Item
                                                       className='pls-label d-flex align-items-center gap-2' onClick={() => handleBrowserView(row.original)}>
                                                       {downloadSvg}  Print Result
                                                  </Dropdown.Item>
                                                  <Dropdown.Item
                                                       className='pls-label d-flex align-items-center gap-2' onClick={() => handlePrintMultipleResults(row, allowPrintingUnpaid)}>
                                                       {downloadSvg}  Print Multiple Results
                                                  </Dropdown.Item>
                                                  <Dropdown.Item className='pls-label d-flex align-items-center gap-2' onClick={() => {
                                                       const { testid, patientid, ascensionid, billingid } = row.original;
                                                       window.open(`/communications/sms/laboratory-lifecycle-events/sends?testid=${encodeURIComponent(testid)}&patientid=${encodeURIComponent(patientid)}&ascensionid=${encodeURIComponent(ascensionid)}&billingid=${encodeURIComponent(billingid)}`);
                                                  }}>
                                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M2 21l21-9-21-9v7l15 2-15 2z"></path></svg>
                                                       Send Completed SMS
                                                  </Dropdown.Item>
                                                  <Dropdown.Item className='pls-label d-flex align-items-center gap-2' as="a" target="_blank" href={`/operations/laboratory/validated/printing-tracking/${row.original.ascensionid}`}>
                                                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path fill="none" d="M0 0h24v24H0z"></path><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 14.93V19h-2v-2.07A8.001 8.001 0 0 1 4.07 13H2v-2h2.07A8.001 8.001 0 0 1 11 4.07V2h2v2.07A8.001 8.001 0 0 1 19.93 11H22v2h-2.07A8.001 8.001 0 0 1 13 19.93zM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"></path></svg>
                                                       View Result Tracking
                                                  </Dropdown.Item>
                                                  <Dropdown.Item className='pls-label d-flex align-items-center gap-2' onClick={() => PrepareResultEntryHeader({ id: row.original.testid, ...row.original }, false, branchid, false)}>
                                                       {downloadSvg} Edit Patient Result
                                                  </Dropdown.Item>
                                             </>
                                        ) : null}
                                   </>
                              )}
                         </Dropdown.Menu>
                    </Dropdown>
               }
          },
     ];


     // Columns for grouped view
     const groupedColumns = [
          {
               Header: ({ column }) => (
                    <div className="d-flex align-items-center">
                         <input
                              type="checkbox"
                              className="form-check-input"
                              checked={groupedData.length > 0 && selectedRows.size >= groupedData.length}
                              onChange={() => {
                                   if (selectedRows.size >= groupedData.length) {
                                        setSelectedRows(new Set());
                                   } else {
                                        const allIds = new Set();
                                        groupedData.forEach(g => {
                                             g.tests.forEach(t => allIds.add(t.ascensionid));
                                        });
                                        setSelectedRows(allIds);
                                   }
                              }}
                         />
                    </div>
               ),
               id: 'selection',
               accessor: 'billingid',
               Cell: ({ row }) => {
                    console.log('Row data for selection:', row.original);
                    const tests = Array.isArray(row.original.tests) ? row.original.tests : [];
                    const allTestIds = tests.map(t => t?.ascensionid).filter(Boolean);
                    const isAllSelected = allTestIds.length > 0 && allTestIds.every(id => selectedRows.has(id));
                    const isSomeSelected = allTestIds.length > 0 && allTestIds.some(id => selectedRows.has(id));

                    return (
                         <div className="d-flex align-items-center">
                              <input
                                   type="checkbox"
                                   className="form-check-input"
                                   checked={isAllSelected}
                                   ref={el => {
                                        if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                                   }}
                                   onChange={() => {
                                        setSelectedRows(prev => {
                                             const newSet = new Set(prev);
                                             if (isAllSelected) {
                                                  allTestIds.forEach(id => newSet.delete(id));
                                             } else {
                                                  allTestIds.forEach(id => newSet.add(id));
                                             }
                                             return newSet;
                                        });
                                   }}
                              />
                         </div>
                    );
               },
               width: 40,
               disableSortBy: true,
          },
          {
               Header: 'Full Name',
               accessor: 'fullname',
               Cell: ({ row }) => <div className='text-uppercase fw-bold'>{row.original.fullname}
                    <br /> ({row.original.fullpatientid || row.original.patientid})
                    <br /> <span className='text-muted fw-normal'>({row.original.patientid}) ({row.original.age})</span>
               </div>
          },


          {
               Header: 'Billing ID',
               accessor: 'billingid'
          },
          {
               Header: 'Tests',
               accessor: 'tests',
               Cell: ({ row }) => (
                    <span className="">{row.original.tests?.length || 0} test{(row.original.tests?.length || 0) !== 1 ? 's' : ''}</span>
               )
          },
          {
               Header: 'Individual Tests',
               accessor: 'test_names',
               disableSortBy: true,
               Cell: ({ row }) => {
                    const tests = Array.isArray(row.original.tests) ? row.original.tests : [];

                    return tests.length > 0 ? (
                         <div className="d-flex flex-column gap-1">
                              {tests.map((test, index) => (
                                   <div key={test.ascensionid || test.testid || index}>
                                        <span className="fw-semibold">{test.name || 'Unnamed test'}</span>
                                        {test.department ? <small className="text-muted ms-1">({test.department})</small> : null}
                                   </div>
                              ))}
                         </div>
                    ) : <span className="text-muted">No tests</span>;
               }
          },
          {
               Header: 'Delivery',
               accessor: 'tests_delivery',
               Cell: ({ row }) => {
                    const tests = Array.isArray(row.original.tests) ? row.original.tests : [];
                    const deliveredCount = tests.filter(t => Boolean(normalizeDeliveryMode(t.delivered_mode))).length;
                    const mismatchCount = tests.filter(t => {
                         const requested = normalizeDeliveryMode(t.requested_mode);
                         const delivered = normalizeDeliveryMode(t.delivered_mode);
                         return Boolean(delivered && requested && delivered !== requested);
                    }).length;
                    const requestedModes = Array.from(new Set(tests.map(t => normalizeDeliveryMode(t.requested_mode)).filter(Boolean)));

                    return (
                         <div className="d-flex flex-column gap-1" style={{ minWidth: 180 }}>
                              <div className="d-flex flex-wrap gap-1">
                                   {requestedModes.length > 0 ? requestedModes.slice(0, 3).map((m) => (
                                        <span key={m} className="badge text-bg-info d-inline-flex align-items-center gap-1">
                                             <DeliveryModeIcon mode={m} />
                                             <span>{formatDeliveryModeLabel(m)}</span>
                                        </span>
                                   )) : (
                                        <span className="badge text-bg-light border d-inline-flex align-items-center gap-1">
                                             <RiTruckLine size={16} />
                                             <span>Not set</span>
                                        </span>
                                   )}
                                   {requestedModes.length > 3 ? (
                                        <span className="badge text-bg-light border">+{requestedModes.length - 3}</span>
                                   ) : null}
                              </div>
                              <div className="d-flex flex-wrap gap-1">
                                   <span className={`badge ${deliveredCount > 0 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                                        Delivered: {deliveredCount}/{tests.length}
                                   </span>
                                   {mismatchCount > 0 ? (
                                        <span className="badge text-bg-warning text-dark d-inline-flex align-items-center gap-1">
                                             <RiAlertLine size={16} />
                                             <span>Mismatch: {mismatchCount}</span>
                                        </span>
                                   ) : null}
                              </div>
                         </div>
                    );
               }
          },
          {
               Header: 'Validators',
               accessor: 'allValidators',
               Cell: ({ row }) => (
                    <div className="list-group list-group-sm">
                         {row.original.allValidators && row.original.allValidators.map((validator, idx) => (
                              <span key={idx} className="list-group-item list-group-item-sm py-1 px-2 text-sm">
                                   {validator.username}
                              </span>
                         ))}
                    </div>
               )
          },
          {
               Header: 'Action',
               accessor: '',
               Cell: ({ row }) => (
                    <div className="d-flex flex-wrap gap-2">
                         <button
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                   if (row.original.tests && row.original.tests.length > 0) {
                                        handlePrintMultipleResults({ original: row.original.tests[0] }, allowPrintingUnpaid);
                                   }
                              }}
                         >
                              Print Results
                         </button>
                         <button
                              type="button"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1"
                              onClick={() => {
                                   const patientid = row.original.patientid;
                                   const billingid = row.original.billingid;
                                   window.open(`/operations/laboratory/main/dailyRequest/visit?billingid=${encodeURIComponent(billingid)}&patientid=${encodeURIComponent(patientid)}&&isOpenSideBarShow=false`, '_blank', 'noopener,noreferrer');
                              }}
                         >
                              <RiExternalLinkLine size={16} />
                              <span>Open Visit</span>
                         </button>
                    </div>
               )
          }
     ];

     // Group data by patient ID and billing ID
     const groupDataByPatient = (data) => {
          const grouped = {};
          data.forEach(item => {
               const key = `${item.fullpatientid || item.patientid}_${item.billingid}`;
               if (!grouped[key]) {
                    grouped[key] = {
                         patientid: item.patientid,
                         fullpatientid: item.fullpatientid,
                         fullname: item.fullname,
                         age: item.age,
                         billingid: item.billingid,
                         clientstatus: item.clientstatus,
                         tests: [],
                         allValidators: new Set()
                    };
               }
               grouped[key].tests.push(item);
               if (item.validators && Array.isArray(item.validators)) {
                    item.validators.forEach(v => grouped[key].allValidators.add(JSON.stringify(v)));
               }
          });

          return Object.values(grouped).map(group => ({
               ...group,
               allValidators: Array.from(group.allValidators).map(v => JSON.parse(v))
          }));
     };



     const groupedData = groupByPatient ? groupDataByPatient(collection) : collection;


     if (isLoading) return <Loader />

     const handleRowSelection = (ascensionid) => {
          setSelectedRows(prev => {
               const newSet = new Set(prev);
               if (newSet.has(ascensionid)) {
                    newSet.delete(ascensionid);
               } else {
                    newSet.add(ascensionid);
               }
               return newSet;
          });
     };

     const handleSelectAll = () => {
          if (selectedRows.size === collection.length) {
               setSelectedRows(new Set());
          } else {
               setSelectedRows(new Set(collection.map(item => item.ascensionid)));
          }
     };

     const handleBulkDeliveryUpdate = () => {
          if (selectedRows.size === 0) {
               alert("Please select at least one item");
               return;
          }
          setShowBulkDeliveryModal(true);
     };

     return (
          <div>
               {showBulkDeliveryModal && (
                    <BulkWorkFlowResultDeliveryModal
                         show={showBulkDeliveryModal}
                         onHide={() => setShowBulkDeliveryModal(false)}
                         employeeid={Number(employeeid)}
                         items={collection.filter(item => selectedRows.has(item.ascensionid))}
                         onSuccess={async () => {
                              setSelectedRows(new Set());
                              if (typeof _getAscensionData === 'function') {
                                   await _getAscensionData('VALIDATED', employeeid, branchid, {});
                              }
                         }}
                    />
               )}
               {selectedDeliveryItem ? (
                    <SingleWorkFlowResultDeliveryModal
                         key={String(selectedDeliveryItem.ascension_id ?? selectedDeliveryItem.ascensionid ?? '')}
                         item={selectedDeliveryItem}
                         employeeid={Number(employeeid)}
                         workflow={'resultDelivery'}
                         show={showDeliveryModal}
                         onHide={() => {
                              setShowDeliveryModal(false);
                              setSelectedDeliveryItem(null);
                         }}
                         onSuccess={async () => {
                              setShowDeliveryModal(false);
                              setSelectedDeliveryItem(null);
                              if (typeof _getAscensionData === 'function') {
                                   await _getAscensionData('VALIDATED', employeeid, branchid, {});
                              }
                         }}
                    />
               ) : null}
               {mode !== 'crm' ? (
                    <Tabs
                         activeKey={groupByPatient ? "grouped" : "ungrouped"}
                         onSelect={(k) => setGroupByPatient(k === "grouped")}
                         className="mb-3"
                    >
                         <Tab eventKey="grouped" title={`Grouped View (${groupByPatient ? groupedData.length : 0})`} />
                         <Tab eventKey="ungrouped" title={`Individual Records (${!groupByPatient ? collection.length : 0})`} />
                    </Tabs>
               ) : null}

               <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-2">
                         {selectedRows.size > 0 && (
                              <button
                                   className="btn btn-primary btn-sm d-flex align-items-center gap-2"
                                   onClick={handleBulkDeliveryUpdate}
                              >
                                   <RiTruckLine size={18} />
                                   <span>Bulk Update Delivery ({selectedRows.size})</span>
                              </button>
                         )}
                    </div>
                    {selectedRows.size > 0 && (
                         <div className="text-muted small">
                              {selectedRows.size} items selected
                         </div>
                    )}
               </div>

               {isClient && (isMobile ? (
                    <MobileDataDisplay data={groupedData} handleResult={viewResultHandler} />
               ) : groupByPatient ? (
                    <PrimeTable
                         column={groupedColumns}
                         data={groupedData}
                         urlparams={{
                              _dateFrom: queryParams._dateFrom,
                              _dateEnd: queryParams._dateEnd,
                              isUltrasound: queryParams.isUltrasound,
                              grouped: "grouped",
                              employeeid, ascension_stage: 'VALIDATED',
                              billingid: queryParams.billingid,
                              patientname: queryParams.patientname,
                              patientid: queryParams.patientid,
                              billingid: queryParams.billingid,
                              ascensionid: queryParams.ascensionid,
                              testid: queryParams.testid,
                         }}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={async (pagination) => {
                              try {
                                   const { result } = await handleServerSideProcessingAscensionData(pagination)
                                   if (result && Array.isArray(result)) {
                                        setCollection(result);
                                        return {
                                             result: groupDataByPatient(result),
                                             error: false
                                        };

                                   }
                                   return { result: [], error: false };
                              } catch (error) {
                                   return { result: [], error: true };
                              }
                         }}
                         rowStyling={{
                              type: "custom",
                              getRowStyle: (rowData) => {
                                   const status = rowData?.paymentstatus?.toLowerCase();
                                   if (status === "pending") {
                                        return { backgroundColor: "#f8d7da", color: "#842029" };
                                   } else if (status === "partial") {
                                        return { backgroundColor: "#fff3cd", color: "#664d03" };
                                   }
                                   return {};
                              }
                         }}
                    />
               ) : (
                    <PrimeTable column={columns} data={collection}
                         urlparams={{
                              _dateFrom: queryParams._dateFrom,
                              _dateEnd: queryParams._dateEnd,
                              isUltrasound: queryParams.isUltrasound,
                              billingid: queryParams.billingid,
                              patientname: queryParams.patientname,
                              patientid: queryParams.patientid,
                              billingid: queryParams.billingid,
                              ascensionid: queryParams.ascensionid,
                              employeeid, ascension_stage: 'VALIDATED',
                              testid: queryParams.testid,
                         }}
                         serverSideFiltering={true}
                         handleSeverSideProcessing={handleServerSideProcessingAscensionData}
                         rowStyling={{
                              type: "custom",
                              getRowStyle: (rowData) => {
                                   const status = rowData?.paymentstatus?.toLowerCase();
                                   if (status === "pending") {
                                        return { backgroundColor: "#f8d7da", color: "#842029" };
                                   } else if (status === "partial") {
                                        return { backgroundColor: "#fff3cd", color: "#664d03" };
                                   }
                                   return {};
                              }
                         }}
                    />
               ))}

               <style jsx global>{`
                    .validated-action-menu {
                         display: block !important;
                    }

                    .validated-action-menu .dropdown-item {
                         display: flex;
                         align-items: center;
                         gap: 0.5rem;
                         white-space: nowrap;
                    }
               `}</style>
          </div>
     );
}
