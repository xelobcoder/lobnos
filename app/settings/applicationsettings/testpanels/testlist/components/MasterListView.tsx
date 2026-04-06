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
     upperLimitFemale?: string | null;
     lowerLimitFemale?: string | null;
     upperLimitMale?: string | null;
     lowerLimitMale?: string | null;
     upperLimitChildren?: string | null;
     lowerLimitChildren?: string | null;
     upperLimitNeonates?: string | null;
     lowerLimitNeonates?: string | null;
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
     const [isImporting, setIsImporting] = useState<boolean>(false);
     const allMasterTestsSelected = masterListData.length > 0 && masterListData.every((item) => selectedTestIds.has(item.id));

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
               const rules = Array.isArray(rulesRes?.data)
                    ? rulesRes.data
                    : (Array.isArray(rulesRes) ? rulesRes : []);
               setTestRules(rules);
          } catch (error) {
               console.error('Error loading test rules:', error);
               setTestRules([]);
          } finally {
               setLoadingTestRules(false);
          }
     };

     const hasValue = (value: unknown) => value !== null && value !== undefined && `${value}`.trim() !== '';

     const renderList = (rawValue: string | null | undefined) => {
          if (!rawValue) return <span className="text-muted">-</span>;
          if (!rawValue.includes(',')) return <span>{rawValue}</span>;

          return (
               <ol className="mb-0 ps-3">
                    {rawValue.split(',').map((item, idx) => (
                         <li key={idx}>{item.trim()}</li>
                    ))}
               </ol>
          );
     };

     const renderReferenceConfig = (rule: TestRule) => {
          if (rule.plan === 'fetalBiometry') {
               return <span>BPD, FL, HC, AC (Hadlock EFW)</span>;
          }

          if (rule.plan === 'limits') {
               const hasDemographicRanges = [
                    rule.lowerLimitMale,
                    rule.upperLimitMale,
                    rule.lowerLimitFemale,
                    rule.upperLimitFemale,
                    rule.lowerLimitChildren,
                    rule.upperLimitChildren,
                    rule.lowerLimitNeonates,
                    rule.upperLimitNeonates,
               ].some(hasValue);

               if (hasDemographicRanges) {
                    return (
                         <div className="small">
                              <div>M: {rule.lowerLimitMale || '-'} - {rule.upperLimitMale || '-'}</div>
                              <div>F: {rule.lowerLimitFemale || '-'} - {rule.upperLimitFemale || '-'}</div>
                              <div>C: {rule.lowerLimitChildren || '-'} - {rule.upperLimitChildren || '-'}</div>
                              <div>N: {rule.lowerLimitNeonates || '-'} - {rule.upperLimitNeonates || '-'}</div>
                         </div>
                    );
               }

               if (hasValue(rule.lowerlimit) || hasValue(rule.upperlimit)) {
                    return <span>{rule.lowerlimit || '-'} - {rule.upperlimit || '-'}</span>;
               }
          }

          if (rule.plan === 'options') {
               return renderList(rule.options);
          }

          if (rule.plan === 'textReference' || rule.plan === 'greaterLess' || rule.plan === 'greaterLessEqualTo' || rule.plan === 'time') {
               return renderList(rule.textReference);
          }

          return <span className="text-muted">-</span>;
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

     const handleToggleSelectAll = () => {
          if (allMasterTestsSelected) {
               setSelectedTestIds(new Set());
               return;
          }

          setSelectedTestIds(new Set(masterListData.map((item) => item.id)));
     };

     const confirmImport = async () => {
          const selectedTests = masterListData.filter(t => selectedTestIds.has(t.id));
          if (selectedTests.length === 0) {
               alert('No tests selected for import');
               return;
          }

          setIsImporting(true);
          try {
               const selectedIds = selectedTests.map((test) => test.id).join(',');
               const response = await customFetch(`testpanel/master/list/import?testid=${selectedIds}`);
               const isSuccess = response?.status === true || response?.status === 'success';

               if (isSuccess) {
                    alert(`Successfully imported ${selectedTests.length} test(s).`);
               } else {
                    alert(response?.message || 'Some imports may have failed.');
               }

               setSelectedTestIds(new Set());
               await loadMasterListData();
          } catch (error) {
               console.error('Error importing master list tests:', error);
               alert('Failed to import selected tests.');
          } finally {
               setIsImporting(false);
               setShowConfirmModal(false);
          }
     };

     return (
          <div>
               {masterListData.length > 0 && (
                    <div className="d-flex justify-content-end gap-2 mb-3">
                         <button
                              onClick={handleToggleSelectAll}
                              disabled={masterListData.length === 0}
                              className="btn btn-sm btn-outline-secondary"
                         >
                              {allMasterTestsSelected ? 'Clear Selection' : `Select All (${masterListData.length})`}
                         </button>
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
                                                                 <th>Plan</th>
                                                                 <th>Units</th>
                                                                 <th>Reference / Config</th>
                                                                 <th>Value Format Preview</th>
                                                            </tr>
                                                       </thead>
                                                       <tbody>
                                                            {testRules.map((rule) => (
                                                                 <tr key={rule.id}>
                                                                      <td>{rule.name || 'N/A'}</td>
                                                                      <td>{rule.plan || 'N/A'}</td>
                                                                      <td>{rule.units || 'N/A'}</td>
                                                                      <td>{renderReferenceConfig(rule)}</td>
                                                                      <td>
                                                                           {rule.plan === 'fetalBiometry' ? (
                                                                                <span>{'{"BPD":"","FL":"","HC":"","AC":""}'}</span>
                                                                           ) : (
                                                                                <span className="text-muted">Standard</span>
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
                                             disabled={isImporting}
                                        >
                                             {isImporting ? 'Importing...' : 'Import'}
                                        </button>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}
          </div>
     );
}
