"use client";

import React, { useEffect, useState } from "react";
import { Form, Spinner, Row, Col, Card, Table, Button } from "react-bootstrap";
import ClinicianIndividualBillingConcession from "./ClinicianIndividualBillingConcession";
import { customPost } from "../Auth/customFetch";
import { RiDeleteBinLine } from '@remixicon/react';
import styles from '../../styles/SmsTemplateList.module.css';
import { toast } from 'react-toastify';
import { IBillingStrategy, ApplicableTest, ApplicableEntity, EntityType, BillingStrategyRequestBody } from "./dev.type";


function formatDateOnly(isoString: string | null) {
	if (!isoString) return;
	const date = new Date(isoString);
	const pad = (num) => String(num).padStart(2, '0');
	const year = date.getFullYear();
	const month = pad(date.getMonth() + 1);
	const day = pad(date.getDate());
	return `${year}-${month}-${day}`;
}


interface PreviousClinicianBillingRecord extends IBillingStrategy {
	applicableTest: ApplicableTest[];
	applicableEntities: ApplicableEntity[];
}

interface ClinicianBillingModeViewProps {
	strategyid: number;
	previousRecords: PreviousClinicianBillingRecord | null;
}

interface Entity {
	id: number;
	name: string;
	entity_type: EntityType;

	insuranceName?: string
}



export default function ClinicianBillingModeView({
	previousRecords,
	strategyid,
}: ClinicianBillingModeViewProps) {
	const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage">("absolute");
	const [price_type, setPriceType] = useState<"discount" | "surcharge">("discount");
	const [strategyName, setStrategyName] = useState('');
	const [description, setDescription] = useState<string | null>(null);
	const [lastupdated, setLastUpdated] = useState<string | null>(null);
	const [concessionValue, setConcessionValue] = useState<string>("0");
	const [selectedTests, setSelectedTests] = useState<ApplicableTest[]>([]);
	const [applicableEntities, setApplicableEntities] = useState<ApplicableEntity[]>([]);
	const [isAllTestsConcessionVisible, setIsAllTestsConcessionVisible] = useState(true);
	const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
	const [selectedEntityIds, setSelectedEntityIds] = useState<number[]>([]);
	const [submitting, setSubmitting] = useState<boolean>(false);
	const [valid_from, setValidFrom] = useState<string | null>(null);
	const [validUntil, setValidUntil] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const calculateTestPrices = (
		test: Partial<ApplicableTest>,
		mode: "absolute" | "percentage",
		type: "discount" | "surcharge",
		value: number
	): ApplicableTest => {
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



	const handleBillingStrategyFormSubmission = async () => {
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

			if (!isAllTestsConcessionVisible && selectedTests.length === 0) {
				toast.error("Please select at least one test for individual concessions");
				return;
			}

			const updatedTests = selectedTests.map(test =>
				calculateTestPrices(test, test.concessionMode || selectionMode, test.pricingType || price_type, test.concessionValue || concessionValueNum)
			);

			const billingData: BillingStrategyRequestBody = {
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

			const response = await customPost(`/api/v1/billing/strategies`, 'POST', billingData);
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

	const handleRemoveSelectedTests = () => {
		setSelectedTests((prevSelectedTests) =>
			prevSelectedTests.filter((test) => !selectedTestIds.includes(test.testid))
		);
		setSelectedTestIds([]);
	};

	const handleTestSelectionToggle = (testid: number) => {
		setSelectedTestIds((prevSelectedIds) =>
			prevSelectedIds.includes(testid)
				? prevSelectedIds.filter((id) => id !== testid)
				: [...prevSelectedIds, testid]
		);
	};

	const handleConcessionToggle = (mode: "all" | "individual") => {
		setIsAllTestsConcessionVisible(mode === "all");
		if (mode === "all") {
			setSelectedTests([]);
		}
	};

	useEffect(() => {
		if (previousRecords) {
			const {
				concessionValue,
				concessionMode,
				allConcessionApplied,
				applicableTest,
				updatedon,
				price_type,
				name,
				valid_from,
				valid_until,
				applicableEntities,
				description
			} = previousRecords;

			setIsAllTestsConcessionVisible(allConcessionApplied == 1);
			setConcessionValue(concessionValue.toString() || "0");
			setSelectionMode(concessionMode || "absolute");
			setPriceType(price_type || "discount");
			setStrategyName(name)
			setDescription(description || null);
			setLastUpdated(updatedon);
			setApplicableEntities(applicableEntities || []);
			setValidFrom(formatDateOnly(valid_from) || null);
			setValidUntil(formatDateOnly(valid_until) || null);



			if (Array.isArray(applicableTest) && applicableTest.length > 0) {
				setSelectedTests(applicableTest.map(test =>
					calculateTestPrices(
						test,
						test.concessionMode || concessionMode || "absolute",
						test.pricingType || price_type || "discount",
						test.concessionValue || parseFloat(concessionValue.toString() || "0")
					)
				));
			}
		}
	}, [previousRecords]);

	const handleEntitySelectionToggle = (entityId: number) => {
		setSelectedEntityIds((prevSelectedIds) =>
			prevSelectedIds.includes(entityId)
				? prevSelectedIds.filter((id) => id !== entityId)
				: [...prevSelectedIds, entityId]
		);
	};



	const handleDeleteEntity = async (item: ApplicableEntity) => {
		try {
			if (!item.id) return;
			const requestBody = {
				associatedid: item.id,
				category: item.entity_type
			}
			const response: { result: boolean, message: string } = await customPost(`billing/strategies/remove/entity/${strategyid}`, 'DELETE', requestBody);

			const { result, message } = response;
			if (result) {
				toast.success(message || "Entity deleted successfully");
				setApplicableEntities((prevEntities) => prevEntities.filter(entity => entity.id !== item.id));
			} else {
				toast.error(message || "Failed to delete entity");
			}
		} catch (err) {
			console.error("Error deleting entity:", err);
			toast.error("An error occurred while deleting the entity");
		}

	}

	return (
		<div>
			<Card>
				<Card.Header className="d-flex justify-content-between align-items-center p-3">

					{lastupdated && (
						<small className="text-muted">
							Last updated: {new Date(lastupdated).toLocaleDateString()} {new Date(lastupdated).toLocaleTimeString()}
						</small>
					)}
				</Card.Header>
				<Card.Body>
					{strategyName && <h4 className="mb-3">{strategyName}</h4>}
					<hr />
					<Row>
						{/* Left Column: Form */}
						<Col md={4} className="mb-4">
							<Card className="border-0 shadow-sm">
								<Card.Body>
									{/* Strategy Name */}
									<Form.Group className="mb-3">
										<Form.Label className="fw-bold">Strategy Name (Required)</Form.Label>
										<Form.Control
											id="strategyName"
											type="text"
											value={strategyName}
											onChange={(e) => setStrategyName(e.target.value)}
											placeholder="Enter strategy name"
											aria-label="Strategy name"
											required
										/>
									</Form.Group>

									{/* Description */}
									<Form.Group className="mb-3">
										<Form.Label className="fw-bold">Description (Optional)</Form.Label>
										<Form.Control
											id="description"
											as="textarea"
											rows={3}
											value={description || ''}
											onChange={(e) => setDescription(e.target.value || null)}
											placeholder="Enter description"
											aria-label="Description"
										/>
									</Form.Group>

									{/* All Tests Concession Section */}
									<Form.Group className="mb-3">
										<Form.Check
											type="radio"
											id="applyConcession"
											label="Apply a concession on all tests"
											checked={isAllTestsConcessionVisible}
											onChange={() => handleConcessionToggle("all")}
											aria-label="Apply concession to all tests"
										/>
									</Form.Group>

									{isAllTestsConcessionVisible && (
										<div className="p-3 bg-light rounded mb-3">
											<p className="text-muted small mb-3">
												This will apply a {price_type} amount, either a percentage or an absolute amount,
												to all tests for the category. A {price_type} will {price_type === "discount" ? "reduce" : "increase"}
												the price of each test by the specified value.
											</p>

											<Form.Group className="mb-3">
												<Form.Label className="fw-bold">Pricing Type</Form.Label>
												<Form.Select
													id="price_type"
													value={price_type}
													onChange={(e) => setPriceType(e.target.value as "discount" | "surcharge")}
													aria-label="Select pricing type"
												>
													<option value="discount">Discount</option>
													<option value="surcharge">Surcharge</option>
												</Form.Select>
											</Form.Group>

											<Form.Group className="mb-3">
												<Form.Label className="fw-bold">Concession Mode</Form.Label>
												<Form.Select
													id="concessionMode"
													value={selectionMode}
													onChange={(e) => setSelectionMode(e.target.value as "absolute" | "percentage")}
													aria-label="Select concession mode"
												>
													<option value="absolute">Absolute</option>
													<option value="percentage">Percentage</option>
												</Form.Select>
											</Form.Group>

											<Form.Group className="mb-3">
												<Form.Label className="fw-bold">
													{selectionMode === "percentage" ? "Percentage Value" : "Amount"}
												</Form.Label>
												<Form.Control
													id="concessionValue"
													type="number"
													value={concessionValue}
													onChange={(e) => {
														const value = e.target.value;
														if (value === "" || parseFloat(value) < 0) {
															setConcessionValue("0");
														} else if (selectionMode === "percentage" && parseFloat(value) > 100) {
															setConcessionValue("100");
														} else {
															setConcessionValue(value);
														}
													}}
													placeholder={selectionMode === "percentage" ? "0-100%" : "Enter amount"}
													min="0"
													max={selectionMode === "percentage" ? "100" : undefined}
													step={selectionMode === "percentage" ? "0.1" : "0.01"}
													aria-label={selectionMode === "percentage" ? "Percentage value" : "Amount"}
												/>
											</Form.Group>


										</div>
									)}

									{/* Individual Tests Concession Section */}
									<Form.Group className="mb-3">
										<Form.Check
											type="radio"
											id="applyIndividualConcession"
											label="Apply concessions to individual tests"
											checked={!isAllTestsConcessionVisible}
											onChange={() => handleConcessionToggle("individual")}
											aria-label="Apply concessions to individual tests"
										/>
									</Form.Group>

									{!isAllTestsConcessionVisible && (
										<div className="p-3 bg-light rounded mb-3">
											<ClinicianIndividualBillingConcession
												setSelectedTests={setSelectedTests}
											/>
										</div>
									)}

									<div>
										<Form.Group className="mb-3">
											<Form.Label className="fw-bold">Valid From (Optional)</Form.Label>
											<Form.Control
												id="valid_from"
												type="date"
												value={valid_from || ''}
												onChange={(e) => setValidFrom(e.target.value || null)}
												aria-label="Valid from date"
											/>
										</Form.Group>

										<Form.Group className="mb-3">
											<Form.Label className="fw-bold">Valid Until (Optional)</Form.Label>
											<Form.Control
												id="validUntil"
												type="date"
												value={validUntil || ''}
												onChange={(e) => setValidUntil(e.target.value || null)}
												aria-label="Valid until date"
											/>
										</Form.Group>
									</div>
									<div className="d-flex justify-content-end gap-2">
										<Button
											variant="secondary"
											onClick={() => {
												setConcessionValue("0");
												setSelectedTests([]);
												setStrategyName('');
												setDescription(null);
												setValidFrom(null);
												setValidUntil(null);
											}}
										>
											Reset
										</Button>
										<Button
											variant="primary"
											onClick={handleBillingStrategyFormSubmission}
											disabled={submitting || (!isAllTestsConcessionVisible && selectedTests.length === 0) || loading || !strategyName}
											aria-label="Save billing strategy"
										>
											{submitting || loading ? (
												<>
													<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
													<span className="ms-2">Saving...</span>
												</>
											) : (
												"Save Billing Strategy"
											)}
										</Button>
									</div>
								</Card.Body>
							</Card>
						</Col>

						{/* Right Column: Tables */}
						<Col md={8}>

							{Array.isArray(selectedTests) && selectedTests.length > 0 && (
								<div className="mb-4 br-5 bg-white border">
									<div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
										<h5 className="mb-0">Selected Tests ({selectedTests.length})</h5>
										<Button
											variant="outline-danger"
											size="sm"
											onClick={handleRemoveSelectedTests}
											disabled={selectedTestIds.length === 0}
											aria-label="Remove selected tests"
										>
											<RiDeleteBinLine size={16} className="me-1" />
											Remove Selected
										</Button>
									</div>
									<div className="p-0">
										<div className="table-responsive">
											<table className={`${styles.table} p-2`}>
												<thead>
													<tr>
														<th scope="col">
															<Form.Check
																type="checkbox"
																onChange={(e) =>
																	setSelectedTestIds(e.target.checked ? selectedTests.map(t => t.testid) : [])
																}
																checked={selectedTestIds.length === selectedTests.length && selectedTests.length > 0}
																aria-label="Select all tests"
															/>
														</th>
														<th scope="col">Test ID</th>
														<th scope="col">Test Name</th>
														<th scope="col">Mode</th>
														<th scope="col">Type</th>
														<th scope="col">Value</th>
														<th scope="col">Discounted Amount</th>
														<th scope="col">Action</th>
													</tr>
												</thead>
												<tbody>
													{selectedTests.map((test) => (
														<tr key={test.testid}>
															<td>
																<Form.Check
																	type="checkbox"
																	checked={selectedTestIds.includes(test.testid)}
																	onChange={() => handleTestSelectionToggle(test.testid)}
																	aria-label={`Select test ${test.testid}`}
																/>
															</td>
															<td>{test.testid}</td>
															<td>{test.name}</td>
															<td>{test.concessionMode}</td>
															<td className={test.pricingType === "discount" ? "text-success" : "text-danger"}>
																{test.pricingType}
															</td>
															<td>
																{test.concessionMode === "percentage"
																	? `${test.concessionValue}%`
																	: test.concessionValue}
															</td>
															<td className="fw-bold">
																{test.discountedValue}
															</td>
															<td>
																<Button
																	variant="outline-danger"
																	size="sm"
																	onClick={() => setSelectedTests(prev => prev.filter(t => t.testid !== test.testid))}
																	aria-label={`Remove test ${test.testid}`}
																>
																	<RiDeleteBinLine size={16} />
																</Button>
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								</div>
							)}

							<h5 className="bg-secondary-subtle p-2 rounded mb-3 pls-label">
								Applicable To</h5>
							{Array.isArray(applicableEntities) && applicableEntities.length > 0 && (
								<div className="mb-4 br-5 bg-white border">

									<table className={styles.table}>
										<thead>
											<tr>

												<th scope="col">Entity Name</th>
												<th scope="col">Entity Type</th>
												<th scope="col">Action</th>
											</tr>
										</thead>
										<tbody>
											{applicableEntities.map((entity, index) => (
												<tr key={index + 1}>
													<td>{entity?.name || entity?.insuranceName}</td>
													<td>{entity?.entity_type}</td>

													<td>
														<Button
															variant="outline-danger"
															size="sm"
															onClick={(ev) => { handleDeleteEntity(entity) }}

														>
															Delete <RiDeleteBinLine size={16} />
														</Button>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>)}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</div>
	);
}