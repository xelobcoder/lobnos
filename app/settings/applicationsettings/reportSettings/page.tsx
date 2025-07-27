"use client"
import React, { useEffect, useState } from 'react';
import { Form, Button, Col, Row, Card, Container } from 'react-bootstrap';
import { defaultResultSettings, ResultSettings } from '../../../../components/ResultView/result-settings';
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';
import Loader from '../../../../components/accessories/Loader';




const fontFamilies = [
	'Arial, Helvetica, sans-serif',
	'Verdana, Geneva, sans-serif',
	'Tahoma, Geneva, sans-serif',
	'Trebuchet MS, Helvetica, sans-serif',
	'Times New Roman, Times, serif',
	'Georgia, serif',
	'Garamond, serif',
	'Courier New, Courier, monospace',
	'Brush Script MT, cursive',
	'Lexend Deca, Helvetica, Arial, sans-serif',
	'Cambria, Georgia, serif',
	'Ralleway, Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
];

const SettingsForm = () => {
	const [settings, setSettings] = useState<ResultSettings>(defaultResultSettings);
	const [loading, setLoading] = useState<boolean>(true);
	const [isSubmitting, setIsSubmitting] = useState<boolean>(false);


	const loadApplicationResultSettings = async () => {
		try {
			setLoading(true);
			const response = await customFetch(`applicationsetting/resultsettings`);
			if (response && Object.keys(response).length == 0) return;
			setSettings(response);
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
		<Container fluid className="p-4">
			<h4 className="mb-4">Report Settings</h4>
			<Form onSubmit={handleSubmit}>
				<Row>
					<Col lg={6}>
						{/* General Settings Card */}
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-light">
								<h5 className="mb-0">General Settings</h5>
							</Card.Header>
							<Card.Body>
								<Form.Group className="mb-3" controlId="fontfamily">
									<div className="form-label">Font Family</div>
									<Form.Select
										name="fontfamily"
										value={settings.fontfamily}
										onChange={handleChange}
									>
										{fontFamilies.map((f) => (
											<option key={f} value={f}>{f}</option>
										))}
									</Form.Select>
								</Form.Group>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testnameColor">
											<div className="form-label">Test Name Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testnameColor"
	value={settings.testnameColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testnameColor: value }));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testnameColor"
	value={settings.testnameColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testnameColor: value }));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testnameBackgroundColor">
											<div className="form-label">Test Name Background Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testnameBackgroundColor"
	value={settings.testnameBackgroundColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testnameBackgroundColor: value }));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testnameBackgroundColor"
	value={settings.testnameBackgroundColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testnameBackgroundColor: value }));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testnameFontSize">
											<div className="form-label">Test Name Font Size (px)</div>
											<Form.Control
												type="number"
												name="testnameFontSize"
												value={settings.testnameFontSize}
												onChange={handleChange}
												min={8}
												max={72}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="mainReportHeaderBgColor">
											<div className="form-label">Main Report Header Background Color</div>
											<div className="d-flex align-items-center gap-2">
												<Form.Control
													type="color"
													name="mainReportHeaderBgColor"
													value={settings.mainReportHeaderBgColor}
													onChange={e => {
														const value = e.target.value;
														setSettings(prev => ({ ...prev, mainReportHeaderBgColor: value }));
													}}
													style={{ width: 50, minWidth: 50, padding: 0 }}
												/>
												<Form.Control
													type="text"
													name="mainReportHeaderBgColor"
													value={settings.mainReportHeaderBgColor}
													onChange={e => {
														const value = e.target.value;
														setSettings(prev => ({ ...prev, mainReportHeaderBgColor: value }));
													}}
													style={{ width: 120 }}
												/>
											</div>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="mainReportHeaderColor">
											<div className="form-label">Main Report Header Text Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="mainReportHeaderColor"
	value={settings.mainReportHeaderColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, mainReportHeaderColor: value }));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="mainReportHeaderColor"
	value={settings.mainReportHeaderColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, mainReportHeaderColor: value }));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testTableHeaderBackgroundColor">
											<div className="form-label">Test Table Header Background Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testTableHeaderBackgroundColor"
	value={settings.testTableHeaderBackgroundColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testTableHeaderBackgroundColor: value }));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testTableHeaderBackgroundColor"
	value={settings.testTableHeaderBackgroundColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testTableHeaderBackgroundColor: value }));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testTableHeaderTextColor">
											<div className="form-label">Test Table Header Text Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testTableHeaderTextColor"
	value={settings.testTableHeaderTextColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testTableHeaderTextColor: value }));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testTableHeaderTextColor"
	value={settings.testTableHeaderTextColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({ ...prev, testTableHeaderTextColor: value }));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testTableHeaderFontSize">
											<div className="form-label">Test Table Header Font Size (px)</div>
											<Form.Control
												type="number"
												name="testTableHeaderFontSize"
												value={settings.testTableHeaderFontSize}
												onChange={handleChange}
												min={8}
												max={72}
											/>
										</Form.Group>
									</Col>
								</Row>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="companyInfo.namefontsize">
											<div className="form-label">Company Name Font Size (px)</div>
											<Form.Control
												type="number"
												name="companyInfo.namefontsize"
												value={settings.companyInfo.namefontsize}
												onChange={handleChange}
												min={8}
												max={72}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="companyInfo.color">
											<div className="form-label">Company Name Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="companyInfo.color"
	value={settings.companyInfo.color}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			companyInfo: { ...prev.companyInfo, color: value }
		}));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="companyInfo.color"
	value={settings.companyInfo.color}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			companyInfo: { ...prev.companyInfo, color: value }
		}));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
								</Row>
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="includeSignature"
										label="Include Signature"
										name="includeSignature"
										checked={settings.includeSignature}
										onChange={handleChange}
									/>
								</Form.Group>
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="includeLimitations"
										label="Include Limitations"
										name="includeLimitations"
										checked={settings.includeLimitations}
										onChange={handleChange}
									/>
								</Form.Group>
								{settings.includeLimitations && (
									<Form.Group className="mb-3" controlId="limitations">
										<div className="form-label">Limitations</div>
										<Form.Control
											as="textarea"
											name="limitations"
											value={settings.limitations}
											onChange={handleChange}
											rows={3}
										/>
									</Form.Group>
								)}
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="showEndOfResult"
										label="Show End Of Result"
										name="showEndOfResult"
										checked={settings.showEndOfResult}
										onChange={handleChange}
									/>
								</Form.Group>
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="includeBarcode"
										label="Include Barcode"
										name="includeBarcode"
										checked={!!settings.includeBarcode}
										onChange={handleChange}
									/>
								</Form.Group>
								<Form.Group className="mb-3" controlId="template">
									<div className="form-label">Template</div>
									<Form.Select
										name="template"
										value={settings.template}
										onChange={handleChange}
									>
										<option value={1}>Template 1</option>
										<option value={2}>Template 2</option>
										<option value={3}>Template 3</option>
									</Form.Select>
								</Form.Group>
							</Card.Body>
						</Card>
					</Col>
					<Col lg={6}>
						{/* Test Body Settings Card */}
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-light">
								<h5 className="mb-0">Test Body Settings</h5>
							</Card.Header>
							<Card.Body>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testBody.fontSize">
											<div className="form-label">Test Body Font Size (px)</div>
											<Form.Control
												type="number"
												name="testBody.fontSize"
												value={settings.testBody.fontSize}
												onChange={handleChange}
												min={8}
												max={72}
											/>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-3" controlId="testBody.color">
											<div className="form-label">Test Body Color</div>
											<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testBody.color"
	value={settings.testBody.color}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, color: value }
		}));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testBody.color"
	value={settings.testBody.color}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, color: value }
		}));
	}}
	style={{ width: 120 }}
/>
											</div>
										</Form.Group>
									</Col>
								</Row>
								<Form.Group className="mb-3" controlId="testBody.fontFamily">
									<div className="form-label">Test Body Font Family</div>
									<Form.Select
										name="testBody.fontFamily"
										value={settings.testBody.fontFamily}
										onChange={handleChange}
									>
										{fontFamilies.map((f) => (
											<option key={f} value={f}>{f}</option>
										))}
									</Form.Select>
								</Form.Group>
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="testBody.highlightFlags"
										label="Highlight Flags"
										name="testBody.highlightFlags"
										checked={settings.testBody.highlightFlags}
										onChange={handleChange}
									/>
								</Form.Group>
								<Form.Group className="mb-3 d-flex align-items-center">
									<Form.Check
										type="switch"
										id="testBody.hasColorsForFlags"
										label="Has Colors For Flags"
										name="testBody.hasColorsForFlags"
										checked={settings.testBody.hasColorsForFlags}
										onChange={handleChange}
									/>
								</Form.Group>
								{settings.testBody.hasColorsForFlags && (
									<Row>
										<Col md={6}>
											<Form.Group className="mb-3" controlId="testBody.hightFlagColor">
												<div className="form-label">High Flag Color</div>
												<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testBody.hightFlagColor"
	value={settings.testBody.hightFlagColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, hightFlagColor: value }
		}));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testBody.hightFlagColor"
	value={settings.testBody.hightFlagColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, hightFlagColor: value }
		}));
	}}
	style={{ width: 120 }}
/>
												</div>
											</Form.Group>
										</Col>
										<Col md={6}>
											<Form.Group className="mb-3" controlId="testBody.lowFlagColor">
												<div className="form-label">Low Flag Color</div>
												<div className="d-flex align-items-center gap-2">
<Form.Control
	type="color"
	name="testBody.lowFlagColor"
	value={settings.testBody.lowFlagColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, lowFlagColor: value }
		}));
	}}
	style={{ width: 50, minWidth: 50, padding: 0 }}
/>
<Form.Control
	type="text"
	name="testBody.lowFlagColor"
	value={settings.testBody.lowFlagColor}
	onChange={e => {
		const value = e.target.value;
		setSettings(prev => ({
			...prev,
			testBody: { ...prev.testBody, lowFlagColor: value }
		}));
	}}
	style={{ width: 120 }}
/>
												</div>
											</Form.Group>
										</Col>
									</Row>
								)}
								<Row>
									<Col md={4}>
										<Form.Group className="mb-3 d-flex align-items-center">
											<Form.Check
												type="switch"
												id="testBody.boldenParameter"
												label="Bolden Parameter"
												name="testBody.boldenParameter"
												checked={settings.testBody.boldenParameter}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className="mb-3 d-flex align-items-center">
											<Form.Check
												type="switch"
												id="testBody.boldenValue"
												label="Bolden Value"
												name="testBody.boldenValue"
												checked={settings.testBody.boldenValue}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
									<Col md={4}>
										<Form.Group className="mb-3 d-flex align-items-center">
											<Form.Check
												type="switch"
												id="testBody.boldenUnits"
												label="Bolden Units"
												name="testBody.boldenUnits"
												checked={settings.testBody.boldenUnits}
												onChange={handleChange}
											/>
										</Form.Group>
									</Col>
								</Row>
							</Card.Body>
						</Card>
						{/* Comments Settings Card */}
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-light">
								<h5 className="mb-0">Comments Settings</h5>
							</Card.Header>
							<Card.Body>
								<Form.Group className="mb-3" controlId="comments.fontFamily">
									<div className="form-label">Comments Font Family</div>
									<Form.Select
										name="comments.fontFamily"
										value={settings.comments.fontFamily}
										onChange={handleChange}
									>
										{fontFamilies.map((f) => (
											<option key={f} value={f}>{f}</option>
										))}
									</Form.Select>
								</Form.Group>
							</Card.Body>
						</Card>
					</Col>
				</Row>
				<div className="d-flex justify-content-end mt-4">
					<Button disabled={isSubmitting} variant="primary" type="submit" size="lg">
						{isSubmitting ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</Form>
		</Container>
	);
};

export default SettingsForm;
