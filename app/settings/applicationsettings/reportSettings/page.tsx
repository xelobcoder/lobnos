"use client"
import ui from "../../../../components/settings/SettingsWorkspace.module.css";
import React, { useEffect, useState, useRef } from 'react';
import { Button, Nav, Tab } from 'react-bootstrap';
import { defaultResultSettings, ResultSettings } from '../../../../components/ResultView/result-settings';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';
import { RiSettingsLine, RiPulseLine, RiSaveLine, RiBuildingLine, RiFileSettingsLine, RiChatQuoteLine } from '@remixicon/react';
import { GeneralTab } from '../../../../components/settings/GeneralTab';
import { CompanyTab } from '../../../../components/settings/CompanyTab';
import { ReportOptionsTab } from '../../../../components/settings/ReportOptionsTab';
import { UltrasoundTab } from '../../../../components/settings/UltrasoundTab';
import { CommentsTab } from '../../../../components/settings/CommentsTab';




const defaultTestBodyColumnNames = {
	trFirstColumnName: 'Investigation',
	trSecondColumnName: 'Observed Value',
	trThirdColumnName: 'Units',
	trFourthColumnName: 'Range',
	trFifthColumnName: 'Flag',
};

const SettingsForm = () => {
	const [settings, setSettings] = useState<ResultSettings>(() => {
		const s = { ...defaultResultSettings };
		s.testBody = { ...s.testBody, ...defaultTestBodyColumnNames, ...defaultResultSettings.testBody };
		return s;
	});
	const [loading, setLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const lock=useRef(false);
    const [notice,setNotice]=useState("");
    const [error,setError]=useState("");
    const [loadError,setLoadError]=useState("");


	const loadApplicationResultSettings = async () => {
		try {
			setLoading(true); setLoadError("");
			const response = await customFetch(`applicationsetting/resultsettings`);
			if(!response || response.error || response.status===false || response.status==="error")throw new Error("Settings unavailable");
            if (Object.keys(response).length == 0) return;
			// Merge in default column names if missing
			const merged = {
				...defaultResultSettings,
				...response,
				testBody: { ...defaultTestBodyColumnNames, ...(response?.testBody || {}) },
				patientInfo: { ...defaultResultSettings.patientInfo, ...(response?.patientInfo || {}) },
				companyInfo: { ...defaultResultSettings.companyInfo, ...(response?.companyInfo || {}) },
				comments: { ...defaultResultSettings.comments, ...(response?.comments || {}) },
			};
			setSettings(merged);
		} catch (error) {
			setLoadError("Report settings could not be loaded. Retry before editing.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadApplicationResultSettings();
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		const { name, value, type } = e.target;
        const checked = "checked" in e.target ? e.target.checked : false;
		if (name.startsWith('companyInfo.')) {
			const key = name.split('.')[1];
			setSettings((prev) => ({
				...prev,
				companyInfo: { ...prev.companyInfo, [key]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value },
			}));
		} else if (name.startsWith('patientInfo.')) {
			const key = name.split('.')[1];
			setSettings((prev) => ({
				...prev,
				patientInfo: { ...prev.patientInfo, [key]: type === 'checkbox' ? checked : value },
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
				comments: { ...prev.comments, [key]: type === 'checkbox' ? checked : value },
			}));
		} else if (type === 'checkbox') {
			setSettings((prev) => ({ ...prev, [name]: checked }));
		} else if (type === 'number') {
			setSettings((prev) => ({ ...prev, [name]: Number(value) }));
		} else {
			setSettings((prev) => ({ ...prev, [name]: value }));
		}
	};

	const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if(lock.current)return;
        lock.current=true;setError("");setNotice("");
		try {
			setIsSubmitting(true);
			const response: { status: 'success' | "error" | 'failed' | boolean, message: string } = await customPost(`applicationsetting/resultsettings`, "PUT", { data: settings });
			const { status, message } = response;
			if (status === 'success' || status === true) {
				setNotice(message || "Report settings saved.");
			} else {
				setError(message || "Settings were not saved. Your edits have been kept.");
			}
		} catch (error) {
			setError("Settings were not saved. Your edits have been kept.");
		} finally {
			setIsSubmitting(false); lock.current=false;
		}
	};

	if (loading) return <Loader />;
    if(loadError)return <div role="alert" className="alert alert-danger">{loadError}<button className="btn btn-outline-secondary ms-3" onClick={loadApplicationResultSettings}>Retry settings</button></div>;

	return (
		<div className={ui.workspace}>
			<div className="mx-2 d-flex justify-content-between align-items-center mb-3">
				<div><span className={ui.eyebrow}>APPLICATION SETTINGS</span><h1>Report settings</h1><p className={ui.description}>Configure report content, company details and presentation without changing result data.</p></div>
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

			{error&&<div role="alert" className="alert alert-danger">{error}</div>}{notice&&<div role="status" className="alert alert-success">{notice}</div>}
            <fieldset disabled={isSubmitting}><Tab.Container defaultActiveKey="general">
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
					<Nav.Item>
						<Nav.Link eventKey="comments" className="d-flex align-items-center">
							<RiChatQuoteLine size={16} className="me-2" />
							Comments
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

					<Tab.Pane eventKey="comments">
						<CommentsTab settings={settings} handleChange={handleChange} />
					</Tab.Pane>
				</Tab.Content>
			</Tab.Container></fieldset>
		</div>
	);
};

export default SettingsForm;
