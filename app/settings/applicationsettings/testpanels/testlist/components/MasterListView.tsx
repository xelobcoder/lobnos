"use client";
import { useEffect, useState } from "react";
import * as React from 'react';
import PrimeTable from "../../../../../../components/accessories/Datatables/PrimeTable";
import Loader from "../../../../../../components/accessories/Loader";
import { customFetch } from "../../../../../../components/Auth/customFetch";
import styles from '../../../../../../styles/SmsTemplateList.module.css'

interface TestPanel {
     id: number;
     prim_key: number;
     name: string;
     price: number;
     qty_required: number | string;
     unit: string;
     shorttext?: string;
     category?: number;
     sample?: number;
     sample_container?: number;
     description?: string;
     iscustom?: number;
     created_on?: string;
}

interface Column {
     Header: string;
     accessor: string | ((row: TestPanel) => any);
     Cell?: ({ row, value }: { row: { original: TestPanel }, value: any }) => React.JSX.Element;
}

interface MasterListViewProps {
     isVisible: boolean;
}

interface TestRule {
     id: number;
     testid: number;
     name: string;
     field: string | null;
     value: string | null;
     hasunits: number;
     units: string;
     plan: string;
     plain: string | null;
     ordering: number;
     isValueTracked: number;
     textReference: string | null;
     upperlimit: string;
     lowerlimit: string;
     category: string | null;
     options: string | null;
     undercategory: number;
     categoryid: string | null;
     valueAlert: string | null;
     alert: string | null;
}

export default function MasterListView({ isVisible }: MasterListViewProps) {
     const [masterListData, setMasterListData] = useState<TestPanel[]>([]);
     const [isLoading, setIsLoading] = useState<boolean>(false);
     const [selectedTest, setSelectedTest] = useState<TestPanel | null>(null);
     const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
     const [testRules, setTestRules] = useState<TestRule[]>([]);
     const [loadingTestRules, setLoadingTestRules] = useState<boolean>(false);
     const [selectedTestIds, setSelectedTestIds] = useState<Set<number>>(new Set());
     const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);

     const columns: Column[] = [
          {
               Header: 'Name',
               accessor: 'name',
               Cell: ({ row, value }: { row: { original: TestPanel }, value: string }) => (
                    <div className="d-flex align-items-center gap-2">
                         <input
                              type="checkbox"
                              checked={selectedTestIds.has(row.original.id)}
                              onChange={(e) => {
                                   const newSelected = new Set(selectedTestIds);
                                   if (e.target.checked) {
                                        newSelected.add(row.original.id);
                                   } else {
                                        newSelected.delete(row.original.id);
                                   }
                                   setSelectedTestIds(newSelected);
                              }}
                         />
                         <span>{value} {row.original.shorttext ? `(${row.original.shorttext})` : ""}</span>
                    </div>
               )
          },
          {
               Header: 'Category',
               accessor: 'category',
          },
          {
               Header: 'Price',
               accessor: 'price',
          },
          {
               Header: 'Sample Qty',
               accessor: 'qty_required',
               Cell: ({ row, value }: { row: { original: TestPanel }, value: number | string }) => (
                    <div>{value} {row.original.unit}</div>
               )
          },
          {
               Header: 'Action',
               accessor: 'action',
               Cell: ({ row }: { row: { original: TestPanel } }) => (
                    <button
                         className="btn btn-sm btn-outline-primary"
                         onClick={() => handleViewDetails(row.original)}
                    >
                         View Details
                    </button>
               )
          }
     ];

     const loadMasterListData = async () => {
          setIsLoading(true);
          try {
               const masterRes = await customFetch('testpanel/list/bulk?grouping=master').catch(() => ({ data: [] }));
               setMasterListData(masterRes?.data || []);
          } catch (error) {
               console.error('Error loading master list data:', error);
               setMasterListData([]);
          } finally {
               setIsLoading(false);
          }
     };

     const handleViewDetails = async (test: TestPanel) => {
          setSelectedTest(test);
          setShowDetailsModal(true);
          setLoadingTestRules(true);
          try {
               const rulesRes = await customFetch(`testpanel/list/customtestrule?testid=${test.id}&tenantId=3&grouping=master`).catch(() => []);
               const rules = Array.isArray(rulesRes) ? rulesRes : [];
               console.log('Test Rules:', rules); // Debug log
               setTestRules(rules);
          } catch (error) {
               console.error('Error loading test rules:', error);
               setTestRules([]);
          } finally {
               setLoadingTestRules(false);
          }
     };

     useEffect(() => {
          if (isVisible) {
               loadMasterListData();
          }
     }, [isVisible]);

     if (!isVisible) return null;

     if (isLoading) return <Loader />;

     const handleImport = () => {
          if (selectedTestIds.size === 0) {
               alert('Please select at least one test to import');
               return;
          }
          setShowConfirmModal(true);
     };

     const confirmImport = () => {
          const selectedTests = masterListData.filter(t => selectedTestIds.has(t.id));
          console.log('Importing tests:', selectedTests);
          // Add import logic here
          setShowConfirmModal(false);
     };

     return (
          <div>
               {masterListData.length > 0 && (
                    <div className="d-flex justify-content-end mb-3">
                         <button
                              onClick={handleImport}
                              disabled={selectedTestIds.size === 0}
                              className="btn btn-sm btn-outline-success"
                         >
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="currentColor" style={{ marginRight: '0.5rem' }}>
                                   <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
                              </svg>
                              Import Selected ({selectedTestIds.size})
                         </button>
                    </div>
               )}
               {masterListData.length > 0 ? (
                    <PrimeTable
                         serverSideFiltering={false}
                         filtering={true}
                         handleSeverSideProcessing={null}
                         column={columns}
                         data={masterListData}
                    />
               ) : (
                    <div className="alert alert-info" role="alert">
                         No master list tests available.
                    </div>
               )}

               {showDetailsModal && selectedTest && (
                    <div className="modal d-block" tabIndex={-1} role="dialog">
                         <div className="modal-dialog modal-xl" role="document">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">{selectedTest.name} - Test Fields</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowDetailsModal(false)}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        {loadingTestRules ? (
                                             <p className="text-muted">Loading test rules...</p>
                                        ) : testRules.length > 0 ? (
                                             <div>
                                                  <table className={styles.table}>
                                                       <thead className="table-light">
                                                            <tr>
                                                                 <th>Field</th>
                                                                 <th>Units</th>
                                                                 <th>Lower Limit</th>
                                                                 <th>Upper Limit</th>
                                                                 <th>Plan</th>
                                                                 <th>Options</th>
                                                                 <th>Text Reference</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {testRules.map((rule) => (
                                                                 <tr key={rule.id}>
                                                                      <td>{rule.name || 'N/A'}</td>
                                                                      <td>{rule.units || 'N/A'}</td>
                                                                      <td>{rule.lowerlimit || 'N/A'}</td>
                                                                      <td>{rule.upperlimit || 'N/A'}</td>
                                                                      <td>{rule.plan || 'N/A'}</td>
                                                                      <td>
                                                                           {rule.options ? (
                                                                                rule.options.includes(',') ? (
                                                                                     <ol className="mb-0 ps-3">
                                                                                          {rule.options.split(',').map((opt, idx) => (
                                                                                               <li key={idx}>{opt.trim()}</li>
                                                                                          ))}
                                                                                     </ol>
                                                                                ) : (
                                                                                     <span>{rule.options}</span>
                                                                                )
                                                                           ) : (
                                                                                <span className="text-muted">-</span>
                                                                           )}
                                                                      </td>
                                                                      <td>
                                                                           {rule.textReference ? (
                                                                                rule.textReference.includes(',') ? (
                                                                                     <ol className="mb-0 ps-3">
                                                                                          {rule.textReference.split(',').map((ref, idx) => (
                                                                                               <li key={idx}>{ref.trim()}</li>
                                                                                          ))}
                                                                                     </ol>
                                                                                ) : (
                                                                                     <span>{rule.textReference}</span>
                                                                                )
                                                                           ) : (
                                                                                <span className="text-muted">-</span>
                                                                           )}
                                                                      </td>
                                                                 </tr>
                                                            ))}
                                                       </tbody>
                                                  </table>
                                             </div>
                                        ) : (
                                             <p className="text-muted">No test rules available.</p>
                                        )}
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-secondary"
                                             onClick={() => setShowDetailsModal(false)}
                                        >
                                             Close
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               {showConfirmModal && (
                    <div className="modal d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                         <div className="modal-dialog" role="document">
                              <div className="modal-content">
                                   <div className="modal-header">
                                        <h5 className="modal-title">Confirm Import</h5>
                                        <button
                                             type="button"
                                             className="btn-close"
                                             onClick={() => setShowConfirmModal(false)}
                                        />
                                   </div>
                                   <div className="modal-body">
                                        <p>Are you sure you want to import <strong>{selectedTestIds.size} test(s)</strong>?</p>
                                   </div>
                                   <div className="modal-footer">
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-danger"
                                             onClick={() => setShowConfirmModal(false)}
                                        >
                                             Cancel
                                        </button>
                                        <button
                                             type="button"
                                             className="btn btn-sm btn-outline-success"
                                             onClick={confirmImport}
                                        >
                                             Import
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
