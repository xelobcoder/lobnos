"use client"
import React, { useState, useEffect } from 'react';
import { customFetch, customPost, defaultApplicationSettings, getApplicationSettings } from '../../components/Auth/customFetch';
import { Table } from 'react-bootstrap';
import { useRouter } from 'next/router';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';

export default function Settings() {
	const [branches, setBranch] = useState([])
	const navigate = useRouter();
	const [defaultBranch, setDefaultBranch] = useState('');
	const [ApplicationSettings, setApplicationSettings] = useState(defaultApplicationSettings)

	// get list of all branches, set it in localstorage as default branch for the device
	const getData = async function (endpoint, storage) {
		const getResponse = await customFetch(endpoint);
		const { status, statusCode, result } = getResponse;
		if (statusCode == 200 && status == 'success') {
			storage(result)
		}
	}


	useEffect(() => {
		getData('branches', setBranch);
		setDefaultBranch(localStorage.getItem('deviceDefaultBranch'))
	}, [])


	const makeDefaultBranch = async function (e) {
		const branchid = e.target.value;
		const selected = branches.filter((e, i) => { return branchid == e.BRANCHID });
		if (selected.length > 0) {
			const isActive = selected[0]['ACTIVATION'] == 0 ? true : false;
			if (isActive) {
				alert('Activate branch in the branches page to continue');
			} else {
				localStorage.setItem('deviceDefaultBranch', selected[0]['NAME'].toUpperCase())
			}
		}
	}


	const get_our_data = async function () {
		const data = await getApplicationSettings();
		setApplicationSettings(data)
	}



	useEffect(() => {
		get_our_data();
	}, [])




	const handleAppSettingsActivation = async function (target, value) { setApplicationSettings({ ...ApplicationSettings, [target]: value }); }

	const updateSettings = async function (e) {
		let isError = 0;

		for (const [key, value] of Object.entries(ApplicationSettings)) {
			if (value === '') {
				isError++;
			}
		}

		if (isError == 0) {
			const pushSettings = await customPost('applicationsettings', 'POST', ApplicationSettings)
			const { statusCode, status, message } = pushSettings;
			if (statusCode == 200 && status == 'success') {
				alert(message);
				get_our_data()
				setDefaultBranch(localStorage.getItem('deviceDefaultBranch'))
			}
		}
	}

	return (
		<MainSettingsLayoutView>
			<div className="m-2">
				<h4 className="btn btn-danger text-white">Application settings</h4>
			</div>
			<div className="p-2">
				<Table className="bg-white" striped bordered hover id='custom-table'>
					<thead className="bg-dark">
						<tr>
							<th className="text-capitalize">#</th>
							<th className="text-capitalize">setting</th>
							<th className="text-capitalize">status</th>
							<th className="text-capitalize">action</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>1</td>
							<td className="text-capitalize">Detail registration</td>
							<td>
								{ApplicationSettings?.bulkregistration == 0
									? "deactivated"
									: "Activated"}
							</td>
							<td>
								<button className={
									ApplicationSettings?.bulkregistration == 0
										? "btn btn-success btn-sm"
										: "btn btn-danger btn-sm"
								}
									onClick={(e) => {
										handleAppSettingsActivation('bulkregistration', ApplicationSettings?.bulkregistration == 0
											? 1
											: 0)
									}}
								>
									{
										ApplicationSettings?.bulkregistration == 0
											? "activate"
											: "deactivate"
									}
								</button>
							</td>
						</tr>
						{/* deactivate after 24 hrs */}
						<tr>
							<td>5</td>
							<td className="text-capitalize">
								deactivate client after 24 hrs
							</td>
							<td>
								{ApplicationSettings?.DeactivateBilling24hrs == 0
									? "Deactivated"
									: "Activated"}
							</td>
							<td>
								<button
									className={
										ApplicationSettings?.DeactivateBilling24hrs == 0
											? "btn btn-success btn-sm"
											: " btn btn-danger btn-sm"
									}

									onClick={(e) => {
										handleAppSettingsActivation('DeactivateBilling24hrs', ApplicationSettings?.DeactivateBilling24hrs == 0
											? 1
											: 0)
									}}
								>
									{ApplicationSettings?.DeactivateBilling24hrs == 0
										? "Activate"
										: " Deactivate"}
								</button>
							</td>
						</tr>
						{/* clear all bills before new transaction */}
						<tr>
							<td>6</td>
							<td className="text-capitalize">
								clear all bills before new transaction
							</td>
							<td>
								{ApplicationSettings?.PaidBillsBeforeTransaction == 0
									? "Deactivated"
									: "Activated"}
							</td>
							<td>
								<button
									className={
										ApplicationSettings?.PaidBillsBeforeTransaction == 0
											? "btn btn-success btn-sm"
											: "btn btn-danger btn-sm"
									}
									onClick={(e) => {
										handleAppSettingsActivation('PaidBillsBeforeTransaction', ApplicationSettings?.PaidBillsBeforeTransaction == 0
											? 1
											: 0)
									}}
								>
									{ApplicationSettings?.PaidBillsBeforeTransaction == 0
										? "Activate"
										: " Deactivate"}
								</button>
							</td>
						</tr>
						<tr>
							<td>7</td>
							<td className="text-capitalize">complete laboratory flow</td>
							<td>
								{ApplicationSettings?.completeFlow == 0
									? "Deactivated"
									: "Activated"}
							</td>
							<td>
								<button
									className={
										ApplicationSettings?.completeFlow == 0
											? "btn btn-success btn-sm"
											: "btn btn-danger btn-sm"
									}
									onClick={(e) => {
										handleAppSettingsActivation('completeFlow', ApplicationSettings?.completeFlow == 0
											? 1
											: 0)
									}}
								>
									{ApplicationSettings?.completeFlow == 0
										? "Activate"
										: " Deactivate"}
								</button>
							</td>
						</tr>
						<tr>
							<td>8</td>
							<td className="text-capitalize">
								approval before result printing
							</td>
							<td>
								{ApplicationSettings?.approvalbeforeprinting == 0
									? "Deactivated"
									: "Activated"}
							</td>
							<td>
								<button
									className={
										ApplicationSettings?.approvalbeforeprinting == 0
											? "btn btn-success btn-sm"
											: "btn btn-danger btn-sm"
									}

									onClick={(e) => {
										handleAppSettingsActivation('approvalbeforeprinting', ApplicationSettings?.approvalbeforeprinting == 0
											? 1
											: 0)
									}}

								>
									{ApplicationSettings?.approvalbeforeprinting == 0
										? "Activate"
										: " Deactivate"}
								</button>
							</td>
						</tr>
						<tr>
							<td>9</td>
							<td>Default Branch</td>
							<td>{defaultBranch == null ? "Not Set" : defaultBranch}</td>
							<td>
								<select
									name="defaultBranch"
									className="form-control"
									onChange={(e) => {
										makeDefaultBranch(e);
									}}
								>
									<option>select default branch</option>
									{branches.length > 0 &&
										branches.map((i, e) => {
											return (
												<option key={e} dataid={i.branchid} value={i.branchid}>
													{i.name}
												</option>
											);
										})}
								</select>
							</td>
						</tr>
						<tr>
							<td>9</td>
							<td>Email Notifications</td>
							<td>
								{ApplicationSettings?.emailNotification == 0
									? "Deactivated"
									: "Activated"}
							</td>
							<td>
								<button
									className={
										ApplicationSettings?.emailNotification== 0
											? "btn btn-success btn-sm"
											: "btn btn-danger btn-sm"
									}

									onClick={(e) => {
										handleAppSettingsActivation('emailNotification', ApplicationSettings?.emailNotification== 0
											? 1
											: 0)
									}}

								>
									{ApplicationSettings?.emailNotification== 0
										? "Activate"
										: " Deactivate"}
								</button>
							</td>
						</tr>
						<tr>
							<td>10</td>
							<td>
								update application email settings
							</td>
							<td>-------</td>
							<td>
								<button onClick={(ev) => navigate.push('/settings/emailsetting')} className='btn btn-primary btn-sm'>update</button>
							</td>
						</tr>
					</tbody>
				</Table>
				<div>
					<button className="btn btn-primary mt-3" onClick={(e) => { updateSettings(e) }}>update settings</button>
				</div>
			</div>
		</MainSettingsLayoutView>
	);
}
