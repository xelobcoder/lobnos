"use client";
import React, { useState } from 'react';
import { Form } from 'react-bootstrap';
import ClinicianIndividualBillingConcession from '../../../components/Clinicians/ClinicianIndividualBillingConcession';


interface SelectedTest {
	testName: string;
	originalPrice: number;
	concessionAmount: number;
	discountedAmount: number;
	actualPrice: number;
}

export default function ClinicianBillingModeView() {
	const [selectionMode, setSelectionMode] = useState<'absolute' | 'percentage'>('absolute');
	const [concessionAmount, setConcessionAmount] = useState<string>('');
	const [selectedTests, setSelectedTests] = useState<SelectedTest[]>([]);
	const [isAllTestsConcessionVisible, setIsAllTestsConcessionVisible] = useState(false);
	const [isIndividualConcessionVisible, setIsIndividualConcessionVisible] = useState(false);

	return (
		<div className="container">
			<div className="col-3">
				<h6 className="p-2 bg-secondary-subtle br-5">Clinician Billing</h6>
			</div>

			<div>
				<div className="list-group pointer">
					<div className="d-flex list-group-item fw-bold bg-secondary-subtle align-items-center">
						<span className="d-flex align-items-center">
							<Form.Switch
								id="applyConcession"
								label="Apply a concession on all tests"
								onChange={(e) => setIsAllTestsConcessionVisible(e.target.checked)}
							/>
						</span>
					</div>

					{isAllTestsConcessionVisible && (
						<div className="d-flex list-group-item">
							<div>
								<p className="text-sm">
									This will apply a concession amount, either a percentage or an absolute amount, to all the tests available in the repository.
									For example, applying a 5 cedis concession will reduce the price of each test by 5. Similarly, applying a 5% concession
									will decrease the price of each test by 5% of its current value. This feature ensures uniform pricing adjustments across
									all available tests.
								</p>

								<div className="form-row mt-3">
									<label htmlFor="concessionMode">Concession Mode</label>
									<br />
									<select
										id="concessionMode"
										className="custom-select col-3"
										value={selectionMode}
										onChange={(e) => setSelectionMode(e.target.value as 'absolute' | 'percentage')}
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
								onChange={(e) => setIsIndividualConcessionVisible(e.target.checked)}
							/>
						</span>
					</div>

					{isIndividualConcessionVisible && (
						<ClinicianIndividualBillingConcession
							onSelect={(test) => { }}
							selectedTests={selectedTests}
							setSelectedTests={setSelectedTests}
						/>
					)}

					{selectedTests.length > 0 && (
						<div className="list-group-item">
							<h6 className="bg-light p-2">Selected Tests</h6>
							<table className="ttable table">
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
			</div>
		</div>
	);
}
