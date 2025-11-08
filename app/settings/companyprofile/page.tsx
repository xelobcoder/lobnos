"use client";
import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import {
	RiUserLine, RiMailLine, RiPhoneLine, RiQuillPenLine, RiMapPinLine,
	RiGlobalLine, RiRoadMapLine, RiSmartphoneLine, RiUploadCloud2Line, RiSaveLine
} from '@remixicon/react';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import Image from 'next/image';
import { toast } from 'react-toastify';

interface CompanyData {
	name: string;
	email: string;
	phonenumber: string;
	motto: string;
	address: string;
	website: string;
	street: string;
	alternativenumber: string;
	labTimings: string;
}

interface Timing {
	to: string;
	from: string;
	day: string;
}

export default function CompanyProfile() {
	const defaultData = {
		name: '',
		email: '',
		phonenumber: '',
		motto: '',
		address: '',
		website: '',
		street: '',
		alternativenumber: '',
		labTimings: '{"timings": []}'
	};

	const [companyData, setCompanyData] = useState(defaultData);
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	const handleData = async (ev: React.FormEvent) => {
		ev.preventDefault();
		try {
			const requiredFields = ['name', 'email', 'phonenumber', 'address'];
			const emptyFields = requiredFields.filter(key => !companyData[key as keyof CompanyData]);
			const isValidMobile = companyData.phonenumber.length === 10 && companyData.phonenumber[0] === '0';

			if (emptyFields.length === 0 && isValidMobile) {
				const response = await customPost('settings/companyprofile', 'POST', companyData);
				if (response?.status === 'success') {
					toast.success('Updated successfully');
				} else {
					toast.error(`Update failed: ${response?.message || 'Unknown error'}`);
				}
			} else {
				let alertMessage = '';
				if (!isValidMobile) {
					alertMessage = 'Incorrect Phone Number format (must be 10 digits starting with 0).';
				} else if (emptyFields.length > 0) {
					alertMessage = `${emptyFields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(', ')} field(s) are required.`;
				}
				toast.error(alertMessage);
			}
		} catch (err) {
			console.error('Error submitting data:', err);
			toast.error('An error occurred while saving information.');
		}
	};

	const onDrop = async (acceptedFiles: File[]) => {
		const file = acceptedFiles[0];
		if (file) {
			setSelectedImage(URL.createObjectURL(file));
			const formData = new FormData();
			formData.append('file', file);

			try {
				const baseUrl = process.env.BASEURL?.endsWith('/') ? process.env.BASEURL : `${process.env.BASEURL}/`;
				const response = await fetch(`${baseUrl}settings/companyprofile/images`, {
					method: 'POST',
					body: formData,
				});
				if (!response.ok) {
					const errorText = await response.text();
					console.error('Error uploading file:', response.statusText, errorText);
					alert(`Error uploading file: ${response.statusText}`);
				}
			} catch (error) {
				console.error('Error uploading file:', error);
				alert('An error occurred during file upload.');
			}
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await customFetch('settings/companyprofile');
				if (response) {
					setCompanyData({ ...defaultData, ...response, labTimings: response.labTimings || '{"timings": []}', alternativenumber: response.alternativenumber });
				}

				const baseUrl = process.env.BASEURL
				const imageResponse = await fetch(`${baseUrl}settings/companyprofile/images`);
				if (imageResponse.ok) {
					const imageBlob = await imageResponse.blob();
					if (imageBlob.size > 0) {
						setSelectedImage(URL.createObjectURL(imageBlob));
					} else {
						setSelectedImage(null);
					}
				} else {
					setSelectedImage(null);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
				setSelectedImage(null);
			}
		};
		fetchData();

		return () => {
			if (selectedImage) {
				URL.revokeObjectURL(selectedImage);
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const { getRootProps, getInputProps } = useDropzone({
		onDrop,
		multiple: false,
		accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.svg'] }
	});

	return (
		<div className="container-fluid p-4">
			<div className="mb-4">
				<h2 className="mb-1">Company Profile & Settings</h2>
				<p className="text-muted mb-0">Manage your company&apos;s basic information, logo, and contact details</p>
			</div>
			<Row className="g-4">
				<Col md={4} className="mb-4 mb-md-0">
					<div className="border bg-white border-secondary-subtle mx-2 p-3">
						<h5 className="mb-3">Company Logo</h5>
						<div
							{...getRootProps({ className: 'dropzone text-center p-4' })}
							style={{
								border: '2px dashed var(--bs-primary)',
								borderRadius: '8px',
								cursor: 'pointer',
								backgroundColor: 'var(--bs-light)',
								minHeight: '250px',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center'
							}}
						>
							<input {...getInputProps()} />
							{selectedImage ? (
								<Image
									src={selectedImage}
									width={150}
									height={150}
									alt="Company Logo Preview"
									style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '150px' }}
									onError={() => setSelectedImage(null)}
								/>
							) : (
								<div className="text-muted">
									<RiUploadCloud2Line size={48} className="mb-2 text-primary" />
									<p className="mb-1 fw-semibold">Drag & drop logo here</p>
									<p className="mb-0 small">or click to select (JPEG, PNG, GIF, SVG)</p>
								</div>
							)}
						</div>
					</div>
				</Col>

				<Col md={8}>
					<div className="border bg-white border-secondary-subtle mx-2 p-2">
						<h5 className="mb-3 mx-4">Company Information</h5>
						<Form onSubmit={handleData} noValidate className="mx-4">
							<Form.Group className='mb-3' controlId="formGridName">
								<Form.Label>Company Name</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiUserLine size={20} /></InputGroup.Text>
									<Form.Control
										type="text"
										placeholder="Enter company name"
										value={companyData.name}
										onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
										required
									/>
									<Form.Control.Feedback type="invalid">Please provide a company name.</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-3' controlId="formGridEmail">
								<Form.Label>Email Address</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiMailLine size={20} /></InputGroup.Text>
									<Form.Control
										type="email"
										placeholder="Enter contact email"
										value={companyData.email}
										onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
										required
									/>
									<Form.Control.Feedback type="invalid">Please provide a valid email address.</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-3' controlId="formGridPhoneNumber">
								<Form.Label>Phone Number</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiPhoneLine size={20} /></InputGroup.Text>
									<Form.Control
										type="tel"
										placeholder="0xxxxxxxxx"
										value={companyData.phonenumber}
										onChange={(e) => setCompanyData({ ...companyData, phonenumber: e.target.value })}
										maxLength={10}
										pattern="0[0-9]{9}"
										required
									/>
									<Form.Control.Feedback type="invalid">Please provide a 10-digit phone number starting with 0.</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>							<Form.Group className='mb-3' controlId="formGridMotto">
								<Form.Label>Motto / Slogan</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiQuillPenLine size={20} /></InputGroup.Text>
									<Form.Control
										as="textarea"
										rows={2}
										placeholder="Enter company motto (optional)"
										value={companyData.motto}
										onChange={(e) => setCompanyData({ ...companyData, motto: e.target.value })}
									/>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-3' controlId="formGridAddress">
								<Form.Label>Full Address</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiMapPinLine size={20} /></InputGroup.Text>
									<Form.Control
										type="text"
										placeholder="Enter main address line"
										value={companyData.address}
										onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
										required
									/>
									<Form.Control.Feedback type="invalid">Please provide the company address.</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-3' controlId="formGridStreet">
								<Form.Label>Street / Area</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiRoadMapLine size={20} /></InputGroup.Text>
									<Form.Control
										type="text"
										placeholder="Enter street or area name (optional)"
										value={companyData.street}
										onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })}
									/>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-3' controlId="formGridAltNumber">
								<Form.Label>Alternative Number</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiSmartphoneLine size={20} /></InputGroup.Text>
									<Form.Control
										type="tell"
										minLength={10}
										maxLength={13}
										placeholder="Optional secondary number"
										value={companyData.alternativenumber}
										onChange={(e) => setCompanyData({ ...companyData, alternativenumber: e.target.value })}
									/>
								</InputGroup>
							</Form.Group>

							<Form.Group className='mb-4' controlId="formGridWebsite">
								<Form.Label>Website</Form.Label>
								<InputGroup>
									<InputGroup.Text><RiGlobalLine size={20} /></InputGroup.Text>
									<Form.Control
										type="url"
										placeholder="https://www.example.com (optional)"
										value={companyData.website}
										onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
									/>
									<Form.Control.Feedback type="invalid">Please enter a valid URL (e.g., https://example.com).</Form.Control.Feedback>
								</InputGroup>
							</Form.Group>

							<Button variant="primary" type="submit" className="px-4 py-2">
								<RiSaveLine size={16} className="me-2" />
								Save Information
							</Button>
						</Form>
					</div>
				</Col>
			</Row>
		</div>
	);
}
