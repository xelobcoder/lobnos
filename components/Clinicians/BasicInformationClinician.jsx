import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, Col, Row } from "react-bootstrap";
import { useSearchParams } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";

const schema = yup.object().shape({
	name: yup.string().required("Clinician name is required"),
	phone: yup
		.string()
		.matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
		.required("Phone number is required"),
	email: yup.string().email("Invalid email address").notRequired(),
	organization: yup.number().notRequired(),
	location: yup.string().notRequired(),
	address: yup.string().notRequired(),
	occupation: yup.string().notRequired(),
});

export default function BasicInformationClinician() {
	const [OrganizationList, setOrganization] = useState([]);
	const [isloading, setLoading] = useState(false);
	const clinicianId = useSearchParams().get("clinicianid");


	const defaultData = {
		id: clinicianId,
		name: "",
		phone: "",
		email: "",
		organization: 0,
		location: "",
		address: "",
		occupation: "",
	};

	const { control, handleSubmit, reset: resetForm, formState: { errors } } = useForm({
		defaultValues: defaultData,
		resolver: yupResolver(schema),
	});


	const fetchPreviousData = async (clinicianId) => {

		if (clinicianId && typeof clinicianId === "number") {
			try {
				setLoading(true);
				const response = await customFetch(`clinicians/getclinician?id=${clinicianId}`);

				const { result } = response
				if (Array.isArray(result) && result.length > 0) {
					resetForm(result[0])
					setLoading(false);
				}
			} catch (err) {
				setLoading(false);
			}
		}
	}

	useEffect(() => {
		fetchPreviousData(parseInt(clinicianId))
	}, [clinicianId]);

	useEffect(() => {
		setLoading(true);
		customFetch("organization")
			.then((dataList) => {
				const { organizations } = dataList;
				setOrganization(organizations);
			}).catch((err) => {
				setLoading(false);
				toast.error(err?.message || "something wrong occured");
			})
			.finally(() => { setLoading(false) })
	}, []);

	const onSubmit = async (formData) => {
		try {
			const method = clinicianId ? 'PUT' : 'POST';

			const response = await customPost("clinicians", method, formData);
			const { statusCode, status, message } = response;

			if (statusCode === 200 && status === "success") {
				toast.success(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
				resetForm();
			} else {
				toast.error(message, { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
			}
		} catch (error) {
			console.log(error)
			toast.error("Submission failed, please try again.", { position: toast.POSITION.TOP_CENTER, autoClose: 2000 });
		}
	};

	const renderingFormView = () => {
		if (isloading) return <Loader />;

		return (
			<Form onSubmit={handleSubmit(onSubmit)}>
				<Row>
					<Col md={8}>
						<Form.Group className="grid-reg my-2" controlId="formName">
							<Form.Label className="pls-label pls-color">Clinician Name</Form.Label>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="text"
										placeholder="Enter Clinician Name"
										{...field}
										maxLength={50}
										isInvalid={!!errors.name}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.name?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formPhone">
							<Form.Label className="pls-label pls-color">Phone Number</Form.Label>
							<Controller
								name="phone"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="tel"
										placeholder="Enter Phone Number"
										{...field}
										maxLength={10}
										minLength={10}
										isInvalid={!!errors.phone}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.phone?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formEmail">
							<Form.Label className="pls-label pls-color">Email</Form.Label>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="email"
										placeholder="Enter Email"
										{...field}
										isInvalid={!!errors.email}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.email?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formLocation">
							<Form.Label className="pls-label pls-color">Location</Form.Label>
							<Controller
								name="location"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="text"
										placeholder="Enter Location"
										{...field}
										maxLength={100}
										isInvalid={!!errors.location}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.location?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formAddress">
							<Form.Label className="pls-label pls-color">Address</Form.Label>
							<Controller
								name="address"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="text"
										placeholder="Enter Address"
										{...field}
										maxLength={200}
										isInvalid={!!errors.address}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.address?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formOccupation">
							<Form.Label className="pls-label pls-color">Occupation</Form.Label>
							<Controller
								name="occupation"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-input"
										type="text"
										placeholder="Enter Occupation"
										{...field}
										maxLength={50}
										isInvalid={!!errors.occupation}
									/>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.occupation?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formOrganization">
							<Form.Label className="pls-label pls-color">Organization</Form.Label>
							<Controller
								name="organization"
								control={control}
								render={({ field }) => (
									<Form.Control
										className="custom-select"
										as="select"
										{...field}
										isInvalid={!!errors.organization}
									>
										<option value="">Select Organization</option>
										{OrganizationList.map((org) => (
											<option key={org.id} value={org.id}>
												{org.name}
											</option>
										))}
									</Form.Control>
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.organization?.message}
							</Form.Control.Feedback>
						</Form.Group>

						<Form.Group className="d-flex justify-content-start mt-3">
							<Button type="submit" variant="primary">
								Save Clinician
							</Button>
						</Form.Group>
					</Col>
				</Row>
			</Form>
		);
	};


	return (
		<React.Fragment>
			<ToastContainer position="top-center" className={'text-sm'} theme="colored" />
			{clinicianId ? <h5>Update clinician Information</h5> : <h5>New Clinician</h5>}
			<div className="p-3">{renderingFormView()}</div>
		</React.Fragment>
	)
}
