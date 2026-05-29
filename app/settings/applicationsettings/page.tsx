"use client";
import React, { useState, useEffect } from 'react';
import { Button, Alert, Form } from 'react-bootstrap';
import { RiSaveLine, RiSettings4Line } from '@remixicon/react';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import Loader from '../../../components/isLoading';
import { useApplicationSettings } from '../../../components/Auth/useApplicationContext';
import { BillingSettingsTab } from '../../../components/settings/applicationsettings/BillingSettingsTab';
import { availableFonts } from '../../../lib/themes';
import Link from 'next/link';

// Helper to get region/district objects from code
function getRegionAndDistrict(regions: any[], regioncode: string, districtcode: string): { region: any, district: any } {
	const region = regions.find((r: any) => r.regioncode === regioncode);
	let district: any = null;
	if (region && Array.isArray(region.districts)) {
		district = region.districts.find((d: any) => d.code === districtcode);
	}
	return { region, district };
}

interface ApplicationSettingsData {
	keyid: number;
	bulkregistration: number;
	fontsize: string;
	textcolor: string;
	BackgroundColor: string;
	DeactivateBilling24hrs: number;
	PaidBillsBeforeTransaction: number;
	completeFlow: number;
	approvalbeforeprinting: number;
	smsActivated: number;
	smsSettings: string;
	emailNotification: number;
	includeTax: number;
	patientIdPrefix: string;
	fontFamily: string;
	billingidPrefix: string;
	services: string;
	billingsettings: string;
	regioncode: string;
	districtcode: string;
	withnessRefund: number;
	AllowCrmToGiveDisocunt: number;
	patientIdGenerationMethod: string;
	allowResultEnteringUpaid: number,
	allowValidationUpaid: number,
	byPassCollection: number,
	byPassSampleValidation: number,
	byPassValidation: number,
	byPassProcessing: number,
	allowPrintingUnpaid: number,
	makepdfprintingcompulsory: number,
	isCommissionEarnedOnClinicianBilling: number,
	isCommissionEarnedOnOrganizationalBilling: number,
	isCommissionEarnedOnNHISBilling: number,
	isCommissionEarnedOnPHISBilling: number,
	ageVariationLimits: string | null
}

export default function ApplicationSettings() {
	const { applicationsettings } = useApplicationSettings();
	const { user } = applicationsettings;

	const [settings, setSettings] = useState<ApplicationSettingsData | null>(null);
	const [regions, setRegions] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [newGroupName, setNewGroupName] = useState('');
	const [newGroupMin, setNewGroupMin] = useState<string>('');
	const [newGroupMax, setNewGroupMax] = useState<string>('');

	useEffect(() => {
		fetchSettings();
		// Fetch regions/districts for lookup
		async function fetchRegions() {
			const res = await customFetch('locations/regions-districts');
			if (res?.status === 'success' && res?.statusCode === 200 && Array.isArray(res.data)) {
				setRegions(res.data);
			}
		}
		fetchRegions();
	}, []);

	// Ensure region and district select fields are updated after both settings and regions are loaded
	useEffect(() => {
		if (!settings || regions.length === 0) return;
		let changed = false;
		let newRegioncode = settings.regioncode;
		let newDistrictcode = settings.districtcode;

		// If regioncode is a number (id), map to regioncode string for dropdown
		if (typeof newRegioncode === 'number' || /^[0-9]+$/.test(newRegioncode)) {
			const regionObj = regions.find(r => r.id === Number(newRegioncode));
			if (regionObj) {
				newRegioncode = regionObj.regioncode;
				changed = true;
			}
		}
		// If districtcode is a number (id), map to district code string for dropdown
		const regionObj = regions.find(r => r.regioncode === newRegioncode);
		if (regionObj && (typeof newDistrictcode === 'number' || /^[0-9]+$/.test(newDistrictcode))) {
			const districtObj = regionObj.districts.find((d: any) => d.id === Number(newDistrictcode));
			if (districtObj) {
				newDistrictcode = districtObj.code;
				changed = true;
			}
		}

		// If regioncode is not valid, set to first region
		const validRegion = regions.find(r => r.regioncode === newRegioncode);
		if (!validRegion) {
			if (regions.length > 0) {
				newRegioncode = regions[0].regioncode;
				changed = true;
			} else {
				newRegioncode = '';
			}
		}
		// If districtcode is not valid for region, set to first district
		const validRegionObj = regions.find(r => r.regioncode === newRegioncode);
		if (validRegionObj) {
			const validDistrict = validRegionObj.districts.find((d: any) => d.code === newDistrictcode);
			if (!validDistrict) {
				if (validRegionObj.districts.length > 0) {
					newDistrictcode = validRegionObj.districts[0].code;
					changed = true;
				} else {
					newDistrictcode = '';
				}
			}
		} else {
			newDistrictcode = '';
		}
		if (changed) {
			setSettings(s => s ? { ...s, regioncode: newRegioncode, districtcode: newDistrictcode } : s);
		}
	}, [settings, regions]);

	const fetchSettings = async () => {
		try {
			setLoading(true);
			const response = await customFetch('applicationsettings');
			if (response?.status === 'success' && response?.statusCode === 200) {
				if (response.result) {
					const ageVariationLimits = response.result.ageVariationLimits
						? (typeof response.result.ageVariationLimits === 'string'
							? response.result.ageVariationLimits
							: JSON.stringify(response.result.ageVariationLimits))
						: null;
					setSettings({
						...response.result,
						regioncode: response.result.regioncode ? response.result.regioncode.toString() : '',
						districtcode: response.result.districtcode ? response.result.districtcode.toString() : '',
						ageVariationLimits,
					});
				} else {
					setSettings({
						keyid: 1,
						bulkregistration: 1,
						fontsize: '14',
						textcolor: 'black',
						BackgroundColor: 'wheat',
						DeactivateBilling24hrs: 0,
						PaidBillsBeforeTransaction: 0,
						completeFlow: 1,
						approvalbeforeprinting: 1,
						smsActivated: 0,
						smsSettings: '{"result":"No","registration":"Yes","sample":"No","birthday":"No"}',
						emailNotification: 0,
						includeTax: 0,
						patientIdPrefix: '',
						fontFamily: '',
						billingidPrefix: '',
						services: '',
						billingsettings: '{"hasNightAdjustment":true,"nightAdjustmentValue":"100","nightAdjustmentMode":"percentage","startTime":"01:00","endTime":"23:00"}',
						regioncode: '1',
						districtcode: '2',
						withnessRefund: 0,
						AllowCrmToGiveDisocunt: 0,
						patientIdGenerationMethod: 'region',
						allowValidationUpaid: 0,
						allowPrintingUnpaid: 0,
						byPassCollection: 0,
						byPassSampleValidation: 0,
						byPassValidation: 0,
						byPassProcessing: 0,
						allowResultEnteringUpaid: 0,
						ageVariationLimits: JSON.stringify({
							neonates: { minAge: 0, maxAge: 28, specifier: 'days' },
							children: { minAge: 1, maxAge: 12, specifier: 'years' },
							adolescents: { minAge: 13, maxAge: 17, specifier: 'years' },
							adults: { minAge: 18, maxAge: 64, specifier: 'years' }
						}),
						isCommissionEarnedOnClinicianBilling: 1,
						isCommissionEarnedOnOrganizationalBilling: 1,
						isCommissionEarnedOnNHISBilling: 0,
						isCommissionEarnedOnPHISBilling: 0,
						makepdfprintingcompulsory: 0
					});
				}
			} else {
				setError('Failed to fetch application settings');
			}
		} catch (err) {
			console.log(err)
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
		const checked = (e.target as HTMLInputElement).checked;

		setSettings((prevSettings) => {
			if (!prevSettings) return prevSettings;

			const key = name as keyof ApplicationSettingsData;
			let updatedValue: any;
			if (type === 'checkbox') {
				updatedValue = checked ? 1 : 0;
			} else if (type === 'number') {
				updatedValue = parseInt(value) || 0;
			} else {
				updatedValue = value;
			}

			// If region changes, reset district
			if (key === 'regioncode' && value !== prevSettings.regioncode) {
				return {
					...prevSettings,
					regioncode: updatedValue,
					districtcode: ''
				};
			}

			return {
				...prevSettings,
				[key]: updatedValue
			};
		});
	};

	// Helpers to manage ageVariationLimits JSON stored as string|null
	const parseAgeVariation = () => {
		try {
			if (!settings?.ageVariationLimits) return null;
			return typeof settings.ageVariationLimits === 'string'
				? JSON.parse(settings.ageVariationLimits)
				: settings.ageVariationLimits;
		} catch (err) {
			return null;
		}
	};

	const updateAgeMin = (group: string, minAgeValue: number) => {
		setSettings(prev => {
			if (!prev) return prev;
			const obj = parseAgeVariation() || {
				neonates: { minAge: 0, maxAge: 28, specifier: 'days' },
				children: { minAge: 1, maxAge: 12, specifier: 'years' },
				adolescents: { minAge: 13, maxAge: 17, specifier: 'years' },
				adults: { minAge: 18, maxAge: 64, specifier: 'years' }
			};
			if (!obj[group]) obj[group] = { minAge: minAgeValue, maxAge: 0, specifier: 'years' };
			obj[group].minAge = Number(minAgeValue) || 0;
			return { ...prev, ageVariationLimits: JSON.stringify(obj) };
		});
	};

	const updateAgeMax = (group: string, maxAgeValue: number) => {
		setSettings(prev => {
			if (!prev) return prev;
			const obj = parseAgeVariation() || {
				neonates: { minAge: 0, maxAge: 28, specifier: 'days' },
				children: { minAge: 1, maxAge: 12, specifier: 'years' },
				adolescents: { minAge: 13, maxAge: 17, specifier: 'years' },
				adults: { minAge: 18, maxAge: 64, specifier: 'years' }
			};
			if (!obj[group]) obj[group] = { minAge: 0, maxAge: maxAgeValue, specifier: 'years' };
			obj[group].maxAge = Number(maxAgeValue) || 0;
			return { ...prev, ageVariationLimits: JSON.stringify(obj) };
		});
	};

	const removeAgeGroup = (group: string) => {
		if (!confirm(`Remove '${group}' age group? This cannot be undone.`)) return;
		setSettings(prev => {
			if (!prev) return prev;
			const obj = parseAgeVariation() || {};
			if (obj[group]) delete obj[group];
			const keys = Object.keys(obj);
			return { ...prev, ageVariationLimits: keys.length ? JSON.stringify(obj) : null };
		});
	};

	const addAgeGroup = () => {
		const name = newGroupName.trim();
		if (!name) {
			setError('Age group name is required');
			return;
		}
		const min = Number(newGroupMin);
		const max = Number(newGroupMax);
		if (Number.isNaN(min) || Number.isNaN(max)) {
			setError('Min and max age must be valid numbers');
			return;
		}
		if (min > max) {
			setError('Min age cannot be greater than max age');
			return;
		}
		setSettings(prev => {
			if (!prev) return prev;
			const obj = parseAgeVariation() || {};
			if (obj[name]) {
				setError(`Age group '${name}' already exists`);
				return prev;
			}
			obj[name] = { minAge: min, maxAge: max, specifier: 'years' };
			return {
				...prev,
				ageVariationLimits: JSON.stringify(obj)
			};
		});
		setNewGroupName('');
		setNewGroupMin('');
		setNewGroupMax('');
		setError(null);
	};

	// specifier is fixed to 'years' for editable groups (children/adolescents/adults)

	// Validation: ensure min<=max and no overlaps across groups (convert to days)
	const toDays = (value: number, specifier: string) => {
		if (specifier === 'days') return Number(value) || 0;
		if (specifier === 'months') return (Number(value) || 0) * 30;
		// years
		return (Number(value) || 0) * 365;
	};

	const validateAgeVariation = (): { valid: boolean; message?: string } => {
		const obj = parseAgeVariation() as Record<string, any> | null;
		if (!obj) return { valid: true };
		const entries = Object.entries(obj).map(([name, entry]: [string, any]) => {
			const min = Number(entry.minAge ?? 0);
			const max = Number(entry.maxAge ?? 0);
			const spec = entry.specifier || 'years';
			return {
				name,
				min,
				max,
				spec,
				minDays: toDays(min, spec),
				maxDays: toDays(max, spec)
			};
		});
		const lowercased = entries.map(e => e.name.toLowerCase());
		for (let i = 0; i < lowercased.length; i += 1) {
			if (lowercased.indexOf(lowercased[i]) !== i) {
				return { valid: false, message: `Duplicate age group name '${entries[i].name}'` };
			}
		}
		for (const entry of entries) {
			if (entry.min > entry.max) {
				return { valid: false, message: `${entry.name}: minAge cannot be greater than maxAge` };
			}
		}
		entries.sort((a, b) => a.minDays - b.minDays);
		for (let i = 1; i < entries.length; i += 1) {
			if (entries[i].minDays <= entries[i - 1].maxDays) {
				return { valid: false, message: `Age group ${entries[i].name} overlaps with previous group ${entries[i - 1].name}` };
			}
		}
		return { valid: true };
	};


	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!settings) return;

		const { region, district }: { region: any, district: any } = getRegionAndDistrict(
			regions,
			settings.regioncode?.toString() ?? '',
			settings.districtcode?.toString() ?? ''
		);

		const payload = {
			...settings,
			regioncode: region ? region.id : null,
			districtcode: district ? district.id : null,
		};

		try {
			setSaving(true);
			setError(null);

			// Validate age variation limits before submit
			const validation = validateAgeVariation();
			if (!validation.valid) {
				setError(validation.message || 'Invalid age variation limits');
				setSaving(false);
				return;
			}
			const response = await customPost('applicationsettings', 'POST', payload);
			if (response?.status === 'success' && response?.statusCode === 200) {
				setSuccess(true);
				setTimeout(() => setSuccess(false), 3000);
			} else {
				setError('Failed to update application settings');
			}
		} catch (err) {
			setError('Error updating application settings');
		} finally {
			setSaving(false);
		}
	};

	if (loading) return <Loader />;
	if (!settings) return <div>No settings available. Error: {error}</div>;

	return (
		<div className="container-fluid p-4">
			<div className="d-flex justify-content-between align-items-center mb-4">
				<div>
					<h2 className="mb-1">
						<RiSettings4Line className="me-2" size={28} />
						Application Settings
					</h2>
					<p className="text-muted mb-0">Configure system-wide settings and preferences</p>
				</div>
				<div className="d-flex gap-2">
					<Link href="/settings/applicationsettings/discount-limits" className="btn btn-outline-secondary">
						Discount Limits
					</Link>
					<Button
						type="submit"
						disabled={saving}
						variant="primary"
						className="d-flex align-items-center"
						onClick={handleSubmit}
					>
						<RiSaveLine size={18} className="me-2" />
						{saving ? "Saving Changes..." : "Save Changes"}
					</Button>
				</div>
			</div>

			{error && <Alert variant="danger" className="mb-4">{error}</Alert>}
			{success && <Alert variant="success" className="mb-4">Settings updated successfully!</Alert>}

			<Form onSubmit={handleSubmit}>
				<div className="row mb-4">
					<div className="col-md-4">
						<Form.Group controlId="fontFamily">
							<Form.Label>Font Family</Form.Label>
							<Form.Select
								name="fontFamily"
								value={settings.fontFamily || ''}
								onChange={handleChange}
							>
								<option value="">Select font</option>
								{Array.isArray(availableFonts) && availableFonts.map(font => (
									<option key={font.value} value={font.value}>{font.name}</option>
								))}
							</Form.Select>
						</Form.Group>
					</div>
					<div className="col-md-2">
						<Form.Group controlId="fontsize">
							<Form.Label>Font Size</Form.Label>
							<Form.Control
								type="number"
								name="fontsize"
								min={10}
								max={32}
								value={settings.fontsize || ''}
								onChange={handleChange}
								placeholder="Font size (px)"
							/>
						</Form.Group>
					</div>
				</div>
				<BillingSettingsTab settings={settings} handleChange={handleChange} />
				<div className="card-body border mt-3 bg-white br-5 p-3 ">
					<div className='fw-bold'>Age Variation Limits</div>
					<div className="">
						<p className="text-muted small">Edit minimum ages for age groups. Values are saved as JSON.</p>
						<table className="table table-sm">
							<thead>
								<tr>
									<th>Group</th>
									<th>Min Age</th>
									<th>Max Age</th>
									<th>Specifier</th>
								</tr>
							</thead>
							<tbody>
								{(() => {
									const obj = parseAgeVariation() || {
										neonates: { minAge: 0, maxAge: 28, specifier: 'days' },
										children: { minAge: 1, maxAge: 12, specifier: 'years' },
										adolescents: { minAge: 13, maxAge: 17, specifier: 'years' },
										adults: { minAge: 18, maxAge: 64, specifier: 'years' }
									};
									const order = ['children', 'adolescents', 'adults'];
									const visible = [
										...order.filter(g => obj[g] !== undefined),
										...Object.keys(obj).filter(g => !order.includes(g) && g !== 'neonates')
									];
									return visible.map(group => (
										<tr key={group}>
											<td className="align-middle text-capitalize">
												{group}
												{group === 'adolescents' && (
													<button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => { removeAgeGroup(group); setError(null); }}>
														Remove
													</button>
												)}
											</td>
											<td>
												<input
													type="number"
													min={0}
													className="form-control form-control-sm"
													value={obj[group]?.minAge ?? ''}
													onChange={(e) => { updateAgeMin(group, Number(e.target.value)); setError(null); }}
												/>
											</td>
											<td>
												<input
													type="number"
													min={0}
													className="form-control form-control-sm"
													value={obj[group]?.maxAge ?? ''}
													onChange={(e) => { updateAgeMax(group, Number(e.target.value)); setError(null); }}
												/>
											</td>
											<td className="align-middle">years</td>
										</tr>
									));
								})()}
							</tbody>
						</table>
						<div className="mt-3">
							<div className="row g-2 align-items-end">
								<div className="col-md-3">
									<label className="form-label">New group name</label>
									<input
										type="text"
										className="form-control"
										value={newGroupName}
										onChange={(e) => setNewGroupName(e.target.value)}
									/>
								</div>
								<div className="col-md-2">
									<label className="form-label">Min age</label>
									<input
										type="number"
										min={0}
										className="form-control"
										value={newGroupMin}
										onChange={(e) => setNewGroupMin(e.target.value)}
									/>
								</div>
								<div className="col-md-2">
									<label className="form-label">Max age</label>
									<input
										type="number"
										min={0}
										className="form-control"
										value={newGroupMax}
										onChange={(e) => setNewGroupMax(e.target.value)}
									/>
								</div>
								<div className="col-md-2">
									<label className="form-label">Specifier</label>
									<div className="form-control bg-light">years</div>
								</div>
								<div className="col-md-3 d-grid">
									<button type="button" className="btn btn-primary" onClick={addAgeGroup}>
										Add age group
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Form>
		</div>
	);
}
