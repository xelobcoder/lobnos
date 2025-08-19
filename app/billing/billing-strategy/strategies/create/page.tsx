'use client'
import React, { useEffect, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../../../components/Auth/customFetch';
import ClinicianIndividualBillingConcession from '../../../../../components/Clinicians/ClinicianIndividualBillingConcession';
import Link from 'next/link';
import { PreviousClinicianBillingRecord } from '../../../../../components/Clinicians/dev.type';

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
          concessionValue: '0',
          isAllTestsConcessionVisible: true,
     });

     // Individual test array state managed locally
     const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
     const [submitting, setSubmitting] = useState(false);
     const [loading, setLoading] = useState(false);
     // Remove modal state, not needed for two-column layout

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
          const concessionValue = test.concessionValue || value;
          const originalPrice = test.originalPrice || 0;

          const discountedValue = concessionMode === "absolute"
               ? pricingType === "discount" ? originalPrice - concessionValue : originalPrice + concessionValue
               : pricingType === "discount" ? originalPrice * (1 - concessionValue / 100) : originalPrice * (1 + concessionValue / 100);

          return {
               testid: test.testid || 0,
               concessionValue,
               discountedValue: parseFloat(discountedValue.toString()) || 0,
               concessionMode,
               pricingType,
               actualPrice: test.actualPrice || originalPrice,
               originalPrice,
               name: test.name || "Unknown Test"
          };
     };


     // Removed addRow and removeRow for single row support
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

               const billingData = {
                    concessionMode: selectionMode,
                    price_type,
                    concessionValue: concessionValueNum,
                    applicableTest: isAllTestsConcessionVisible ? [] : updatedTests,
                    allConcessionApplied: isAllTestsConcessionVisible,
                    valid_from,
                    valid_until: validUntil,
                    description,
                    name: strategyName
               };

               const response = await customPost(`billing/strategies`, 'POST', billingData);
               const { status, message, strategyId } = response;

               if (status === true || strategyId === -1 || strategyId > 0) {
                    toast.success(message || "Billing strategy saved successfully");
               } else {
                    toast.error(message || "Failed to save billing strategy");
               }
          } catch (err) {
               console.error("Submission error:", err);
               toast.error("An error occurred while saving");
          } finally {
               setSubmitting(false);
               setLoading(false);
          }
     };


     const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
     const strategyid = searchParams ? searchParams.get('id') : null;

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
                              concessionValue: response.concessionValue ? String(response.concessionValue) : '0',
                              isAllTestsConcessionVisible: !!response.allconcessionApplied || !!response.allConcessionApplied,
                         });
                         // If applicableTest is present, update selectedTests
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


     const router = { push: (url: string) => { } };

     return (
          <div>
               <Row>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                         <h5 className="fw-bold">Billing Strategies</h5>
                         <Link href="/billing/billing-strategy/strategies" className="btn btn-link">
                              Billing Strategies
                         </Link>
                    </div>
               </Row>
               <Row>
                    {row.isAllTestsConcessionVisible ? (
                         <Col md={12} className="mb-4">
                              <Card className="border-0 shadow-sm">
                                   <Card.Body>
                                        <hr />
                                        <Form onSubmit={e => { e.preventDefault(); handleBillingStrategyFormSubmission(); }}>
                                             {/* ...form groups and logic as before... */}
                                             <Form.Group className="mb-3" controlId="strategyName">
                                                  <Form.Label>Strategy Name</Form.Label>
                                                  <Form.Control
                                                       type="text"
                                                       value={row.strategyName}
                                                       onChange={e => handleRowChange('strategyName', e.target.value)}
                                                       placeholder="Enter strategy name"
                                                       required
                                                  />
                                             </Form.Group>
                                             <Form.Group className="mb-3" controlId="description">
                                                  <Form.Label>Description</Form.Label>
                                                  <Form.Control
                                                       as="textarea"
                                                       rows={2}
                                                       value={row.description}
                                                       onChange={e => handleRowChange('description', e.target.value)}
                                                       placeholder="Enter description"
                                                  />
                                             </Form.Group>
                                             <Form.Group className="mb-3" controlId="applyTo">
                                                  <Form.Label>Apply To</Form.Label>
                                                  <div>
                                                       <Form.Check
                                                            type="radio"
                                                            id="applyConcession"
                                                            label="All Tests"
                                                            checked={row.isAllTestsConcessionVisible}
                                                            onChange={() => handleRowChange('isAllTestsConcessionVisible', true)}
                                                            aria-label="Apply concession to all tests"
                                                       />
                                                       <Form.Check
                                                            type="radio"
                                                            id="applyIndividualConcession"
                                                            label="Individual Tests"
                                                            checked={!row.isAllTestsConcessionVisible}
                                                            onChange={() => handleRowChange('isAllTestsConcessionVisible', false)}
                                                            aria-label="Apply concessions to individual tests"
                                                       />
                                                  </div>
                                             </Form.Group>
                                             {row.isAllTestsConcessionVisible && (
                                                  <>
                                                       <Form.Group className="mb-3" controlId="priceType">
                                                            <Form.Label>Pricing Type</Form.Label>
                                                            <Form.Select
                                                                 value={row.price_type}
                                                                 onChange={e => handleRowChange('price_type', e.target.value)}
                                                            >
                                                                 <option value="discount">Discount</option>
                                                                 <option value="surcharge">Surcharge</option>
                                                            </Form.Select>
                                                       </Form.Group>
                                                       <Form.Group className="mb-3" controlId="concessionMode">
                                                            <Form.Label>Concession Mode</Form.Label>
                                                            <Form.Select
                                                                 value={row.selectionMode}
                                                                 onChange={e => handleRowChange('selectionMode', e.target.value)}
                                                            >
                                                                 <option value="absolute">Absolute</option>
                                                                 <option value="percentage">Percentage</option>
                                                            </Form.Select>
                                                       </Form.Group>
                                                       <Form.Group className="mb-3" controlId="concessionValue">
                                                            <Form.Label>Concession Value</Form.Label>
                                                            <Form.Control
                                                                 type="number"
                                                                 value={row.concessionValue}
                                                                 onChange={e => handleRowChange('concessionValue', e.target.value)}
                                                                 min="0"
                                                                 max={row.selectionMode === "percentage" ? "100" : undefined}
                                                                 step={row.selectionMode === "percentage" ? "0.1" : "0.01"}
                                                                 placeholder={row.selectionMode === "percentage" ? "0-100%" : "Enter amount"}
                                                            />
                                                       </Form.Group>
                                                  </>
                                             )}
                                             <Form.Group className="mb-3" controlId="validFrom">
                                                  <Form.Label>Valid From</Form.Label>
                                                  <Form.Control
                                                       type="date"
                                                       value={row.valid_from}
                                                       onChange={e => handleRowChange('valid_from', e.target.value)}
                                                  />
                                             </Form.Group>
                                             <Form.Group className="mb-3" controlId="validUntil">
                                                  <Form.Label>Valid Until</Form.Label>
                                                  <Form.Control
                                                       type="date"
                                                       value={row.validUntil}
                                                       onChange={e => handleRowChange('validUntil', e.target.value)}
                                                  />
                                             </Form.Group>
                                             <div className="d-flex justify-content-end gap-2">
                                                  <Button
                                                       variant="primary"
                                                       type="submit"
                                                       disabled={submitting || loading || !row.strategyName}
                                                       aria-label="Save billing strategies"
                                                  >
                                                       {submitting || loading ? (
                                                            <>
                                                                 <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                                 <span className="ms-2">Saving...</span>
                                                            </>
                                                       ) : (
                                                            "Save Billing Strategies"
                                                       )}
                                                  </Button>
                                             </div>
                                        </Form>
                                   </Card.Body>
                              </Card>
                         </Col>
                    ) : (
                         <>
                              <Col md={5} style={{ flex: '0 0 40%', maxWidth: '30%' }} className="mb-4">
                                   <Card className="border-0 shadow-sm">
                                        <Card.Body>
                                             <Form onSubmit={e => { e.preventDefault(); handleBillingStrategyFormSubmission(); }}>
                                                  {/* ...form groups and logic as before... */}
                                                  <Form.Group className="mb-3" controlId="strategyName">
                                                       <Form.Label>Strategy Name</Form.Label>
                                                       <Form.Control
                                                            type="text"
                                                            value={row.strategyName}
                                                            onChange={e => handleRowChange('strategyName', e.target.value)}
                                                            placeholder="Enter strategy name"
                                                            required
                                                       />
                                                  </Form.Group>
                                                  <Form.Group className="mb-3" controlId="description">
                                                       <Form.Label>Description</Form.Label>
                                                       <Form.Control
                                                            as="textarea"
                                                            rows={2}
                                                            value={row.description}
                                                            onChange={e => handleRowChange('description', e.target.value)}
                                                            placeholder="Enter description"
                                                       />
                                                  </Form.Group>
                                                  <Form.Group className="mb-3" controlId="applyTo">
                                                       <Form.Label>Apply To</Form.Label>
                                                       <div>
                                                            <Form.Check
                                                                 type="radio"
                                                                 id="applyConcession"
                                                                 label="All Tests"
                                                                 checked={row.isAllTestsConcessionVisible}
                                                                 onChange={() => handleRowChange('isAllTestsConcessionVisible', true)}
                                                                 aria-label="Apply concession to all tests"
                                                            />
                                                            <Form.Check
                                                                 type="radio"
                                                                 id="applyIndividualConcession"
                                                                 label="Individual Tests"
                                                                 checked={!row.isAllTestsConcessionVisible}
                                                                 onChange={() => handleRowChange('isAllTestsConcessionVisible', false)}
                                                                 aria-label="Apply concessions to individual tests"
                                                            />
                                                       </div>
                                                  </Form.Group>
                                                  {row.isAllTestsConcessionVisible && (
                                                       <>
                                                            <Form.Group className="mb-3" controlId="priceType">
                                                                 <Form.Label>Pricing Type</Form.Label>
                                                                 <Form.Select
                                                                      value={row.price_type}
                                                                      onChange={e => handleRowChange('price_type', e.target.value)}
                                                                 >
                                                                      <option value="discount">Discount</option>
                                                                      <option value="surcharge">Surcharge</option>
                                                                 </Form.Select>
                                                            </Form.Group>
                                                            <Form.Group className="mb-3" controlId="concessionMode">
                                                                 <Form.Label>Concession Mode</Form.Label>
                                                                 <Form.Select
                                                                      value={row.selectionMode}
                                                                      onChange={e => handleRowChange('selectionMode', e.target.value)}
                                                                 >
                                                                      <option value="absolute">Absolute</option>
                                                                      <option value="percentage">Percentage</option>
                                                                 </Form.Select>
                                                            </Form.Group>
                                                            <Form.Group className="mb-3" controlId="concessionValue">
                                                                 <Form.Label>Concession Value</Form.Label>
                                                                 <Form.Control
                                                                      type="number"
                                                                      value={row.concessionValue}
                                                                      onChange={e => handleRowChange('concessionValue', e.target.value)}
                                                                      min="0"
                                                                      max={row.selectionMode === "percentage" ? "100" : undefined}
                                                                      step={row.selectionMode === "percentage" ? "0.1" : "0.01"}
                                                                      placeholder={row.selectionMode === "percentage" ? "0-100%" : "Enter amount"}
                                                                 />
                                                            </Form.Group>
                                                       </>
                                                  )}
                                                  <Form.Group className="mb-3" controlId="validFrom">
                                                       <Form.Label>Valid From</Form.Label>
                                                       <Form.Control
                                                            type="date"
                                                            value={row.valid_from}
                                                            onChange={e => handleRowChange('valid_from', e.target.value)}
                                                       />
                                                  </Form.Group>
                                                  <Form.Group className="mb-3" controlId="validUntil">
                                                       <Form.Label>Valid Until</Form.Label>
                                                       <Form.Control
                                                            type="date"
                                                            value={row.validUntil}
                                                            onChange={e => handleRowChange('validUntil', e.target.value)}
                                                       />
                                                  </Form.Group>
                                                  <div className="d-flex justify-content-end gap-2">
                                                       <Button
                                                            variant="primary"
                                                            type="submit"
                                                            disabled={submitting || loading || !row.strategyName}
                                                            aria-label="Save billing strategies"
                                                       >
                                                            {submitting || loading ? (
                                                                 <>
                                                                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                                                      <span className="ms-2">Saving...</span>
                                                                 </>
                                                            ) : (
                                                                 "Save Billing Strategies"
                                                            )}
                                                       </Button>
                                                  </div>
                                             </Form>
                                        </Card.Body>
                                   </Card>
                              </Col>
                              <Col md={8} style={{ flex: '0 0 60%', maxWidth: '70%' }}>
                                   {!row.isAllTestsConcessionVisible && (
                                        <Card className="border-0 shadow-sm">
                                             <Card.Body>
                                                  <h5 className="fw-bold mb-3">Select Individual Tests</h5>
                                                  <ClinicianIndividualBillingConcession
                                                       selectedTests={selectedTests}
                                                       setSelectedTests={setSelectedTests}
                                                  />
                                             </Card.Body>
                                        </Card>
                                   )}
                              </Col>
                         </>
                    )}
               </Row>
          </div>
     );
}

export default BillingStrategyForm;