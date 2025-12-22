"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import { useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import Select, { SingleValue } from "react-select";
import { RiReceiptLine } from '@remixicon/react';

interface ExpenseForm {
	name: string;
	date: string;
	merchant: string;
	amount: number;
	category: number;
	mode: string;
	description: string;
	receipt: FileList | null;
	invoiceNumber: string;
	taxAmount: string;
	id?: number | null | undefined;
}

interface PaymentMode {
	KeyID: string;
	PaymentMode: string;
}

interface Category {
	category: string;
	id: number;
}

interface SelectOption {
	value: number | string;
	label: string;
}

// Default form state
const defaultExpense: ExpenseForm = {
	name: "",
	date: "",
	merchant: "",
	amount: 0,
	category: 0,
	mode: "",
	description: "",
	receipt: null,
	invoiceNumber: "",
	taxAmount: "",
};

interface Merchant {
	id: number;
	name: string;
	email: string;
	phone: string;
	address: string;
	website: string;
	notes: string;
	created_at: string;
	updated_at: string;
	created_by: number;
	updated_by: number | null;
	created_by_name: string;
}

// Format date for input
const formatDateForInput = (dateString: string): string => {
	if (!dateString) return "";
	const date = new Date(dateString);
	return isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
};

export default function AddNewExpense() {
	const [formData, setFormData] = useState<ExpenseForm>({ ...defaultExpense });
	const [errors, setErrors] = useState<Partial<Record<keyof ExpenseForm, string>>>({});
	const [isLoading, setLoading] = useState<boolean>(false);
	const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [merchants, setMerchants] = useState<Merchant[]>([]);

	// Validation schema
	const validateForm = (formData: ExpenseForm): Partial<Record<keyof ExpenseForm, string>> => {
		const errors: Partial<Record<keyof ExpenseForm, string>> = {};

		if (!formData.name.trim()) errors.name = "Expense name is required";
		if (!formData.date) errors.date = "Date is required";
		if (!formData.merchant || isNaN(Number(formData.merchant))) errors.merchant = "Merchant is required";
		if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
		if (!formData.category) errors.category = "Category is required";
		if (!formData.mode) errors.mode = "Payment mode is required";
		if (!formData.description.trim()) errors.description = "Description is required";

		return errors;
	};

	const { user, branchid } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const searchParams = useSearchParams();
	const method = searchParams?.get("action");
	const editid = searchParams?.get("id");

	// Input change handler
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: name === "amount" ? Number(value) : value
		}));
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	// Select change handler
	const handleSelectChange = (name: keyof ExpenseForm) => (option: SingleValue<SelectOption>) => {
		const value = name === "category" ? Number(option?.value || 0) : option?.value || "";
		setFormData(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: undefined }));
	};

	// Form submission handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const formErrors = validateForm(formData);
		if (Object.keys(formErrors).length > 0) {
			setErrors(formErrors);
			toast.error("Please fix form errors before submitting", { autoClose: 3000 });
			return;
		}

		setLoading(true);
		try {
			const submitData = {
				...formData,
				branchid,
				employeeid,
				categoryid: formData.category,
			};

			const httpMethod = method && editid ? "PUT" : "POST";
			const response = await customPost(
				`expenses?branchid=${branchid}&employeeid=${employeeid}&&expenseid=${parseInt((submitData?.id ?? '').toString())}`,
				httpMethod,
				submitData
			);

			if (response && response.status && typeof response.status === 'number') {
				toast.success("Expense submitted successfully awaiting approval", { autoClose: 2000 });
				setFormData({ ...defaultExpense });
			} else {
				throw new Error("Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit expense. Please try again.", { autoClose: 5000 });
		} finally {
			setLoading(false);
		}
	};


	// Fetch categories and merchants in parallel
	useEffect(() => {
		if (!branchid || !employeeid) return;
		setLoading(true);
		Promise.all([
			customFetch(`expense/get/category?&branchid=${branchid}&employeeid=${employeeid}`),
			customFetch(`expense/merchants?branchid=${branchid}&employeeid=${employeeid}&tenantId=3`)
		])
			.then(([categoriesData, merchantsData]) => {
				if (Array.isArray(categoriesData)) {
					setCategories(categoriesData);
				}
				if (Array.isArray(merchantsData)) {
					setMerchants(merchantsData);
				}
			})
			.catch(() => {
				toast.error("Failed to load categories or merchants", { autoClose: 3000 });
			})
			.finally(() => setLoading(false));
	}, [branchid, employeeid]);

	// Fetch payment modes
	useEffect(() => {
		setLoading(true);
		customFetch("paymentmodes")
			.then((response) => {
				if (response?.data) {
					setPaymentModes(response.data);
				}
			})
			.catch(() => toast.error("Failed to load payment modes", { autoClose: 3000 }))
			.finally(() => setLoading(false));
	}, []);

	return (
		<div className="container-fluid py-4">
			<div className="row">
				<div className="col-12 col-xl-10 col-xxl-8">
					<div className="card border-1 bg-body-tertiary">
						<div className="card-header border-bottom-0 py-3 bg-body-tertiary">
							<div className="d-flex align-items-center justify-content-between">
								<div className="d-flex align-items-center">
									<RiReceiptLine className="me-2 text-primary" size={24} />
									<h5 className="mb-0 fw-semibold">Create New Expense</h5>
								</div>
								<small className="text-muted" style={{ fontSize: '0.75rem' }}>
									<span className="text-danger">*</span> Required fields
								</small>
							</div>
						</div>
						<div className="card-body p-4">
							{isLoading && <Loader />}
							<form onSubmit={handleSubmit} noValidate>
								<div className="row g-3">
									<div className="col-12">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Expense Name <span className="text-danger">*</span>
										</label>
										<input
											name="name"
											value={formData.name}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.name ? "is-invalid" : ""}`}
											type="text"
											placeholder="Enter expense name"
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										/>
										{errors.name && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.name}</div>}
									</div>

									<div className="col-12">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Date & Time <span className="text-danger">*</span>
										</label>
										<input
											name="date"
											value={formatDateForInput(formData.date)}
											onChange={handleInputChange}
											type="datetime-local"
											className={`form-control form-control-sm ${errors.date ? "is-invalid" : ""}`}
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										/>
										{errors.date && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.date}</div>}
									</div>

									<div className="col-md-6">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Merchant <span className="text-danger">*</span>
										</label>
										<Select
											options={merchants.map((merchant) => ({
												value: merchant.id,
												label: merchant.name,
											}))}
											styles={{
												...reactSelectCustomStyles,
												control: (provided, state) => ({
													...provided,
													minHeight: '31px',
													fontSize: '0.8rem',
													borderRadius: '6px',
												}),
												valueContainer: (provided) => ({
													...provided,
													padding: '0 8px',
												}),
												indicatorSeparator: () => ({ display: 'none' }),
											}}
											placeholder="Select merchant"
											classNamePrefix="react-select"
											isClearable
											onChange={handleSelectChange("merchant")}
											value={
												formData.merchant
													? merchants
														.map((merchant) => ({
															value: merchant.id,
															label: merchant.name,
														}))
														.find((option) => option.value === Number(formData.merchant)) || null
													: null
											}
											isDisabled={isLoading}
										/>
										{errors.merchant && <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>{errors.merchant}</div>}
									</div>

									<div className="col-md-6">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Category <span className="text-danger">*</span>
										</label>
										<Select
											options={categories.map((item) => ({
												value: item.id,
												label: item.category,
											}))}
											styles={{
												...reactSelectCustomStyles,
												control: (provided, state) => ({
													...provided,
													minHeight: '31px',
													fontSize: '0.8rem',
													borderRadius: '6px',
												}),
												valueContainer: (provided) => ({
													...provided,
													padding: '0 8px',
												}),
												indicatorSeparator: () => ({ display: 'none' }),
											}}
											placeholder="Select category"
											classNamePrefix="react-select"
											isClearable
											onChange={handleSelectChange("category")}
											value={
												formData.category
													? categories
														.map((item) => ({
															value: item.id,
															label: item.category,
														}))
														.find((option) => option.value === formData.category) || null
													: null
											}
											isDisabled={isLoading}
										/>
										{errors.category && <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>{errors.category}</div>}
									</div>

									<div className="col-md-4">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Amount (GHC) <span className="text-danger">*</span>
										</label>
										<input
											name="amount"
											value={formData.amount || ""}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.amount ? "is-invalid" : ""}`}
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										/>
										{errors.amount && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.amount}</div>}
									</div>

									<div className="col-md-4">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Payment Method <span className="text-danger">*</span>
										</label>
										<select
											name="mode"
											value={formData.mode}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.mode ? "is-invalid" : ""}`}
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										>
											<option value="">Select payment method</option>
											{paymentModes.map((item) => (
												<option key={item.KeyID} value={item.KeyID}>
													{item.PaymentMode}
												</option>
											))}
										</select>
										{errors.mode && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.mode}</div>}
									</div>

									<div className="col-md-4">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Tax Amount (GHC)
										</label>
										<input
											name="taxAmount"
											value={formData.taxAmount}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.taxAmount ? "is-invalid" : ""}`}
											type="number"
											step="0.01"
											min="0"
											placeholder="0.00"
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										/>
										{errors.taxAmount && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.taxAmount}</div>}
									</div>

									<div className="col-12">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Invoice Number
										</label>
										<input
											name="invoiceNumber"
											value={formData.invoiceNumber}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.invoiceNumber ? "is-invalid" : ""}`}
											type="text"
											placeholder="Enter invoice number"
											disabled={isLoading}
											style={{ fontSize: '0.8rem' }}
										/>
										{errors.invoiceNumber && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.invoiceNumber}</div>}
									</div>

									<div className="col-12">
										<label className="form-label mb-1" style={{ fontSize: '0.75rem', fontWeight: '500' }}>
											Description <span className="text-danger">*</span>
										</label>
										<textarea
											name="description"
											value={formData.description}
											onChange={handleInputChange}
											className={`form-control form-control-sm ${errors.description ? "is-invalid" : ""}`}
											rows={3}
											placeholder="Enter detailed description of the expense"
											disabled={isLoading}
											style={{ fontSize: '0.8rem', resize: 'vertical' }}
										/>
										{errors.description && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.description}</div>}
									</div>
								</div>

								<div className="d-flex justify-content-end mt-4 gap-2">
									<button
										type="button"
										className="btn btn-outline-secondary btn-sm"
										onClick={() => setFormData({ ...defaultExpense })}
										disabled={isLoading}
										style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
									>
										Reset Form
									</button>
									<button
										type="submit"
										className="btn btn-primary btn-sm d-flex align-items-center"
										disabled={isLoading}
										style={{ fontSize: '0.8rem', padding: '0.375rem 0.75rem' }}
									>
										{isLoading ? (
											<>
												<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
												Submitting...
											</>
										) : (
											<>
												<RiReceiptLine className="me-1" size={14} />
												Submit Expense
											</>
										)}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}