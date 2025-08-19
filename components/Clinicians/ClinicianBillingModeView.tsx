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

					{strategyName && <h4 className="mb-3">{strategyName}</h4>}
				</Card.Header>
				<Card.Body>
					<Row>
						{/* Left Column: Form */}
						<Col md={4} className="mb-4">
							<Card className="border-1 border-light br-5">
								<Card.Body>
									<div className=" small">Name: {strategyName}</div>
									<div className=" small">Description: {description || 'N/A'}</div>
									<div className=" small"> Applied to all tests: {isAllTestsConcessionVisible ? 'Yes' : 'No'}</div>

									<p className=" small mb-3 p-3 border border-1 br-5 my-3 ">
										This will apply a {price_type} amount, either a percentage or an absolute amount,
										to all tests for the category. A {price_type} will {price_type === "discount" ? "reduce" : "increase"}
										the price of each test by the specified value.
									</p>
									<div className=" small">Pricing Type: {price_type}</div>
									<div className=" small">Concession Mode: {selectionMode}</div>
									{isAllTestsConcessionVisible && (
										<div className="p-3 bg-light rounded mb-3">
											<div>
												{selectionMode === "percentage" ? "Percentage Value" : "Amount"}: {concessionValue}
											</div>


										</div>
									)}

									<div className=" small">Validity Period:  {valid_from && validUntil ? `${valid_from} to ${validUntil}` : 'N/A'}</div>
									<hr />
									<div className=" small">
										Valid From: {valid_from || 'N/A'}
									</div>
									<hr />
									<div className=" small">
										Valid Until: {validUntil || 'N/A'}
									</div>

								</Card.Body>
							</Card>
						</Col>

						{/* Right Column: Tables */}
						<Col md={8}>

							{Array.isArray(selectedTests) && selectedTests.length > 0 && (
								<div className="mb-4 br-5 bg-white border">
									<div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
										<h5 className="mb-0"><span className="me-2"><RiDeleteBinLine size={20} /></span>Selected Tests ({selectedTests.length})</h5>
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
														<th scope="col"><span className="me-1"></span>Test ID</th>
														<th scope="col"><span className="me-1"></span>Test Name</th>
														<th scope="col"><span className="me-1"></span>Mode</th>
														<th scope="col"><span className="me-1"></span>Type</th>
														<th scope="col"><span className="me-1"></span>Value</th>
														<th scope="col"><span className="me-1"></span>Discounted Amount</th>
														<th scope="col"><span className="me-1"></span>Action</th>
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
								<span className="me-2"><RiDeleteBinLine size={20} /></span>Applicable To</h5>
							{Array.isArray(applicableEntities) && applicableEntities.length > 0 ? (
								<div className="mb-4 br-5 bg-white border">
									<table className={styles.table}>
										<thead>
											<tr>
												<th scope="col"><span className="me-1"><RiDeleteBinLine size={16} /></span>Entity Name</th>
												<th scope="col"><span className="me-1"><RiDeleteBinLine size={16} /></span>Entity Type</th>
												<th scope="col"><span className="me-1"><RiDeleteBinLine size={16} /></span>Action</th>
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
								</div>)
								:
								(
									<div className="text-muted p-3 border rounded bg-light d-flex align-items-center gap-2">
										<RiDeleteBinLine size={20} className="me-2" />
										No applicable entities for this strategy.
									</div>
								)}
						</Col>
					</Row>
				</Card.Body>
			</Card>
		</div>
	);
}