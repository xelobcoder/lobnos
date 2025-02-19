"use client";
import React, { useEffect, useState } from "react";
import { Form, Spinner } from "react-bootstrap";
import ClinicianIndividualBillingConcession from "./ClinicianIndividualBillingConcession";
import OrganizationFiltering from "../accessories/SectorFileringComponents/OrganizationFiltering";
import { Delete } from "@mui/icons-material";
import { customPost } from "../Auth/customFetch";
import { PreviousClinicianBillingRecord } from "./dev.type";
import { ToastContainer, toast } from "react-toastify";
interface SelectedTest {
	testName: string;
	originalPrice: number;
	testid: number;
	concessionValue: number;
	discountedValue: number;
	actualPrice: number;
	concessionMode: "absolute" | "percentage";

	isoutsourced: boolean
}

interface Organization {
	id: number;
	name: string;
	location: string;
	street: string;
	mobile: number;
	address: string;
	email: string;
	region: string;
	gpsmapping: string | null;
	website: string;
	type: string;
}

export default function ClinicianBillingModeView({ clinicianid, previousRecords, strategy }: { clinicianid: number, previousRecords: PreviousClinicianBillingRecord | null, strategy: string }) {
	const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage">("absolute");
	const [lastupdated, setLastupdated] = useState<string | null>(null);
	const [concessionValue, setconcessionValue] = useState<string>("0");
	const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
	const [isAllTestsConcessionVisible, setIsAllTestsConcessionVisible] = useState(true);
	const [applyToAllOrganizations, setApplyToAllOrganizations] = useState(true);
	const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
	const [selectedTestIds, setSelectedTestIds] = useState<number[]>([]);
	const [submitting, setSubmitting] = useState<boolean>(false);

	const handleOrganizationSelection = (organization) => {
		setSelectedOrganizations((prevSelected) => {
			if (prevSelected.some((org) => org.id === organization.id)) {
				return prevSelected;
			}
			return [...prevSelected, organization];
		});
	};

	const handleBillingStrategyFormSubmission = async () => {
		try {
			setSubmitting(true);

			const billingData = {
				concessionMode: selectionMode || "absolute",
				concessionValue: parseFloat(concessionValue),
				applicableTest: selectedTests,
				allconcessionApplied: isAllTestsConcessionVisible,
				applicableOrganization: selectedOrganizations,
				associatedid: clinicianid,
				isInsurance: strategy === "phis" ? 1 : 0,
				isClinician: strategy === "clinicians" ? 1 : 0,
				category: strategy
			};


			if (billingData.category && billingData.associatedid) {
				const response = await customPost(`billing-strategies/billing/strategies`, 'POST', billingData);

				const { status, message, strategyId } = response;
				if (status == true || strategyId == -1 || strategyId > 0) {
					toast.success(message);
				} else {
					toast.error(message);
				}
				setSubmitting(false);
			} else {
				toast.warn(`valid useful information required`);
			}
		} catch (err) {
			setSubmitting(false);
			console.log(err);
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

	useEffect(() => {
		if (previousRecords) {
			const { concessionValue, concessionMode, allconcessionApplied, applicableOrganization, applicableTest, updatedon } = previousRecords;

			setIsAllTestsConcessionVisible(allconcessionApplied === 0 ? false : true);
			setconcessionValue(concessionValue || "0");
			setSelectionMode(concessionMode);

			if (Array.isArray(applicableOrganization) && applicableOrganization.length > 0) {
				setSelectedOrganizations(applicableOrganization);
				setApplyToAllOrganizations(false);
			} else {
				setApplyToAllOrganizations(true);
			}

			if (Array.isArray(applicableTest) && applicableTest.length > 0) {
				setSelectedTests(applicableTest as any);
			}

			setLastupdated(updatedon)
		}
	}, [previousRecords]);

	return (
		<div className="container">
			<ToastContainer position="top-center" className="text-sm" theme="colored" />
			<div className=" d-flex justify-content-between">
				<h6 className="p-2 bg-secondary-subtle br-5 pls-label">
					{strategy === "clinicians" ? "Clinicians Special Billing " : "Private Health Insurance Organization"}
				</h6>
				{
					lastupdated && <div className=" text-decoration-underline p-0 br-5 d-flex justify-content-center align-center text-capitalize">
						last updated on: {new Date(lastupdated).toLocaleDateString()}
						{new Date(lastupdated).toLocaleTimeString()}
					</div>
				}
			</div>
			<hr />
			<div>
				<div className="list-group pointer">
					<div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
						<span className="d-flex align-items-center">
							<Form.Switch
								id="applyConcession"
								label="Apply a concession on all tests"
								onChange={(e) => {
									setIsAllTestsConcessionVisible(true);
								}}
							/>
						</span>
					</div>

					{isAllTestsConcessionVisible && (
						<div className="d-flex list-group-item">
							<div>
								<p className="text-sm">
									This will apply a concession amount, either a percentage or an absolute amount, to all the tests available in the repository. For example, applying a 5 cedis concession will reduce the price of each test by 5. Similarly, applying a 5% concession will decrease the price of each test by 5% of its current value. This feature ensures uniform pricing adjustments across all available tests.
								</p>

								<div className="form-row mt-3">
									<label htmlFor="concessionMode">Concession Mode</label>
									<br />
									<select
										id="concessionMode"
										className="custom-select col-3"
										value={selectionMode}
										onChange={(e) => setSelectionMode(e.target.value as "absolute" | "percentage")}
									>
										<option value="absolute">Absolute</option>
										<option value="percentage">Percentage</option>
									</select>
								</div>

								<div className="form-row mt-3">
									<label htmlFor="concessionValue">Concession Amount</label>
									<br />
									<input
										id="concessionValue"
										type="number"
										className="custom-input col-3"
										value={concessionValue}
										onChange={(e) => {
											setconcessionValue(e.target.value)
										}}
										placeholder="Enter amount"
										maxLength={6}
										minLength={1}
									/>
								</div>
							</div>
						</div>
					)}

					<div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
						<span className="d-flex align-items-center">
							<Form.Switch
								id="applyIndividualConcession"
								label="Apply concessions to individual tests"
								onChange={(e) => {
									setIsAllTestsConcessionVisible(false);
								}}
							/>
						</span>
					</div>

					{!isAllTestsConcessionVisible && (
						<ClinicianIndividualBillingConcession
							setSelectedTests={setSelectedTests}
						/>
					)}

					<div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
						<span className="d-flex align-items-center">
							<Form.Switch
								id="applyToAllOrganizations"
								label="Apply to all organizations"
								checked={applyToAllOrganizations}
								onChange={(e) => setApplyToAllOrganizations(e.target.checked)}
							/>
						</span>
					</div>

					{!applyToAllOrganizations && (
						<div className="list-group-item">
							<OrganizationFiltering showbulk={false} onSelect={handleOrganizationSelection} />
						</div>
					)}

					{selectedOrganizations.length > 0 && (
						<div className="list-group-item">
							<h6 className="bg-light p-2">Selected Organizations</h6>
							<table className="table table-bordered ttable">
								<thead>
									<tr>
										<th>Name</th>
										<th>Location</th>
										<th>Type</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{Array.isArray(selectedOrganizations) &&
										selectedOrganizations.length > 0 &&
										selectedOrganizations.map((organization) => (
											<tr key={organization.id}>
												<td>{organization.name}</td>
												<td>{organization.location}</td>
												<td>{organization.type}</td>
												<td>
													<button
														className="btn btn-danger btn-sm"
														onClick={() =>
															setSelectedOrganizations((prevSelected) =>
																prevSelected.filter((org) => org.id !== organization.id)
															)
														}
													>
														<Delete fontSize="small" />
													</button>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					)}

					{selectedTests.length > 0 && (
						<div className="list-group-item my-1">
							<div className="d-flex justify-content-between">
								<span className="bg-light ">
									Selected Tests
								</span>
								<button className="btn btn-danger btn-sm mx-5" onClick={handleRemoveSelectedTests}>
									<Delete fontSize="small" />
								</button>
							</div>
							<table className="table ttable mt-1">
								<thead>
									<tr>
										<th>
											<input
												type="checkbox"
												onChange={(e) => {
													setSelectedTestIds(
														e.target.checked
															? selectedTests.map((test) => test.testid)
															: []
													);
												}}
												checked={selectedTestIds.length === selectedTests.length}
											/>
										</th>
										<th>Test Name</th>
										<th>Original Price</th>
										<th>Concession Mode</th>
										{/* <th>Concession Value</th> */}
										<th>Discounted Amount</th>
										<th>Actual Price</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{selectedTests.map((test) => (
										<tr key={test.testid}>
											<td>
												<input
													type="checkbox"
													checked={selectedTestIds.includes(test.testid)}
													onChange={() => handleTestSelectionToggle(test.testid)}
												/>
											</td>
											<td>{test.testName}</td>
											<td>{test.originalPrice.toFixed(2)}</td>
											<td>{test.concessionMode}</td>
											{/* <td>{test.concessionValue}</td> */}
											<td>{test.discountedValue}</td>
											<td>{test.actualPrice.toFixed(2)}</td>
											<td>
												<button
													className="btn btn-danger btn-sm"
													onClick={() => {
														setSelectedTests(
															selectedTests.filter((t) => t.testid !== test.testid)
														);
													}}
												>
													<Delete fontSize="small" />
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>

				<div className="form-row mt-3">
					<button
						className="btn btn-primary btn-sm"
						onClick={handleBillingStrategyFormSubmission}
					>
						{submitting && <Spinner size="sm" />}	{submitting ? 'submitting' : 'Save Billing Information'}
					</button>
				</div>
			</div>
		</div>
	);
}
