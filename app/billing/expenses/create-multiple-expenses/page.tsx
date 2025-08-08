"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import { useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import Select, { SingleValue } from "react-select";
import styles from '../../../../styles/SmsTemplateList.module.css'

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

export default function CreateMultipleExpenses() {
	const [expenseForms, setExpenseForms] = useState<ExpenseForm[]>([{ ...defaultExpense }]);
	const [errors, setErrors] = useState<Partial<Record<number, Partial<Record<keyof ExpenseForm, string>>>>>({});
	const [isLoading, setLoading] = useState<boolean>(false);
	const [paymentModes, setPaymentModes] = useState<PaymentMode[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);

	// Shared invoice fields
	const [sharedInvoiceNumber, setSharedInvoiceNumber] = useState<string>("");
	const [sharedDescription, setSharedDescription] = useState<string>("");
	const [sharedErrors, setSharedErrors] = useState<{ invoiceNumber?: string; description?: string }>({});

	// Validation schema
	const validateForm = (formData: ExpenseForm): Partial<Record<keyof ExpenseForm, string>> => {
		const errors: Partial<Record<keyof ExpenseForm, string>> = {};

		if (!formData.name.trim()) errors.name = "Expense name is required";
		if (!formData.date) errors.date = "Date is required";
		if (!formData.merchant.trim()) errors.merchant = "Merchant name is required";
		if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
		if (!formData.category) errors.category = "Category is required";
		if (!formData.mode) errors.mode = "Payment mode is required";

		return errors;
	};

	// Validate shared fields
	const validateSharedFields = () => {
		const errors: { invoiceNumber?: string; description?: string } = {};
		if (!sharedDescription.trim()) errors.description = "Description is required";
		return errors;
	};

	const { user, branchid } = useApplicationSettings().applicationsettings;
	const employeeid = user?.employeeid;
	const searchParams = useSearchParams();
	const method = searchParams?.get("action");
	const editid = searchParams?.get("id");

	// Input change handler for multiple forms
	const handleInputChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setExpenseForms((prev) => prev.map((form, i) => i === index ? { ...form, [name]: name === "amount" ? Number(value) : name === "date" ? value : value } : form));
		setErrors((prev) => ({ ...prev, [index]: { ...prev[index], [name]: undefined } }));
	}, []);

	// Select change handler for multiple forms
	const handleSelectChange = useCallback((index: number, name: keyof ExpenseForm) => (option: SingleValue<SelectOption>) => {
		const value = name === "category" ? Number(option?.value || 0) : option?.value || "";
		setExpenseForms((prev) => prev.map((form, i) => i === index ? { ...form, [name]: value } : form));
		setErrors((prev) => ({ ...prev, [index]: { ...prev[index], [name]: undefined } }));
	}, []);

	// Add new expense form
	const handleAddExpense = () => {
		setExpenseForms((prev) => [...prev, { ...defaultExpense }]);
	};

	// Remove expense form
	const handleRemoveExpense = (index: number) => {
		setExpenseForms((prev) => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev);
		setErrors((prev) => {
			const newErrors = { ...prev };
			delete newErrors[index];
			return newErrors;
		});
	};

	// Form submission handler for multiple expenses
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		let hasError = false;
		const allErrors: typeof errors = {};

		// Validate individual expense forms
		expenseForms.forEach((form, idx) => {
			const formErrors = validateForm(form);
			if (Object.keys(formErrors).length > 0) hasError = true;
			allErrors[idx] = formErrors;
		});

		// Validate shared fields
		const sharedFieldErrors = validateSharedFields();
		if (Object.keys(sharedFieldErrors).length > 0) {
			hasError = true;
			setSharedErrors(sharedFieldErrors);
		}

		setErrors(allErrors);
		if (hasError) {
			toast.error("Please fix form errors before submitting", { autoClose: 3000 });
			return;
		}
		setLoading(true);
		try {
			// Submit all expenses in parallel with shared invoice data
			const responses = await Promise.all(expenseForms.map(async (form) => {
				const submitData = {
					...form,
					branchid,
					employeeid,
					categoryid: form.category,
					invoiceNumber: sharedInvoiceNumber,
					description: sharedDescription,
				};
				const httpMethod = method && editid ? "PUT" : "POST";
				return customPost(
					`expenses?branchid=${branchid}&employeeid=${employeeid}&&expenseid=${parseInt((submitData?.id ?? '').toString())}`,
					httpMethod,
					submitData
				);
			}));
			const allSuccess = responses.every((response) => response && response.status && typeof response.status == 'boolean' && response.status);
			if (allSuccess) {
				toast.success("All expenses submitted successfully awaiting approval", { autoClose: 2000 });
				setExpenseForms([{ ...defaultExpense }]);
				setSharedInvoiceNumber("");
				setSharedDescription("");
			} else {
				throw new Error("Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit expenses. Please try again.", { autoClose: 5000 });
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

	// Calculate total amount
	const totalAmount = expenseForms.reduce((sum, form) => sum + (form.amount || 0), 0);
	const totalTax = expenseForms.reduce((sum, form) => sum + (parseFloat(form.taxAmount) || 0), 0);

	return (
		<div className="card p-0">
			<div className="card-header d-flex justify-content-between align-items-center mb-4">
				<div className="mb-0">Create Multiple Expenses</div>
				<small className="text-muted">All fields marked with * are required</small>
			</div>
			<div className="card-body">
				{isLoading && <Loader />}
				<form onSubmit={handleSubmit} noValidate>
					<div className="d-flex justify-content-between align-items-center mb-3">
						<h6 className="mb-0 text-secondary">Expense Line Items</h6>
						<button type="button" className="btn btn-success btn-sm" onClick={handleAddExpense} disabled={isLoading}>
							+ Add Row
						</button>
					</div>
					<div className="table-responsive">
						<table className={styles.table} >
							<thead >
								<tr>
									<th style={{ width: "5%" }}>#</th>
									<th style={{ width: "18%" }}>Expense Name *</th>
									<th style={{ width: "15%" }}>Date *</th>
									<th style={{ width: "15%" }}>Merchant *</th>
									<th style={{ width: "12%" }}>Amount (GHC) *</th>
									<th style={{ width: "15%" }}>Category *</th>
									<th style={{ width: "15%" }}>Payment Method *</th>
									<th style={{ width: "10%" }}>Tax (GHC)</th>
									<th style={{ width: "5%" }}>Action</th>
								</tr>
							</thead>
							<tbody>
								{expenseForms.map((formData, idx) => (
									<tr key={idx} className={errors[idx] && Object.keys(errors[idx] || {}).length > 0 ? "table-danger" : ""}>
										<td className="text-center fw-bold">{idx + 1}</td>
										<td>
											<input
												name="name"
												value={formData.name}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.name ? "is-invalid" : ""}`}
												type="text"
												placeholder="Expense name"
												disabled={isLoading}
											/>
											{errors[idx]?.name && <div className="invalid-feedback">{errors[idx]?.name}</div>}
										</td>
										<td>
											<input
												name="date"
												value={formatDateForInput(formData.date)}
												onChange={(e) => handleInputChange(idx, e)}
												type="datetime-local"
												className={`form-control form-control-sm ${errors[idx]?.date ? "is-invalid" : ""}`}
												disabled={isLoading}
											/>
											{errors[idx]?.date && <div className="invalid-feedback">{errors[idx]?.date}</div>}
										</td>
										<td>
											<input
												name="merchant"
												value={formData.merchant}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.merchant ? "is-invalid" : ""}`}
												type="text"
												placeholder="Merchant"
												disabled={isLoading}
											/>
											{errors[idx]?.merchant && <div className="invalid-feedback">{errors[idx]?.merchant}</div>}
										</td>
										<td>
											<input
												name="amount"
												value={formData.amount || ""}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.amount ? "is-invalid" : ""}`}
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												disabled={isLoading}
											/>
											{errors[idx]?.amount && <div className="invalid-feedback">{errors[idx]?.amount}</div>}
										</td>
										<td>
											<Select
												options={categories.map((item) => ({
													value: item.id,
													label: item.category,
												}))}
												styles={{
													...reactSelectCustomStyles,
													control: (base) => ({
														...base,
														minHeight: '31px',
														fontSize: '0.875rem'
													})
												}}
												placeholder="Category"
												classNamePrefix="react-select"
												isClearable
												onChange={handleSelectChange(idx, "category")}
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
											{errors[idx]?.category && <div className="invalid-feedback d-block">{errors[idx]?.category}</div>}
										</td>
										<td>
											<Select
												options={paymentModes.map((item) => ({
													value: item.KeyID,
													label: item.PaymentMode,
												}))}
												styles={{
													...reactSelectCustomStyles,
													control: (base) => ({
														...base,
														minHeight: '31px',
														fontSize: '0.875rem'
													})
												}}
												placeholder="Payment"
												classNamePrefix="react-select"
												isClearable
												onChange={handleSelectChange(idx, "mode")}
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
											{errors[idx]?.mode && <div className="invalid-feedback d-block">{errors[idx]?.mode}</div>}
										</td>
										<td>
											<input
												name="taxAmount"
												value={formData.taxAmount}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.taxAmount ? "is-invalid" : ""}`}
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												disabled={isLoading}
											/>
											{errors[idx]?.taxAmount && <div className="invalid-feedback">{errors[idx]?.taxAmount}</div>}
										</td>
										<td className="text-center">
											<button
												type="button"
												className="btn btn-danger btn-sm"
												onClick={() => handleRemoveExpense(idx)}
												disabled={isLoading || expenseForms.length === 1}
												title="Remove this expense"
											>
												×
											</button>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot className="table-light">
								<tr>
									<td colSpan={4} className="text-end fw-bold">Subtotal:</td>
									<td className="fw-bold text-primary">GHC {totalAmount.toFixed(2)}</td>
									<td colSpan={2}></td>
									<td className="fw-bold text-secondary">GHC {totalTax.toFixed(2)}</td>
									<td></td>
								</tr>
								<tr>
									<td colSpan={4} className="text-end fw-bold fs-5">Total Amount:</td>
									<td className="fw-bold text-success fs-5">GHC {(totalAmount + totalTax).toFixed(2)}</td>
									<td colSpan={4}></td>
								</tr>
							</tfoot>
						</table>
					</div>

					{/* Shared Invoice Fields */}
					<div className="row g-3 mt-3 p-3 border rounded bg-light">
						<div className="col-12">
							<h6 className="mb-3 text-primary">Invoice Information</h6>
						</div>
						<div className="col-md-6">
							<label className="form-label pls-label">Invoice Number</label>
							<input
								name="sharedInvoiceNumber"
								value={sharedInvoiceNumber}
								onChange={(e) => {
									setSharedInvoiceNumber(e.target.value);
									setSharedErrors(prev => ({ ...prev, invoiceNumber: undefined }));
								}}
								className={`form-control ${sharedErrors.invoiceNumber ? "is-invalid" : ""}`}
								type="text"
								placeholder="Enter invoice number"
								disabled={isLoading}
							/>
							{sharedErrors.invoiceNumber && <div className="invalid-feedback">{sharedErrors.invoiceNumber}</div>}
						</div>
						<div className="col-md-6"></div>
						<div className="col-12">
							<label className="form-label pls-label">
								Description <span className="text-danger">*</span>
							</label>
							<textarea
								name="sharedDescription"
								value={sharedDescription}
								onChange={(e) => {
									setSharedDescription(e.target.value);
									setSharedErrors(prev => ({ ...prev, description: undefined }));
								}}
								className={`form-control ${sharedErrors.description ? "is-invalid" : ""}`}
								rows={4}
								placeholder="Enter description for all expense items"
								disabled={isLoading}
							/>
							{sharedErrors.description && <div className="invalid-feedback">{sharedErrors.description}</div>}
						</div>
					</div>

					<div className="d-flex justify-content-between align-items-center mt-3">
						<button type="button" className="btn btn-outline-primary" onClick={handleAddExpense} disabled={isLoading}>
							Add New Line Item
						</button>

						<div>
							<button
								type="submit"
								className="btn btn-primary me-2"
								disabled={isLoading}
							>
								{isLoading ? (
									<>
										<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
										Submitting...
									</>
								) : (
									`Submit Expense Request (${expenseForms.length} items)`
								)}
							</button>
							<button
								type="button"
								className="btn btn-secondary"
								onClick={() => {
									setExpenseForms([{ ...defaultExpense }]);
									setSharedInvoiceNumber("");
									setSharedDescription("");
									setSharedErrors({});
								}}
								disabled={isLoading}
							>
								Reset All
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
}
