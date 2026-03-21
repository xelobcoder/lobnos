'use client'
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import ClinicianIndividualBillingConcession from '../../../../../components/Clinicians/ClinicianIndividualBillingConcession';
import Link from 'next/link';
import { PreviousClinicianBillingRecord } from '../../../../../components/Clinicians/dev.type';
import { Form } from 'react-bootstrap';
import { RiArrowLeftLine, RiAddLine } from '@remixicon/react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';

interface SelectedTest {
     testName: string;
     originalPrice: number;
     concessionValue: number;
     discountedValue: number;
     actualPrice: number;
     testid: number;
     pricingType: "surcharge" | "discount";
     concessionMode: "absolute" | "percentage";
}

function BillingStrategyForm() {
     const [row, setRow] = useState<{
          strategyName: string;
          description: string;
          valid_from: string;
          validUntil: string;
          price_type: string;
          isNHIS: boolean;
          selectionMode: string;
          concessionValue: string;
          isAllTestsConcessionVisible: boolean;
     }>({
          strategyName: '',
          description: '',
          valid_from: '',
          validUntil: '',
          price_type: 'discount',
          selectionMode: 'absolute',
          isNHIS: false,
          concessionValue: '0',
          isAllTestsConcessionVisible: true,
     });

     // Individual test array state managed locally
     const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
     const [submitting, setSubmitting] = useState(false);
     const [loading, setLoading] = useState(false);

     const handleRowChange = (field: string, value: any) => {
          setRow(prev => ({ ...prev, [field]: value }));
          // If switching to 'All Tests', clear selectedTests
          if (field === 'isAllTestsConcessionVisible' && value === true) {
               setSelectedTests([]);
          }
     };


     const calculateTestPrices = (
          test,
          mode,
          type,
          value
     ) => {
          const concessionMode = test.concessionMode || mode;
          const pricingType = test.pricingType || type;
          const concessionValue = parseFloat(test.concessionValue) || parseFloat(value) || 0;
          const originalPrice = parseFloat(test.originalPrice) || 0;

          const discountedValue = concessionMode === "absolute"
               ? pricingType === "discount" ? originalPrice - concessionValue : originalPrice + concessionValue
               : pricingType === "discount" ? originalPrice * (1 - concessionValue / 100) : originalPrice * (1 + concessionValue / 100);

          return {
               testid: test.testid || 0,
               concessionValue,
               discountedValue: parseFloat(discountedValue.toString()) || 0,
               concessionMode,
               pricingType,
               actualPrice: parseFloat(test.actualPrice) || originalPrice,
               originalPrice,
               name: test.name || "Unknown Test"
          };
     };


     const ensureNumericValues = (test: any) => {
          const safeParseFloat = (value: any) => {
               if (typeof value === 'number') return value;
               if (typeof value === 'string') {
                    const parsed = parseFloat(value);
                    return isNaN(parsed) ? NaN : parsed;
               }
               return NaN;
          };

          const safeParseInt = (value: any) => {
               if (typeof value === 'number') return Math.floor(value);
               if (typeof value === 'string') {
                    const parsed = parseInt(value, 10);
                    return isNaN(parsed) ? NaN : parsed;
               }
               return NaN;
          };

          return {
               ...test,
               testid: safeParseInt(test.testid),
               concessionValue: safeParseFloat(test.concessionValue),
               discountedValue: safeParseFloat(test.discountedValue),
               originalPrice: safeParseFloat(test.originalPrice),
               actualPrice: safeParseFloat(test.actualPrice),
          };
     };

     const handleBillingStrategyFormSubmission = async () => {
          const {
               strategyName,
               description,
               valid_from,
               validUntil,
               price_type,
               selectionMode,
               concessionValue,
               isAllTestsConcessionVisible
          } = row;

          try {
               setSubmitting(true);
               setLoading(true);
               const concessionValueNum = parseFloat(concessionValue);
               if (isNaN(concessionValueNum) || concessionValueNum < 0) {
                    toast.error("Please enter a valid non-negative concession value");
                    return;
               }

               if (!strategyName) {
                    toast.error("Strategy name is required");
                    return;
               }

               if (valid_from && validUntil && new Date(valid_from) >= new Date(validUntil)) {
                    toast.error("Valid From must be before Valid Until");
                    return;
               }

               if (!isAllTestsConcessionVisible && (!selectedTests || selectedTests.length === 0 || !selectedTests.some(test => test && test.testid))) {
                    toast.error("Please select at least one test for individual concessions");
                    return;
               }

               const updatedTests = selectedTests.map(test =>
                    calculateTestPrices(test, test.concessionMode || selectionMode, test.pricingType || price_type, test.concessionValue || concessionValueNum)
               );

               const numericTests = updatedTests.map(ensureNumericValues);

               const validatedTests = numericTests.filter(test =>
                    !isNaN(test.testid) && test.testid > 0 &&
                    test.name && test.name.trim() !== '' &&
                    !isNaN(test.concessionValue) && test.concessionValue >= 0 &&
                    !isNaN(test.discountedValue) && test.discountedValue >= 0 &&
                    !isNaN(test.originalPrice) && test.originalPrice >= 0
               );

               if (!isAllTestsConcessionVisible && validatedTests.length === 0 && selectedTests.length > 0) {
                    toast.error("None of the selected tests have valid data. Please check your selections.");
                    console.log("Validated Tests:", validatedTests);
                    console.log("Selected Tests:", selectedTests);
                    console.log(updatedTests);
                    return;
               }

               const billingData = {
                    concessionMode: selectionMode,
                    price_type,
                    concessionValue: concessionValueNum,
                    applicableTest: isAllTestsConcessionVisible ? [] : validatedTests,
                    allconcessionApplied: isAllTestsConcessionVisible,
                    valid_from,
                    valid_until: validUntil,
                    description,
                    name: strategyName,
                    isNHIS: row.isNHIS
               };

               const isUpdate = !!strategyid;
               const endpoint = isUpdate ? `billing/strategies/${strategyid}` : `billing/strategies`;
               const method = isUpdate ? 'PUT' : 'POST';

               const response = await customPost(endpoint, method, billingData);
               const { status, message, error, strategyId } = response;

               if (status === true || strategyId === -1 || strategyId > 0) {
                    toast.success(message || "Billing strategy saved successfully");

                    if (!isUpdate && strategyId && strategyId > 0) {
                         window.location.href = `${window.location.pathname}?id=${strategyId}`;
                         return;
                    }
               } else {
                    const errorMessage = error || message || "Failed to save billing strategy";
                    toast.error(errorMessage);
               }
          } catch (err) {
               console.error("Submission error:", err);
               toast.error("An error occurred while saving");
          } finally {
               setSubmitting(false);
               setLoading(false);
          }
     };


     const searchParams = useSearchParams();
     const strategyid = searchParams?.get('id');

     const [previousRecords, setPreviousRecords] = useState<PreviousClinicianBillingRecord | null>(null);
     const [hasStrategy, setHasStrategy] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          async function fetchData() {
               if (!strategyid) {
                    setError("Invalid request.");
                    setLoading(false);
                    return;
               }
               try {
                    const checkingResponse = await customFetch(`billing/strategies/check/${strategyid}`);
                    setHasStrategy(checkingResponse?.hasStrategy ?? false);
                    if (!checkingResponse || !checkingResponse.hasStrategy) {
                         setPreviousRecords(null);
                         setLoading(false);
                         return;
                    }
                    const response = await customFetch(`billing/strategies/${strategyid}`);
                    if (typeof response !== "object" || !response) {
                         setError("Error loading billing strategy.");
                    } else {
                         setPreviousRecords(response as PreviousClinicianBillingRecord);
                         setRow({
                              strategyName: response.name || '',
                              description: response.description || '',
                              valid_from: response.valid_from ? response.valid_from.substring(0, 10) : '',
                              validUntil: response.valid_until ? response.valid_until.substring(0, 10) : '',
                              price_type: response.price_type || '',
                              selectionMode: response.concessionMode || '',
                              isNHIS: !!response.isNHIS,
                              concessionValue: response.concessionValue ? String(response.concessionValue) : '0',
                              isAllTestsConcessionVisible: !!response.allconcessionApplied || !!response.allConcessionApplied,
                         });
                         if (Array.isArray(response.applicableTest) && response.applicableTest.length > 0) {
                              const NewApplicableTest = response.applicableTest.map(test => ({
                                   ...test,
                                   testName: test.name
                              }));
                              setSelectedTests(NewApplicableTest);
                         } else {
                              setSelectedTests([]);
                         }
                    }
               } catch (err) {
                    setError("Error loading billing strategy.");
               } finally {
                    setLoading(false);
               }
          }
          fetchData();
     }, [strategyid]);




     return (
          <div>
               <>
                    <div className="mx-2 d-flex justify-content-between my-2">
                         <h5 className="text-capitalize pls-label bg-secondary-subtle  pls-color br-5">
                              {strategyid ? 'Edit Billing Strategy' : 'Create Billing Strategy'}
                         </h5>
                         <div className="d-flex gap-2">
                              {strategyid && (
                                   <button onClick={() => window.location.href = '/billing/billing-strategy/strategies/create'} className="btn btn-outline-success btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                        <RiAddLine size={16} />
                                        Create New Strategy
                                   </button>
                              )}
                              <Link href="/billing/billing-strategy/strategies" className="btn btn-outline-primary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}>
                                   <RiArrowLeftLine size={16} />
                                   Billing Strategies
                              </Link>
                         </div>
                    </div>
<hr/>
                    <div className="row">
                         <div >
                              <div >
                                   <form className="mx-4" onSubmit={e => { e.preventDefault(); handleBillingStrategyFormSubmission(); }}>
                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end d-flex justify-content-end">
                                                  <Form.Label className='fw-bold text-end'>Strategy Name*</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <input
                                                       type="text"
                                                       className="custom-input form-control-sm"
                                                       value={row.strategyName}
                                                       onChange={e => handleRowChange('strategyName', e.target.value)}
                                                       placeholder="Enter strategy name"
                                                       required
                                                  />
                                             </div>
                                        </div>

                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end">
                                                  <Form.Label className='fw-bold'>Description</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <textarea
                                                       className="custom-input form-control-sm"
                                                       rows={3}
                                                       value={row.description}
                                                       onChange={e => handleRowChange('description', e.target.value)}
                                                       placeholder="Enter description"
                                                  />
                                             </div>
                                        </div>

                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end">
                                                  <Form.Label className='fw-bold'>Apply To</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <div>
                                                       <div className="form-check">
                                                            <input
                                                                 className="form-check-input"
                                                                 type="radio"
                                                                 id="applyConcession"
                                                                 checked={row.isAllTestsConcessionVisible}
                                                                 onChange={() => handleRowChange('isAllTestsConcessionVisible', true)}
                                                            />
                                                            <label className="form-check-label" htmlFor="applyConcession">
                                                                 All Tests
                                                            </label>
                                                       </div>
                                                       <div className="form-check">
                                                            <input
                                                                 className="form-check-input"
                                                                 type="radio"
                                                                 id="applyIndividualConcession"
                                                                 checked={!row.isAllTestsConcessionVisible}
                                                                 onChange={() => handleRowChange('isAllTestsConcessionVisible', false)}
                                                            />
                                                            <label className="form-check-label" htmlFor="applyIndividualConcession">
                                                                 Individual Tests
                                                            </label>
                                                       </div>
                                                  </div>
                                             </div>
                                        </div>

                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end">
                                                  <Form.Label className='fw-bold'>NHIS</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <div className="form-check">
                                                       <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id="isNHIS"
                                                            checked={row.isNHIS}
                                                            onChange={(e) => handleRowChange('isNHIS', e.target.checked)}
                                                       />
                                                       <label className="form-check-label" htmlFor="isNHIS">
                                                            Is NHIS Strategy
                                                       </label>
                                                  </div>
                                             </div>
                                        </div>

                                        {row.isAllTestsConcessionVisible && (
                                             <>
                                                  <div className="row mb-3">
                                                       <div className="col-md-4 d-flex justify-content-end">
                                                            <Form.Label className='fw-bold'>Pricing Type</Form.Label>
                                                       </div>
                                                       <div className="col-md-5">
                                                            <select
                                                                 className="custom-select form-select-sm"
                                                                 value={row.price_type}
                                                                 onChange={e => handleRowChange('price_type', e.target.value)}
                                                            >
                                                                 <option value="discount">Discount</option>
                                                                 <option value="surcharge">Surcharge</option>
                                                            </select>
                                                       </div>
                                                  </div>

                                                  <div className="row mb-3">
                                                       <div className="col-md-4 d-flex justify-content-end">
                                                            <Form.Label className='fw-bold'>Concession Mode</Form.Label>
                                                       </div>
                                                       <div className="col-md-5">
                                                            <select
                                                                 className="form-select form-select-sm"
                                                                 value={row.selectionMode}
                                                                 onChange={e => handleRowChange('selectionMode', e.target.value)}
                                                            >
                                                                 <option value="absolute">Absolute</option>
                                                                 <option value="percentage">Percentage</option>
                                                            </select>
                                                       </div>
                                                  </div>

                                                  <div className="row mb-3">
                                                       <div className="col-md-4 d-flex justify-content-end">
                                                            <Form.Label className='fw-bold'>Concession Value</Form.Label>
                                                       </div>
                                                       <div className="col-md-5">
                                                            <input
                                                                 type="number"
                                                                 className="custom-input form-control-sm"
                                                                 value={row.concessionValue}
                                                                 onChange={e => handleRowChange('concessionValue', e.target.value)}
                                                                 min="0"
                                                                 max={row.selectionMode === "percentage" ? "100" : undefined}
                                                                 step={row.selectionMode === "percentage" ? "0.1" : "0.01"}
                                                                 placeholder={row.selectionMode === "percentage" ? "0-100%" : "Enter amount"}
                                                            />
                                                       </div>
                                                  </div>
                                             </>
                                        )}

                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end">
                                                  <Form.Label className='fw-bold'>Valid From</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <input
                                                       type="date"
                                                       className="custom-input form-control-sm"
                                                       value={row.valid_from}
                                                       onChange={e => handleRowChange('valid_from', e.target.value)}
                                                  />
                                             </div>
                                        </div>

                                        <div className="row mb-3">
                                             <div className="col-md-4 d-flex justify-content-end">
                                                  <Form.Label className='fw-bold'>Valid Until</Form.Label>
                                             </div>
                                             <div className="col-md-5">
                                                  <input
                                                       type="date"
                                                       className="custom-input form-control-sm"
                                                       value={row.validUntil}
                                                       onChange={e => handleRowChange('validUntil', e.target.value)}
                                                  />
                                             </div>
                                        </div>



                                        {
                                             row.isAllTestsConcessionVisible && (
                                                  <>
                                                       <hr />
                                                       <div className="d-flex justify-content-center">
                                                            <button
                                                                 type="submit"
                                                                 className="btn btn-success  mt-2"
                                                                 disabled={submitting || loading || !row.strategyName}
                                                            >
                                                                 {submitting || loading ? (
                                                                      <>
                                                                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                           Saving...
                                                                      </>
                                                                 ) : (
                                                                      "Save Billing Strategy"
                                                                 )}
                                                            </button>
                                                       </div>
                                                  </>
                                             )
                                        }
                                   </form>
                              </div>
                         </div>

                         {!row.isAllTestsConcessionVisible && (
                              <div className='mt-3'>
                                   <div className="card" style={{ borderRadius: '0.75rem', borderColor: 'var(--bs-border-color)' }}>
                                        <div className="card-body">
                                             <ClinicianIndividualBillingConcession
                                                  selectedTests={selectedTests}
                                                  setSelectedTests={setSelectedTests}
                                             />
                                        </div>
                                        <div className="card-footer d-flex justify-content-end" style={{ backgroundColor: 'var(--bs-card-bg)' }}>
                                             <div className='mx-1'>
                                                  <button
                                                       type="button"
                                                       className="btn btn-success btn-sm mt-2"
                                                       disabled={submitting || loading || !row.strategyName}
                                                       onClick={handleBillingStrategyFormSubmission}
                                                  >
                                                       {submitting || loading ? (
                                                            <>
                                                                 <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                                 Saving...
                                                            </>
                                                       ) : (
                                                            "Save Billing Strategy"
                                                       )}
                                                  </button>
                                             </div>
                                        </div>
                                   </div>
                              </div>
                         )}



                    </div>
               </>
          </div>
     );
}

export default BillingStrategyForm;