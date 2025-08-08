"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import { useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import Select, { SingleValue } from "react-select";

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

	// Validation schema
	const validateForm = (formData: ExpenseForm): Partial<Record<keyof ExpenseForm, string>> => {
		const errors: Partial<Record<keyof ExpenseForm, string>> = {};

		if (!formData.name.trim()) errors.name = "Expense name is required";
		if (!formData.date) errors.date = "Date is required";
		if (!formData.merchant.trim()) errors.merchant = "Merchant name is required";
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
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

			if (response && response.status && typeof response.status == 'boolean' && response.status) {
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

	// Fetch categories
	useEffect(() => {
		setLoading(true);
		customFetch(`expense/get/category?&branchid=${branchid}&employeeid=${employeeid}`)
			.then((data: Category[]) => {
				if (Array.isArray(data)) {
					setCategories(data);
				}
			})
			.catch(() => toast.error("Failed to load categories", { autoClose: 3000 }))
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
		<div className="card p-0">
			<div className="card-header d-flex justify-content-between align-items-center mb-4">
				<div className="mb-0">Add New Expense</div>
				<small className="text-muted">All fields marked with * are required</small>
			</div>
			<div className="card-body">
				{isLoading && <Loader />}
				<form onSubmit={handleSubmit} noValidate>
					<div className="row g-3">
						<div className="col-md-6">
							<label className="form-label pls-label">
								Expense Name <span className="text-danger">*</span>
							</label>
							<input
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className={`form-control ${errors.name ? "is-invalid" : ""}`}
								type="text"
								placeholder="Enter expense name"
								disabled={isLoading}
							/>
							{errors.name && <div className="invalid-feedback">{errors.name}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">
								Date <span className="text-danger">*</span>
							</label>
							<input
								name="date"
								value={formatDateForInput(formData.date)}
								onChange={handleInputChange}
								type="datetime-local"
								className={`form-control ${errors.date ? "is-invalid" : ""}`}
								disabled={isLoading}
							/>
							{errors.date && <div className="invalid-feedback">{errors.date}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">
								Merchant <span className="text-danger">*</span>
							</label>
							<input
								name="merchant"
								value={formData.merchant}
								onChange={handleInputChange}
								className={`form-control ${errors.merchant ? "is-invalid" : ""}`}
								type="text"
								placeholder="Enter merchant name"
								disabled={isLoading}
							/>
							{errors.merchant && <div className="invalid-feedback">{errors.merchant}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">
								Amount (GHC) <span className="text-danger">*</span>
							</label>
							<input
								name="amount"
								value={formData.amount || ""}
								onChange={handleInputChange}
								className={`form-control ${errors.amount ? "is-invalid" : ""}`}
								type="number"
								step="0.01"
								min="0"
								placeholder="0.00"
								disabled={isLoading}
							/>
							{errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">
								Category <span className="text-danger">*</span>
							</label>
							<Select
								options={categories.map((item) => ({
									value: item.id,
									label: item.category,
								}))}
								styles={reactSelectCustomStyles}
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
							{errors.category && <div className="invalid-feedback d-block">{errors.category}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">
								Payment Method <span className="text-danger">*</span>
							</label>
							<Select
								options={paymentModes.map((item) => ({
									value: item.KeyID,
									label: item.PaymentMode,
								}))}
								styles={reactSelectCustomStyles}
								placeholder="Select payment method"
								classNamePrefix="react-select"
								isClearable
								onChange={handleSelectChange("mode")}
								value={
									paymentModes
										.map((item) => ({
											value: item.KeyID,
											label: item.PaymentMode,
										}))
										.find((option) => option.value === formData.mode) || null
								}
								isDisabled={isLoading}
							/>
							{errors.mode && <div className="invalid-feedback d-block">{errors.mode}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">Tax Amount (GHC)</label>
							<input
								name="taxAmount"
								value={formData.taxAmount}
								onChange={handleInputChange}
								className={`form-control ${errors.taxAmount ? "is-invalid" : ""}`}
								type="number"
								step="0.01"
								min="0"
								placeholder="0.00"
								disabled={isLoading}
							/>
							{errors.taxAmount && <div className="invalid-feedback">{errors.taxAmount}</div>}
						</div>

						<div className="col-md-6">
							<label className="form-label pls-label">Invoice Number</label>
							<input
								name="invoiceNumber"
								value={formData.invoiceNumber}
								onChange={handleInputChange}
								className={`form-control ${errors.invoiceNumber ? "is-invalid" : ""}`}
								type="text"
								placeholder="Enter invoice number"
								disabled={isLoading}
							/>
							{errors.invoiceNumber && <div className="invalid-feedback">{errors.invoiceNumber}</div>}
						</div>

						<div className="col-12">
							<label className="form-label pls-label">
								Description <span className="text-danger">*</span>
							</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleInputChange}
								className={`form-control ${errors.description ? "is-invalid" : ""}`}
								rows={4}
								placeholder="Enter description"
								disabled={isLoading}
							/>
							{errors.description && <div className="invalid-feedback">{errors.description}</div>}
						</div>
					</div>

					<div className="d-flex justify-content-end mt-4 gap-2">
						<button
							type="submit"
							className="btn btn-primary"
							disabled={isLoading}
						>
							{isLoading ? (
								<>
									<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
									Submitting...
								</>
							) : (
								"Submit Expense Request"
							)}
						</button>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => setFormData({ ...defaultExpense })}
							disabled={isLoading}
						>
							Reset Form
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}