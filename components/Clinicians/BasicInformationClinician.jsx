import React, { useEffect, useState, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { customFetch, customPost } from "../../components/Auth/customFetch";
import Loader from "../accessories/Loader";
import { Button, Form, Col, Row, Card, Spinner, Container, Alert } from "react-bootstrap";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { RiUser2Fill } from "@remixicon/react";

const schema = yup.object().shape({
	name: yup.string().required("Clinician name is required").max(50, "Name cannot exceed 50 characters"),
	phone: yup
		.string()
		.matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
		.required("Phone number is required"),
	email: yup.string().email("Invalid email address").max(100, "Email cannot exceed 100 characters").nullable().notRequired(),
	organization: yup.number().transform(value => (isNaN(value) || value === 0 ? undefined : value)).nullable().notRequired(),
	location: yup.string().max(100, "Location cannot exceed 100 characters").nullable().notRequired(),
	address: yup.string().max(200, "Address cannot exceed 200 characters").nullable().notRequired(),
	occupation: yup.string().max(50, "Occupation cannot exceed 50 characters").nullable().notRequired(),
});

export default function BasicInformationClinician() {
	const [organizationList, setOrganizationList] = useState([]);
	const [isLoadingData, setIsLoadingData] = useState(false);
	const [formError, setFormError] = useState("");

	const searchParams = useSearchParams();
	const router = useRouter();
	const clinicianId = searchParams.get("clinicianid");

	const defaultData = useCallback(() => ({
		id: clinicianId ? parseInt(clinicianId) : null,
		name: "",
		phone: "",
		email: "",
		organization: 0,
		location: "",
		address: "",
		occupation: "",
	}), [clinicianId]);

	const { control, handleSubmit, reset: resetForm, formState: { errors, isSubmitting, dirtyFields } } = useForm({
		defaultValues: defaultData(),
		resolver: yupResolver(schema),
	});

	const fetchClinicianData = useCallback(async (id) => {
		if (!id) return;
		setIsLoadingData(true);
		setFormError("");
		try {
			const response = await customFetch(`clinicians/getclinician?id=${id}`);
			const { result } = response;
			if (Array.isArray(result) && result.length > 0) {
				const clinicianData = result[0];
				resetForm({
					...defaultData(),
					...clinicianData,
					organization: clinicianData.organization || 0,
					email: clinicianData.email || "",
                    location: clinicianData.location || "",
                    address: clinicianData.address || "",
                    occupation: clinicianData.occupation || "",
				});
			} else {
				toast.error("Clinician data not found. You might be redirected.", { position: toast.POSITION.TOP_CENTER });
                setFormError("Failed to load clinician data. The record may not exist.");
			}
		} catch (err) {
			toast.error(err?.message || "Failed to fetch clinician data.", { position: toast.POSITION.TOP_CENTER });
            setFormError(err?.message || "An error occurred while fetching clinician data.");
		} finally {
			setIsLoadingData(false);
		}
	}, [resetForm, defaultData]);

	useEffect(() => {
		const currentClinicianId = searchParams.get("clinicianid");
		if (currentClinicianId) {
			const parsedId = parseInt(currentClinicianId);
			if (!isNaN(parsedId)) {
				fetchClinicianData(parsedId);
			} else {
                toast.error("Invalid Clinician ID in URL.", { position: toast.POSITION.TOP_CENTER });
                router.push("/clinicians"); 
            }
		} else {
            resetForm(defaultData());
        }
	}, [searchParams, fetchClinicianData, resetForm, defaultData, router]);

	useEffect(() => {
		let isMounted = true;
		setIsLoadingData(true);
		customFetch("organization")
			.then((dataList) => {
				if (isMounted) {
					const { organizations } = dataList;
					setOrganizationList(organizations || []);
				}
			})
			.catch((err) => {
				if (isMounted) {
					toast.error(err?.message || "Failed to fetch organizations.", { position: toast.POSITION.TOP_CENTER });
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoadingData(false);
				}
			});
		return () => { isMounted = false; };
	}, []);

	const onSubmit = async (formData) => {
		setFormError("");
		try {
			const dataToSend = {
				...formData,
				id: clinicianId ? parseInt(clinicianId) : undefined,
				organization: formData.organization && formData.organization !== 0 ? formData.organization : null,
                email: formData.email || null,
                location: formData.location || null,
                address: formData.address || null,
                occupation: formData.occupation || null,
			};

			const method = clinicianId ? 'PUT' : 'POST';
			const response = await customPost("clinicians", method, dataToSend);
			const { statusCode, status, message, result } = response;

			if (statusCode === 200 && status === "success") {
				toast.success(message || (clinicianId ? "Clinician updated successfully!" : "Clinician added successfully!"), { position: toast.POSITION.TOP_CENTER });
				if (!clinicianId && result?.id) {
                    router.push(`/clinicians/edit?clinicianid=${result.id}`);
				} else if (clinicianId) {
                    fetchClinicianData(parseInt(clinicianId));
                } else {
                    resetForm(defaultData());
                }
			} else {
				toast.error(message || "An unexpected error occurred.", { position: toast.POSITION.TOP_CENTER });
                setFormError(message || "Submission failed due to a server error.");
			}
		} catch (error) {
			toast.error(error?.message || "Submission failed, please try again.", { position: toast.POSITION.TOP_CENTER });
            setFormError(error?.message || "An unexpected client-side error occurred.");
		}
	};

    const handleReset = () => {
        if (clinicianId) {
            fetchClinicianData(parseInt(clinicianId));
        } else {
            resetForm(defaultData());
        }
        setFormError("");
    };

	if (isLoadingData && !isSubmitting) {
		return (
			<Container className="d-flex justify-content-center align-items-center" style={{ minHeight: 'calc(100vh - 200px)' }}>
				<Loader />
			</Container>
		);
	}

	return (
		<React.Fragment>
				<div className="border br-5 py-2 mb-2 px-2 ">
					<div className="d-flex align-items-center">
						<RiUser2Fill className="me-2" size={20} />
						<h5 className="mb-0">{clinicianId ? "Edit Clinician Details" : "Register New Clinician"}</h5>
					</div>
				</div>
			<div className="border br-5 ">
					<div className="p-4">
						{formError && <Alert variant="danger">{formError}</Alert>}
						<Form onSubmit={handleSubmit(onSubmit)} noValidate>
							<fieldset disabled={isSubmitting}>
								<Row className="mb-4">
									<Form.Group as={Col} md={6} controlId="formName">
										<Form.Label className="fw-semibold">Clinician Name <span className="text-danger">*</span></Form.Label>
										<Controller
											name="name"
											control={control}
											render={({ field }) => (
												<Form.Control
													type="text"
													placeholder="e.g., Dr. Jane Doe"
													{...field}
													isInvalid={!!errors.name}
												/>
											)}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.name?.message}
										</Form.Control.Feedback>
									</Form.Group>

									<Form.Group as={Col} md={6} controlId="formPhone">
										<Form.Label className="fw-semibold">Phone Number <span className="text-danger">*</span></Form.Label>
										<Controller
											name="phone"
											control={control}
											render={({ field }) => (
												<Form.Control
													type="tel"
													placeholder="e.g., 1234567890"
													{...field}
													isInvalid={!!errors.phone}
												/>
											)}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.phone?.message}
										</Form.Control.Feedback>
									</Form.Group>
								</Row>

								<Row className="mb-4">
									<Form.Group as={Col} md={6} controlId="formEmail">
										<Form.Label className="fw-semibold">Email Address (Optional)</Form.Label>
										<Controller
											name="email"
											control={control}
											render={({ field }) => (
												<Form.Control
													type="email"
													placeholder="e.g., jane.doe@example.com"
													{...field}
													value={field.value || ''}
													isInvalid={!!errors.email}
												/>
											)}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.email?.message}
										</Form.Control.Feedback>
									</Form.Group>

									<Form.Group as={Col} md={6} controlId="formOccupation">
										<Form.Label className="fw-semibold">Occupation (Optional)</Form.Label>
										<Controller
											name="occupation"
											control={control}
											render={({ field }) => (
												<Form.Control
													type="text"
													placeholder="e.g., Cardiologist, General Practitioner"
													{...field}
													value={field.value || ''}
													isInvalid={!!errors.occupation}
												/>
											)}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.occupation?.message}
										</Form.Control.Feedback>
									</Form.Group>
								</Row>
								
								<Row className="mb-4">
									<Form.Group as={Col} md={6} controlId="formLocation">
										<Form.Label className="fw-semibold">Primary Location (Optional)</Form.Label>
										<Controller
											name="location"
											control={control}
											render={({ field }) => (
												<Form.Control
													type="text"
													placeholder="e.g., City General Hospital - North Wing"
													{...field}
													value={field.value || ''}
													isInvalid={!!errors.location}
												/>
											)}
										/>
										<Form.Control.Feedback type="invalid">
											{errors.location?.message}
										</Form.Control.Feedback>
									</Form.Group>
                                    <Form.Group as={Col} md={6} controlId="formOrganization">
										<Form.Label className="fw-semibold">Affiliated Organization (Optional)</Form.Label>
										<Controller
											name="organization"
											control={control}
											render={({ field }) => (
												<Form.Select
													{...field}
													value={field.value || 0}
													isInvalid={!!errors.organization}
                                                    disabled={organizationList.length === 0 && !isLoadingData}
												>
													<option value={0}>Select Organization...</option>
													{organizationList.map((org) => (
														<option key={org.id} value={org.id}>
															{org.name}
														</option>
													))}
												</Form.Select>
											)}
										/>
                                        {organizationList.length === 0 && !isLoadingData && <Form.Text muted>No organizations available. Add one or contact support.</Form.Text>}
										<Form.Control.Feedback type="invalid">
											{errors.organization?.message}
										</Form.Control.Feedback>
									</Form.Group>
								</Row>

                                <Form.Group className="mb-4" controlId="formAddress">
									<Form.Label className="fw-semibold">Full Address (Optional)</Form.Label>
									<Controller
										name="address"
										control={control}
										render={({ field }) => (
											<Form.Control
												as="textarea"
												rows={3}
												placeholder="e.g., 123 Main Street, Anytown, ST 12345"
												{...field}
												value={field.value || ''}
												isInvalid={!!errors.address}
											/>
										)}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.address?.message}
									</Form.Control.Feedback>
								</Form.Group>

								<Row>
									<Col xs={12} className="d-flex justify-content-end align-items-center gap-2 mt-3 pt-3 border-top">
                                        <Button variant="outline-secondary" onClick={handleReset} disabled={isSubmitting || (!dirtyFields && !!clinicianId)} size="sm">
                                            Reset
                                        </Button>
										<Button type="submit" variant="primary" className="px-4" disabled={isSubmitting || isLoadingData} size="sm">
											{isSubmitting ? (
												<>
													<Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
													{clinicianId ? "Updating..." : "Saving..."}
												</>
											) : (
												clinicianId ? "Save Changes" : "Add Clinician"
											)}
										</Button>
									</Col>
								</Row>
							</fieldset>
						</Form>
					</div>
                    {clinicianId && (
                        <div className="card-footer text-muted small py-2">
                            Clinician ID: {clinicianId}
                        </div>
                    )}
				</div>
		</React.Fragment>
	);
}