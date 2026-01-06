"use client";

import React, { useEffect, useState } from "react";
import { currencyFormatter, customFetch, customPost } from "../../../components/Auth/customFetch";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { useApplication } from "../../../components/Auth/useApplicationContext";
import { toast } from "react-toastify";
interface Column {
     Header: string;
     accessor?: keyof OutsourcedCase;
     Cell?: ({ value, row }: { value?: any; row?: { original: OutsourcedCase } }) => React.ReactNode;
}

interface OutsourcedCase {
     id: number;
     serviceid: number;
     testid: number;
     employeeid: number;
     status: number;
     comments: string;
     createdOn: string;
     updatedOn: string | null;
     outsourceid: number;
     completedconfirmedby: number | null;
     trackId: number;
     serviceAddedOn: string;
     serviceCategory: string;
     testName: string;
     outserviceid: number;
     generalTestId: number;
     outsourcePrice: string;
     addedon: string;
     updatedon: string;
     addedby: number;
     updatedby: number;
     employeeName: string;
     confirmerName: string | null;
}

export default function OutsourcedCasesPage() {
     const [data, setData] = useState<OutsourcedCase[]>([]);
     const [loading, setLoading] = useState<boolean>(true);
     const employeeid = useApplication()?.user?.employeeid;
     const [error, setError] = useState<string | null>(null);
     const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
     const [expenseIds, setExpenseIds] = useState<Set<number>>(new Set());
     const branchid = useApplication()?.branchid;


     useEffect(() => {
          const fetchOutsourcedCases = async () => {
               try {
                    setLoading(true);
                    setError(null);

                    const response = await customFetch('outsourced/cases');

                    if (response && Array.isArray(response)) {
                         setData(response);
                    } else {
                         setData([]);
                         setError("Failed to fetch outsourced cases or data is in an unexpected format.");
                    }
               } catch (err) {
                    setData([]);
                    setError(err instanceof Error ? err.message : "An unknown error occurred");
               } finally {
                    setLoading(false);
               }
          };

          fetchOutsourcedCases();
     }, []);

     const formatDate = (dateString: string) => {
          return new Date(dateString).toLocaleDateString(undefined, {
               year: 'numeric',
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
          });
     };

     const handleMarkCompleted = async (caseItem: OutsourcedCase) => {
          try {
               setCompletingIds(prev => new Set(prev).add(caseItem.id));
               const response = await customPost(`outsourced/cases/confirm-done`, 'PUT', {
                    trackingId: caseItem.id,
                    employeeid,
                    comments: 'Outsource case completed , confirmed by employeeid ' + employeeid + "and resuslts to be entered soon."
               });

               if (response?.status == true) {
                    // Update the local data
                    setData(prevData =>
                         prevData.map(item =>
                              item.id === caseItem.id
                                   ? { ...item, status: 1 } // Mark as completed
                                   : item
                         )
                    );
               }
          } catch (err) {
               console.error('Error marking case as completed:', err);
               setError('Failed to mark case as completed');
          } finally {
               setCompletingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(caseItem.id);
                    return newSet;
               });
          }
     };

     const handleMarkAsExpense = async (caseItem: OutsourcedCase) => {
          try {
               setExpenseIds(prev => new Set(prev).add(caseItem.id));

               // Call API to mark as expense
               const response = await customPost(`outsourced/cases/mark-expense`, 'POST', {
                    testid: caseItem.testid,
                    serviceid: caseItem.serviceid,
                    tracking_id: caseItem.id,
                    employeeid,
                    branchid,
                    outsourcedid: caseItem.outsourceid
               });

               if (response && response?.status?.invoiceId) {

                    setData(prevData =>
                         prevData.map(item =>
                              item.id === caseItem.id
                                   ? { ...item, status: 2 }
                                   : item
                         )
                    );
               }

               if (response?.statusCode === 500 && response?.message) {
                    toast.error(response.message);
                    return;
               }

               toast.success(response?.status?.message || 'Case marked as expense successfully');
          } catch (err) {

          } finally {
               setExpenseIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(caseItem.id);
                    return newSet;
               });
          }
     };


     const handleserverProcessing = async (pagination: { page: number, count: number, sortby: string, sortdirection: string }, filters: { [key: string]: string }) => {
          try {
               setLoading(true);
               setError(null);

               const response = await customFetch('outsourced/cases?page=' + pagination.page + '&count=' + pagination.count + '&sortby=' + pagination.sortby + '&sortdirection=' + pagination.sortdirection);
               if (response && Array.isArray(response)) {
                    setData(response);
                    return { result: response, error: false }
               } else {
                    setData([]);
                    setError("Failed to fetch outsourced cases or data is in an unexpected format.");
                    return { result: [], error: false }
               }
          }
          catch (err) {
               return { result: [], error: true }
          }
          finally {
               setLoading(false);
          }
     };

     const columns: Column[] = [
          {
               Header: 'Created On',
               accessor: 'createdOn',
               Cell: ({ value }) => (
                    <span className="text-muted small">
                         {formatDate(value)}
                    </span>
               )
          },
          {
               Header: 'Test Name',
               accessor: 'testName'
          },
          {
               Header: 'Service Category',
               accessor: 'serviceCategory',
               Cell: ({ value }) => value.replace(/_/g, ' ')
          },
          {
               Header: 'Record By',
               accessor: 'employeeName'
          },
          {
               Header: 'Outsource Price',
               accessor: 'outsourcePrice',
               Cell: ({ value }) => (
                    <span className="text-end fw-medium d-block">
                         {currencyFormatter.format(parseFloat(value))}
                    </span>
               )
          },
          {
               Header: 'Status',
               accessor: 'status',
               Cell: ({ value }) => value === 0 ? 'Pending' : 'Completed'
          },
          {
               Header: 'Updated On',
               accessor: 'updatedOn',
               Cell: ({ value }) => value ? (
                    <span className="text-muted small">
                         {formatDate(value)}
                    </span>
               ) : (
                    <span className="text-muted">-</span>
               )
          },
          {
               Header: 'Confirmed By',
               accessor: 'confirmerName',
               Cell: ({ value }) => value || <span className="text-muted">-</span>
          },
          {
               Header: 'Comments',
               accessor: 'comments',
               Cell: ({ value }) => value ? (
                    <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }} title={value}>
                         {value}
                    </span>
               ) : (
                    <span className="text-muted">-</span>
               )
          },
          {
               Header: 'Actions',
               Cell: ({ row }: { row: { original: OutsourcedCase } }) => {
                    const isCompleting = completingIds.has(row.original.id);
                    const isExpense = expenseIds.has(row.original.id);
                    const isCompleted = row.original.status !== 0;
                    const isExpensed = row.original.status === 2; // Assuming status 2 means expensed

                    return (
                         <div className="d-flex gap-2">
                              <button
                                   className="btn btn-sm btn-success"
                                   onClick={() => handleMarkCompleted(row.original)}
                                   disabled={isCompleted || isCompleting || isExpensed}
                              >
                                   {isCompleting ? 'Completing...' : isCompleted ? 'Completed' : 'Mark Completed'}
                              </button>
                              <button
                                   className="btn btn-sm btn-warning"
                                   onClick={() => handleMarkAsExpense(row.original)}
                                   disabled={isExpensed || isExpense}
                              >
                                   {isExpense ? 'Processing...' : isExpensed ? 'Expensed' : 'Mark as Expense'}
                              </button>
                         </div>
                    );
               }
          }
     ];

     if (loading) {
          return (
               <div className="container-fluid py-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                         <div className="text-center">
                              <div className="spinner-border text-primary" role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <div className="mt-2">Loading outsourced cases...</div>
                         </div>
                    </div>
               </div>
          );
     }

     if (error) {
          return (
               <div className="container-fluid py-4">
                    <div className="alert alert-danger" role="alert">
                         <h4 className="alert-heading">Error Loading Data</h4>
                         <p>{error}</p>
                    </div>
               </div>
          );
     }

     return (
          <div className="container-fluid py-4">
               <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                         <h1 className="h3 mb-0">Outsourced Cases</h1>
                         <p className="text-muted mt-1">Manage and view all outsourced laboratory cases</p>
                    </div>
               </div>

               <PrimeTable
                    column={columns}
                    data={data}
                    filtering={true}
                    handleSeverSideProcessing={handleserverProcessing}
                    serverSideFiltering={true}
               />

               {data.length === 0 && !loading && (
                    <div className="text-center py-5 text-sm-start">
                         <div className="text-muted">
                              <h5>No Outsourced Cases Found</h5>
                              <p>There are currently no outsourced cases to display.</p>
                         </div>
                    </div>
               )}
          </div>
     );
}