'use client';
import styles from './OrganizationWorkspace.module.css';
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

	const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
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
					reset(Object.fromEntries(Object.keys(defaultData).map(key=>[key,result[0][key] ?? ''])))
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
        try {
            const result = await customPost('organization/update/contact', 'PUT', {organizationid, ...formData});
            if (result?.status === true) toast.success(result.message || 'Contact saved');
            else toast.error(result?.message || result?.error || 'Unable to save contact');
        } catch { toast.error('Unable to save contact. Please try again.'); }
    };

	const renderingContact = () => {
		if (loading) return <Loader />;
		return (
			<Card className={styles.panel}>
				<Card.Body>
					<Form className={`${styles.fields} ${styles.profileFields}`} onSubmit={handleSubmit(onSubmit)}>
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
											placeholder="Contact Person"
											{...field} value={field.value ?? ''}
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
											placeholder="Contact Email"
											{...field} value={field.value ?? ''}
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
											inputMode="tel"
											placeholder="Mobile Number"
											{...field} value={field.value ?? ''}
											isInvalid={!!errors.mobile}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.mobile?.message}
										</Form.Control.Feedback>
									</>
								)}
							/>
						</Form.Group>

						<Form.Group className={`${styles.saveBar} ${styles.spanAll}`}>
							<Button type="submit" disabled={isSubmitting} className={styles.primary}>
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
