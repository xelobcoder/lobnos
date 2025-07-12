'use client'
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { customFetch, customPost } from "../Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, Card } from 'react-bootstrap';
import { ToastContainer, toast } from "react-toastify";

const schema = yup.object().shape({
	name: yup.string().required("Contact person name is required"),
	email: yup.string().email("Invalid email address").required("Email is required"),
	mobile: yup.string().matches(/^[0-9]{10}$/, "Mobile number must be 10 digits").required("Mobile number is required"),
});

export default function ContactPerson({ organizationid }) {
	const defaultData = { name: "", email: "", mobile: "" };
	const [data, setData] = useState(defaultData);
	const [loading, setLoading] = useState(true);

	const { control, handleSubmit, reset, formState: { errors } } = useForm({
		defaultValues: defaultData,
		resolver: yupResolver(schema),
	});

	const contactDetails = async () => {
		try {
			if (organizationid) {
				setLoading(true);
				const result = await customFetch(`organization/contactperson?id=${organizationid}`);
				if (Array.isArray(result) && result.length > 0) {
					setData(result[0]);
					reset(result[0])
				}
				setLoading(false);
			}
		} catch (err) {
			setLoading(false);
		}
	};

	useEffect(() => {
		contactDetails();
	}, [organizationid]);

	const onSubmit = async (formData) => {
		const postResponse = await customPost(`organization/update/contact`, "PUT", { organizationid, ...formData });
		const { status, message } = postResponse;
		if (status === true) {
			toast.success(message);
		} else {
			toast.error(message);
		}
	};

	const renderingContact = () => {
		if (loading) return <Loader />;
		return (
			<Card className="bg-white p-4">
				<Card.Body>
					<Form onSubmit={handleSubmit(onSubmit)}>
						<Form.Group className="grid-reg my-2" controlId="formName">
							<Form.Label>Contact Person</Form.Label>
							<Controller
								name="name"
								control={control}
								render={({ field }) => (
									<>
										<Form.Control
											className="custom-input"
											type="text"
											value={data.name}
											placeholder="Contact Person"
											{...field}
											isInvalid={!!errors.name}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.name?.message}
										</Form.Control.Feedback>
									</>
								)}
							/>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formEmail">
							<Form.Label>Email</Form.Label>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<>
										<Form.Control
											className="custom-input"
											type="email"
											value={data.email}
											placeholder="Contact Email"
											{...field}
											isInvalid={!!errors.email}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.email?.message}
										</Form.Control.Feedback>
									</>
								)}
							/>
						</Form.Group>

						<Form.Group className="grid-reg my-2" controlId="formMobile">
							<Form.Label>Mobile Number</Form.Label>
							<Controller
								name="mobile"
								control={control}
								render={({ field }) => (
									<>
										<Form.Control
											className="custom-input"
											type="tel"
											value={data.mobile}
											inputMode="tel"
											placeholder="Mobile Number"
											{...field}
											isInvalid={!!errors.mobile}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.mobile?.message}
										</Form.Control.Feedback>
									</>
								)}
							/>
						</Form.Group>

						<Form.Group className="d-flex justify-content-start mt-3">
							<Button type="submit" variant="primary">
								Save Changes
							</Button>
						</Form.Group>
					</Form>
				</Card.Body>
			</Card>
		);
	};

	return (
		<section>
			<ToastContainer theme="colored" className={'text-sm'} position="top-center" autoClose={2000} />
			{renderingContact()}
		</section>
	);
}
