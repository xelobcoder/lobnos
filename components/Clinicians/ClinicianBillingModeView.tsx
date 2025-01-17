"use client";
import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import ClinicianIndividualBillingConcession from "./ClinicianIndividualBillingConcession";
import OrganizationFiltering from "../accessories/SectorFileringComponents/OrganizationFiltering";
import { Delete } from "@mui/icons-material";
import { customPost } from "../Auth/customFetch";
import { PreviousClinicianBillingRecord } from "./dev.type";

interface SelectedTest {
	testName: string;
	originalPrice: number;
	testid: number;
	concessionAmount: number;
	discountedAmount: number;
	actualPrice: number;
	concessionMode: "absolute" | "percentage";
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

export default function ClinicianBillingModeView({ clinicianid, previousRecords }: { clinicianid: number, previousRecords: PreviousClinicianBillingRecord | null }) {
	const [selectionMode, setSelectionMode] = useState<"absolute" | "percentage">("absolute");
	const [concessionAmount, setConcessionAmount] = useState<string>("0");
	const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
	const [isAllTestsConcessionVisible, setIsAllTestsConcessionVisible] = useState(true);
	const [applyToAllOrganizations, setApplyToAllOrganizations] = useState(true);
	const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);

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
			const billingData = {
				concessionMode: selectionMode,
				concessionAmount: parseFloat(concessionAmount),
				applicableTest: selectedTests,
				allconcessionApplied: isAllTestsConcessionVisible,
				applicableOrganization: selectedOrganizations,
				clinicianid
			};

			const response = await customPost(`clinicians/billing/strategies`, 'POST', billingData);

			console.log(response);
		} catch (err) {
			console.log(err);
		}
	};

	useEffect(() => {
		if (previousRecords) {
			const { concessionAmount, concessionMode, allconcessionApplied, applicableOrganization, applicableTest } = previousRecords;

			setIsAllTestsConcessionVisible(allconcessionApplied === 0 ? false : true);
			setConcessionAmount(concessionAmount || "0");
			setSelectionMode(concessionMode);

			if (Array.isArray(applicableOrganization) && applicableOrganization.length > 0) {
				setSelectedOrganizations(applicableOrganization);
				setApplyToAllOrganizations(false);
			} else {
				setApplyToAllOrganizations(true);
			}

			if (Array.isArray(applicableTest) && applicableTest.length > 0) {
				setSelectedTests(applicableTest);
			}
		}
	}, [previousRecords]);

	return (
		<div className="container">
			<div className="col-3">
				<h6 className="p-2 bg-secondary-subtle br-5">Clinician Billing</h6>
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
									<label htmlFor="concessionAmount">Concession Amount</label>
									<br />
									<input
										id="concessionAmount"
										type="number"
										className="custom-input col-3"
										value={concessionAmount}
										onChange={(e) => setConcessionAmount(e.target.value)}
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
							<OrganizationFiltering onSelect={handleOrganizationSelection} />
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
						<div className="list-group-item">
							<h6 className="bg-light p-2">Selected Tests</h6>
							<table className="table ttable">
								<thead>
									<tr>
										<th>Test Name</th>
										<th>Original Price</th>
										<th>Concession Amount</th>
										<th>Discounted Amount</th>
										<th>Actual Price</th>
									</tr>
								</thead>
								<tbody>
									{selectedTests.map((test, index) => (
										<tr key={index}>
											<td>{test.testName}</td>
											<td>{test.originalPrice.toFixed(2)}</td>
											<td>{test.concessionAmount.toFixed(2)}</td>
											<td>{test.discountedAmount.toFixed(2)}</td>
											<td>{test.actualPrice.toFixed(2)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
				<button className="btn btn-primary btn-sm mt-2" type="button" onClick={handleBillingStrategyFormSubmission}>
					Submit Billing Information
				</button>
			</div>
		</div>
	);
}
