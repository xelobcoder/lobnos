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
	allowPrintingUnpaid: number
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
					setSettings({
						...response.result,
						regioncode: response.result.regioncode ? response.result.regioncode.toString() : '',
						districtcode: response.result.districtcode ? response.result.districtcode.toString() : '',
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
						allowResultEnteringUpaid: 0
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
								{availableFonts.map(font => (
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
			</Form>
		</div>
	);
}
