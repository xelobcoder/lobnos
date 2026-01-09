"use client";
import { useEffect, useState } from "react";
import { Button, Spinner, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { customFetch, customPost, currencyFormatter } from "../../../../../components/Auth/customFetch";
import Loader from "../../../../../components/isLoading";
import { RiSaveLine, RiRefreshLine, RiMoneyDollarCircleLine } from '@remixicon/react';

interface TestPanel {
     id: number;
     name: string;
     price: number;
     cost?: number;
     shorttext?: string;
     category?: string;
}

export default function TestPanelPricing() {
     const [originalData, setOriginalData] = useState<TestPanel[]>([]);
     const [data, setData] = useState<TestPanel[]>([]);
     const [isLoading, setIsLoading] = useState<boolean>(true);
     const [isSaving, setIsSaving] = useState<boolean>(false);
     const [searchTerm, setSearchTerm] = useState<string>("");
     const [usePriceAsCost, setUsePriceAsCost] = useState<boolean>(false);

     const fetchData = async () => {
          setIsLoading(true);
          try {
               const response = await customFetch('testpanel/list/bulk');
               const rawData = response?.data || [];
               const testData = rawData.map((test: any) => ({
                    id: test.id,
                    name: test.name,
                    price: test.testprice,
                    cost: test.testcost,
                    shorttext: test.shorttext,
                    category: test.category
               }));
               setOriginalData(testData);
               setData(testData);
          } catch (error) {
               toast.error("Failed to load test panels");
               setOriginalData([]);
               setData([]);
          } finally {
               setIsLoading(false);
          }
     };

     useEffect(() => {
          fetchData();
     }, []);

     const handleValueChange = (testId: number, field: 'price' | 'cost', value: string) => {
          const numValue = parseFloat(value) || 0;
          setData(prev => prev.map(test =>
               test.id === testId
                    ? {
                         ...test,
                         [field]: numValue,
                         ...(field === 'price' && usePriceAsCost ? { cost: numValue } : {})
                    }
                    : test
          ));
     };

     const applyPricesToCosts = () => {
          setData(prev => prev.map(test => ({
               ...test,
               cost: test.price
          })));
          toast.info("All costs updated to match prices");
     };

     const saveAllChanges = async () => {
          const changedTests = data.filter((test, index) => {
               const original = originalData[index];
               return original && (test.price !== original.price || test.cost !== original.cost);
          });

          if (changedTests.length === 0) {
               toast.info("No changes to save");
               return;
          }

          setIsSaving(true);
          try {
               const bulkData = {
                    tests: changedTests.map(test => ({
                         testid: test.id,
                         price: test.price,
                         cost: test.cost
                    }))
               };

               const response = await customPost('testpanel/bulkpricing', 'PUT', bulkData);

               if (response.status === "success" && response.statusCode === 200) {
                    toast.success(`Successfully updated ${changedTests.length} test panels`);
                    setOriginalData([...data]);
               } else {
                    toast.error(response?.message || "Failed to update pricing");
               }
          } catch (error) {
               toast.error("Failed to update pricing");
          } finally {
               setIsSaving(false);
          }
     };

     const filteredData = data.filter(test =>
          test.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.shorttext?.toLowerCase().includes(searchTerm.toLowerCase())
     );

     if (isLoading) return <Loader />;

     return (
          <div className="container-fluid p-3">
               <div className="d-flex align-items-center gap-2">
                    <RiMoneyDollarCircleLine size={24} className="text-primary" />
                    <h2 className="fs-5 fw-bold text-dark mb-0">Test Panel Pricing Management</h2>
               </div>
               <hr />
               <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex flex-column gap-2">
                         <Form.Check
                              type="checkbox"
                              label="Use price as cost price"
                              checked={usePriceAsCost}
                              onChange={(e) => setUsePriceAsCost((e.target as HTMLInputElement).checked)}
                         />
                    </div>
                    <div className="d-flex gap-2">
                         <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={applyPricesToCosts}
                         >
                              Apply Prices to Costs
                         </Button>
                         <Button variant="outline-secondary" size="sm" onClick={fetchData}>
                              <RiRefreshLine size={16} className="me-1" />
                              Refresh
                         </Button>
                    </div>
               </div>

               <hr />

               <div className="card shadow-sm">
                    <div className="card-body">
                         <div className="mb-3">
                              <input
                                   type="text"
                                   className="form-control"
                                   placeholder="Search by test name or short text..."
                                   value={searchTerm}
                                   onChange={(e) => setSearchTerm(e.target.value)}
                              />
                         </div>

                         <div className="table-responsive">
                              <table className="table table-hover table-striped">
                                   <thead className="sticky-top bg-body-tertiary">
                                        <tr>
                                             <th style={{ width: '5%' }}>ID</th>
                                             <th style={{ width: '40%' }}>Test Name</th>
                                             <th style={{ width: '20%' }}>Cost</th>
                                             <th style={{ width: '20%' }}>Price</th>
                                        </tr>
                                   </thead>
                                   <tbody>
                                        {filteredData.length === 0 ? (
                                             <tr>
                                                  <td colSpan={4} className="text-center text-muted py-4">
                                                       {searchTerm ? "No tests found matching your search" : "No test panels available"}
                                                  </td>
                                             </tr>
                                        ) : (
                                             filteredData.map((test) => (
                                                  <tr key={test.id}>
                                                       <td>{test.id}</td>
                                                       <td>
                                                            <strong>{test.name}</strong>
                                                            {test.shorttext && (
                                                                 <div className="text-muted small">({test.shorttext})</div>
                                                            )}
                                                       </td>
                                                       <td>
                                                            <input
                                                                 type="number"
                                                                 className="form-control form-control-sm"
                                                                 value={test.cost || 0}
                                                                 onChange={(e) => handleValueChange(test.id, 'cost', e.target.value)}
                                                                 step="0.01"
                                                                 min="0"
                                                                 style={{ maxWidth: '120px' }}
                                                            />
                                                       </td>
                                                       <td>
                                                            <input
                                                                 type="number"
                                                                 className="form-control form-control-sm"
                                                                 value={test.price || 0}
                                                                 onChange={(e) => handleValueChange(test.id, 'price', e.target.value)}
                                                                 step="0.01"
                                                                 min="0"
                                                                 style={{ maxWidth: '120px' }}
                                                            />
                                                       </td>
                                                  </tr>
                                             ))
                                        )}
                                   </tbody>
                              </table>
                         </div>

                         <div className="d-flex justify-content-between align-items-center mt-3">
                              <div className="text-muted small">
                                   Showing {filteredData.length} of {data.length} test panels
                              </div>
                              <div className="d-flex gap-2">
                                   <Button
                                        variant="success"
                                        size="sm"
                                        onClick={saveAllChanges}
                                        disabled={isSaving}
                                   >
                                        {isSaving ? (
                                             <>
                                                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                                                  Saving Changes...
                                             </>
                                        ) : (
                                             <>
                                                  <RiSaveLine size={16} className="me-1" />
                                                  Save All Changes
                                             </>
                                        )}
                                   </Button>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     );
}
