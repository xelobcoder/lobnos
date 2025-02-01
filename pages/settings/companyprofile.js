import React, { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';
import Image from 'next/image';

export default function CompanyProfile() {
	// Default data with valid JSON for labTimings
	const defaultData = {
		name: '',
		email: '',
		phonenumber: '',
		motto: '',
		address: '',
		website: '',
		street: '',
		alternativeNumber: '',
		labTimings: '{"timings": [{"to": "17:30:00", "from": "08:00:00", "day": "0"}, {"to": "17:30:00", "from": "08:00:00", "day": "1"}, {"to": "17:30:00", "from": "08:00:00", "day": "2"}, {"to": "17:30:00", "from": "08:00:00", "day": "3"}, {"to": "17:30:00", "from": "08:00:00", "day": "4"}, {"to": "17:30:00", "from": "08:00:00", "day": "5"}, {"to": "17:30:00", "from": "08:00:00", "day": "6"}]}'
	};

	const [companyData, setCompanyData] = useState(defaultData);
	const [selectedImage, setSelectedImage] = useState(null);

	// Handle form submission
	const handleData = async (ev) => {
		ev.preventDefault();
		try {
			const emptyFields = Object.keys(companyData).filter(e => companyData[e] === '');
			const isValidMobile = companyData.phonenumber.length === 10 && companyData.phonenumber[0] === '0';

			if (emptyFields.length === 0 && isValidMobile) {
				const response = await customPost('settings/companyprofile', 'POST', companyData);
				if (response?.status === 'success') {
					setCompanyData(defaultData);
					alert('Updated successfully');
				}
			} else {
				if (!isValidMobile) {
					alert('Incorrect Phone Number');
				} else {
					alert(`${emptyFields.join(', ')} fields are required`);
				}
			}
		} catch (err) {
			console.error(err);
		}
	};

	// Handle image upload
	const onDrop = async (acceptedFiles) => {
		const file = acceptedFiles[0];
		setSelectedImage(URL.createObjectURL(file));

		const formData = new FormData();
		formData.append('file', file);
		try {
			const response = await fetch(`${process.env.BASEURL}/settings/companyprofile/images`, {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				console.log('File uploaded successfully');
			} else {
				console.error('Error uploading file:', response.statusText);
			}
		} catch (error) {
			console.error('Error uploading file:', error);
		}
	};

	const { getRootProps, getInputProps } = useDropzone({ onDrop, multiple: false });

	// Fetch company data and image on component mount
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await customFetch('settings/companyprofile');
				setCompanyData(response);

				const imageResponse = await fetch(`${process.env.BASEURL}/settings/companyprofile/images`);
				if (imageResponse.ok) {
					const imageBlob = await imageResponse.blob();
					setSelectedImage(URL.createObjectURL(imageBlob));
				} else {
					console.error('Error fetching image:', imageResponse.statusText);
				}
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		};
		fetchData();
	}, []);

	// Handle changes to the lab timings
	const handleTimingsChange = (index, field, value) => {
		try {
			const timings = JSON.parse(companyData.labTimings).timings;
			timings[index][field] = value;
			setCompanyData({
				...companyData,
				labTimings: JSON.stringify({ timings })
			});
		} catch (error) {
			console.error('Error updating timings:', error);
		}
	};

	// Render timing fields
	const renderTimingsFields = () => {
		let timings = [];
		try {
			timings = JSON.parse(companyData.labTimings).timings;
		} catch (error) {
			console.error('Error parsing timings:', error);
			timings = []; // Default to empty array if parsing fails
		}

		return timings.map((timing, index) => (
			<Row key={index} className="my-2">
				<Col>
					<Form.Group controlId={`formGridFrom${index}`}>
						<Form.Label>From (Day {timing.day})</Form.Label>
						<Form.Control
							type="time"
							value={timing.from}
							onChange={(e) => handleTimingsChange(index, 'from', e.target.value)}
						/>
					</Form.Group>
				</Col>
				<Col>
					<Form.Group controlId={`formGridTo${index}`}>
						<Form.Label>To (Day {timing.day})</Form.Label>
						<Form.Control
							type="time"
							value={timing.to}
							onChange={(e) => handleTimingsChange(index, 'to', e.target.value)}
						/>
					</Form.Group>
				</Col>
			</Row>
		));
	};

	return (
		<MainSettingsLayoutView>
			<div className="container mt-4">
				<h4 className="text-capitalize">Upload Company Information</h4>
				<hr />
				<div
					{...getRootProps({ className: 'dropzone' })}
					style={{ border: '2px dashed #007bff', padding: '0px', width: '200px', height: '200px', borderRadius: '5px' }}
				>
					<input {...getInputProps()} />
					{selectedImage ? (
						<Image
							src={selectedImage}
							width={100}
							height={100}
							alt="Preview"
							style={{ width: '100%', height: '100%' }}
						/>
					) : (
						<p>Drag & drop an image here, or click to select an image</p>
					)}
				</div>
				<Form onSubmit={handleData}>
					<div className='col-7'>
						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridName">
							<Form.Label>Name</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.name}
								onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridEmail">
							<Form.Label>Email</Form.Label>
							<Form.Control
								className="custom-input"
								type="email"
								value={companyData.email}
								onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridAddress">
							<Form.Label>Address</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.address}
								onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridMotto">
							<Form.Label>Motto</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.motto}
								onChange={(e) => setCompanyData({ ...companyData, motto: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridPhoneNumber">
							<Form.Label>Phone Number</Form.Label>
							<Form.Control
								className="custom-input"
								type="tel"
								value={companyData.phonenumber}
								maxLength={10}
								onChange={(e) => setCompanyData({ ...companyData, phonenumber: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridStreet">
							<Form.Label>Street</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.street}
								onChange={(e) => setCompanyData({ ...companyData, street: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridAltNumber">
							<Form.Label>Alternative Number</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.alternativeNumber}
								onChange={(e) => setCompanyData({ ...companyData, alternativeNumber: e.target.value })}
							/>
						</Form.Group>

						<Form.Group className='grid-30-70 my-2' as={Col} controlId="formGridWebsite">
							<Form.Label>Website</Form.Label>
							<Form.Control
								className="custom-input"
								type="text"
								value={companyData.website}
								onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
							/>
						</Form.Group>
					</div>
					<hr />
					<h5>Timing Information</h5>
					<hr />
					{renderTimingsFields()}
					<Button variant="primary" type="submit" className="mt-3">
						Save Information
					</Button>
				</Form>
			</div>
		</MainSettingsLayoutView>
	);
}
