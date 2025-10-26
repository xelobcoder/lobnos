"use client"
import React, { useEffect, useState } from 'react';
import { Form, Button, Col, Row, Card, Container, Nav, Tab } from 'react-bootstrap';
import { defaultResultSettings, ResultSettings } from '../../../../components/ResultView/result-settings';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';
import { RiSettingsLine, RiFileTextLine, RiMessage2Line, RiPulseLine, RiSaveLine, RiBuildingLine, RiFileSettingsLine } from '@remixicon/react';
import { GeneralTab } from '../../../../components/settings/GeneralTab';
import { CompanyTab } from '../../../../components/settings/CompanyTab';
import { ReportOptionsTab } from '../../../../components/settings/ReportOptionsTab';
import { UltrasoundTab } from '../../../../components/settings/UltrasoundTab';




const defaultTestBodyColumnNames = {
	trFirstColumnName: 'Investigation',
	trSecondColumnName: 'value',
	trThirdColumnName: 'units',
	trFourthColumnName: 'reference',
	trFifthColumnName: 'flag',
};

const SettingsForm = () => {
	const [settings, setSettings] = useState<ResultSettings>(() => {
		const s = { ...defaultResultSettings };
		s.testBody = { ...s.testBody, ...defaultTestBodyColumnNames, ...defaultResultSettings.testBody };
		return s;
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


	const loadApplicationResultSettings = async () => {
		try {
			setLoading(true);
			const response = await customFetch(`applicationsetting/resultsettings`);
			if (response && Object.keys(response).length == 0) return;
			// Merge in default column names if missing
			const merged = {
				...response,
				testBody: { ...defaultTestBodyColumnNames, ...(response?.testBody || {}) },
			};
			setSettings(merged);
		} catch (error) {
			toast.error("Failed to load settings", { autoClose: 500, position: "top-center" });
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadApplicationResultSettings();
	}, []);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		if (name.startsWith('companyInfo.')) {
			const key = name.split('.')[1];
			setSettings((prev) => ({
				...prev,
				companyInfo: { ...prev.companyInfo, [key]: type === 'number' ? Number(value) : value },
			}));
		} else if (name.startsWith('testBody.')) {
			const key = name.split('.')[1];
			setSettings((prev) => ({
				...prev,
				testBody: { ...prev.testBody, [key]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value },
			}));
		} else if (name.startsWith('ultrasoundSettings.')) {
			const key = name.split('.')[1];
			setSettings((prev: ResultSettings): ResultSettings => ({
				...prev,
				ultrasoundSettings: {
					...prev.ultrasoundSettings,
					[key]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
				} as ResultSettings['ultrasoundSettings']
			}));
		} else if (name.startsWith('comments.')) {
			const key = name.split('.')[1];
			setSettings((prev) => ({
				...prev,
				comments: { ...prev.comments, [key]: value },
			}));
		} else if (type === 'checkbox') {
			setSettings((prev) => ({ ...prev, [name]: checked }));
		} else if (type === 'number') {
			setSettings((prev) => ({ ...prev, [name]: Number(value) }));
		} else {
			setSettings((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e) => {
		try {
			e.preventDefault();
			setIsSubmitting(true);
			const response: { status: 'success' | "error" | 'failed' | boolean, message: string } = await customPost(`applicationsetting/resultsettings`, "PUT", { data: settings });
			const { status, message } = response;
			if (status === 'success' || status === true) {
				toast.success(message || "Settings updated successfully", { autoClose: 500, position: "top-center" });
			} else {
				toast.error(message || "Failed to update settings", { autoClose: 500, position: "top-center" });
			}
		} catch (error) {
			toast.error("An error occurred while updating settings", { autoClose: 500, position: "top-center" });
		} finally {
			setIsSubmitting(false);
			loadApplicationResultSettings();
		}
	};

	if (loading) return <Loader />;

	return (
		<div className="border bg-white border-secondary-subtle mx-2 p-2">
			<div className="mx-2 d-flex justify-content-between align-items-center mb-3">
				<h5 className="text-capitalize pls-label bg-secondary-subtle p-3 pls-color br-5 mb-0">Report Settings</h5>
				<Button
					disabled={isSubmitting}
					variant="primary"
					onClick={handleSubmit}
					className="d-flex align-items-center"
				>
					<RiSaveLine size={16} className="me-1" />
					{isSubmitting ? "Saving..." : "Save Changes"}
				</Button>
			</div>

			<Tab.Container defaultActiveKey="general">
				<Nav variant="tabs" className="border-bottom-0 px-3">
					<Nav.Item>
						<Nav.Link eventKey="general" className="d-flex align-items-center">
							<RiSettingsLine size={16} className="me-2" />
							General
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="company" className="d-flex align-items-center">
							<RiBuildingLine size={16} className="me-2" />
							Company Info
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="options" className="d-flex align-items-center">
							<RiFileSettingsLine size={16} className="me-2" />
							Report Options
						</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="ultrasound" className="d-flex align-items-center">
							<RiPulseLine size={16} className="me-2" />
							Ultrasound
						</Nav.Link>
					</Nav.Item>
				</Nav>

				<Tab.Content className="p-3">
					<Tab.Pane eventKey="general">
						<GeneralTab settings={settings} handleChange={handleChange} />
					</Tab.Pane>

					<Tab.Pane eventKey="company">
						<CompanyTab settings={settings} handleChange={handleChange} />
					</Tab.Pane>

					<Tab.Pane eventKey="options">
						<ReportOptionsTab settings={settings} handleChange={handleChange} />
					</Tab.Pane>

					<Tab.Pane eventKey="ultrasound">
						<UltrasoundTab settings={settings} handleChange={handleChange} />
					</Tab.Pane>
				</Tab.Content>
			</Tab.Container>
		</div>
	);
};

export default SettingsForm;
