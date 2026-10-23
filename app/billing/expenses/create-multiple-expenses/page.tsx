"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { customFetch, customPost, smallSelectStyles } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import { useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import Select, { SingleValue } from "react-select";
import Link from "next/link";
import styles from './MultipleExpenses.module.css';

interface ExpenseForm {
	name: string;
	date: string;
	merchant: string | number;
	amount: number;
	category: number;
	description: string;
	receipt: FileList | null;
	invoiceNumber: string;
	taxAmount: string;
	id?: number | null | undefined;
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

// Custom styles for small Select components


export default function CreateMultipleExpenses() {
	const [expenseForms, setExpenseForms] = useState<ExpenseForm[]>([{ ...defaultExpense }]);
	const [errors, setErrors] = useState<Partial<Record<number, Partial<Record<keyof ExpenseForm, string>>>>>({});
	const [isLoading, setLoading] = useState<boolean>(false);
	const [isSubmitting, setSubmitting] = useState(false);
	const [feedback, setFeedback] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
	const isBusy = isLoading || isSubmitting;
	const [categories, setCategories] = useState<Category[]>([]);
	interface Merchant {
		id: number;
		name: string;
	}
	const [merchants, setMerchants] = useState<Merchant[]>([]);

	// Shared invoice fields
	const [sharedInvoiceNumber, setSharedInvoiceNumber] = useState<string>("");
	const [sharedDescription, setSharedDescription] = useState<string>("");
	const [sharedDate, setSharedDate] = useState<string>("");
	const [sharedErrors, setSharedErrors] = useState<{ invoiceNumber?: string; description?: string; date?: string }>({});

	// Validation schema
	const validateForm = (formData: ExpenseForm): Partial<Record<keyof ExpenseForm, string>> => {
		const errors: Partial<Record<keyof ExpenseForm, string>> = {};

		if (!formData.name.trim()) errors.name = "Expense name is required";
		if (!formData.merchant || isNaN(Number(formData.merchant))) errors.merchant = "Merchant is required";
		if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
		if (!formData.category) errors.category = "Category is required";

		return errors;
	};

	// Validate shared fields
	const validateSharedFields = () => {
		const errors: { invoiceNumber?: string; description?: string; date?: string } = {};
		if (!sharedDescription.trim()) errors.description = "Description is required";
		if (!sharedDate) errors.date = "Date is required";
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
			const newErrors: typeof prev = {};
			Object.entries(prev).forEach(([key, value]) => {
				const row = Number(key);
				if (row !== index) newErrors[row > index ? row - 1 : row] = value;
			});
			return newErrors;
		});
	};

	// Form submission handler for multiple expenses
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isBusy) return;
		setFeedback(null);
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
		setSharedErrors(sharedFieldErrors);
		if (Object.keys(sharedFieldErrors).length > 0) {
			hasError = true;
			setSharedErrors(sharedFieldErrors);
		}

		setErrors(allErrors);
		if (hasError) {
			setFeedback({ type: 'danger', message: 'Review the highlighted fields. Every expense needs a name, merchant, category and amount.' });
			toast.error("Please fix form errors before submitting", { autoClose: 3000 });
			return;
		}
		setSubmitting(true);
		try {
			// Prepare bulk expense data
			const expenses = expenseForms.map((form) => ({
				name: form.name,
				amount: form.amount,
				employeeid,
				branchid,
				description: sharedDescription,
				merchant: Number(form.merchant),
				category: form.category,
				date: sharedDate
			}));

			// Submit all expenses in a single bulk request
			const response = await customPost(
				`expenses?employeeid=${employeeid}&branchid=${branchid}`,
				"POST",
				expenses
			);

			if (response && response.success && response.success.length > 0) {
				setFeedback({ type: 'success', message: `${response.success.length} expenses submitted for approval. Group: ${response.groupId || 'Created'}.` });
				toast.success(`${response.success.length} expenses submitted successfully awaiting approval. Group ID: ${response.groupId}`, { autoClose: 2000 });
				setExpenseForms([{ ...defaultExpense }]);
				setSharedInvoiceNumber("");
				setSharedDescription("");
				setSharedDate("");
			} else {
				throw new Error("Submission failed");
			}
		} catch (error) {
			setFeedback({ type: 'danger', message: 'The expense request could not be submitted. Your entries are still here; please try again.' });
			toast.error("Failed to submit expenses. Please try again.", { autoClose: 5000 });
		} finally {
			setSubmitting(false);
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
				setFeedback({ type: 'danger', message: 'Categories or merchants could not be loaded. Reload this page before submitting your expenses.' });
				toast.error("Failed to load categories or merchants", { autoClose: 3000 });
			})
			.finally(() => setLoading(false));
	}, [branchid, employeeid]);

	// Calculate total amount
	const totalAmount = expenseForms.reduce((sum, form) => sum + (form.amount || 0), 0);
	const totalTax = expenseForms.reduce((sum, form) => sum + (parseFloat(form.taxAmount) || 0), 0);

	return (
		<main className={styles.workspace}>
			<Link href="/billing/expenses" className={styles.back}>← Expenses</Link>
			<header className={styles.header}>
				<div><span className={styles.eyebrow}>EXPENSE REQUEST</span><h1>Create multiple expenses</h1><p>Add your line items, review the total, and submit them together for approval.</p></div>
				<div className={styles.headerTotal}><span>{expenseForms.length} expense {expenseForms.length === 1 ? 'item' : 'items'}</span><strong>GHC {(totalAmount + totalTax).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong><small>Total request amount</small></div>
			</header>
			{feedback && <div className={`alert alert-${feedback.type}`} role={feedback.type === 'danger' ? 'alert' : 'status'}>{feedback.message}{feedback.type === 'success' && <Link href="/billing/expenses" className="d-block mt-2">View expenses →</Link>}</div>}
			<div>
				{isLoading && <Loader />}
				<form onSubmit={handleSubmit} noValidate className={styles.form} aria-busy={isBusy}>
					<div className={styles.sectionHeading}><div><h2>1. Shared details</h2><p>The date and description apply to every item in this request.</p></div><span>* Required</span></div>
					<div className={styles.sharedBar}>
						<div className={styles.sharedFields}>
							<div>
								<label htmlFor="expense-invoice-number" className="form-label pls-label small me-2">Invoice number <span className="text-muted fw-normal">(optional)</span></label>
								<input
									name="sharedInvoiceNumber"
									id="expense-invoice-number"
									value={sharedInvoiceNumber}
									onChange={(e) => {
										setSharedInvoiceNumber(e.target.value);
										setSharedErrors(prev => ({ ...prev, invoiceNumber: undefined }));
									}}
									className={`form-control form-control-sm ${sharedErrors.invoiceNumber ? "is-invalid" : ""}`}
									type="text"
									placeholder="Enter invoice number"
									disabled={isBusy}
								/>
								{sharedErrors.invoiceNumber && <div className="invalid-feedback">{sharedErrors.invoiceNumber}</div>}
							</div>
							<div>
								<label htmlFor="expense-date" className="form-label pls-label small me-2">Expense date <span className="text-danger">*</span></label>
								<input
									name="sharedDate"
									id="expense-date"
									value={formatDateForInput(sharedDate)}
									onChange={(e) => {
										setSharedDate(e.target.value);
										setSharedErrors(prev => ({ ...prev, date: undefined }));
									}}
									type="datetime-local"
									className={`form-control form-control-sm ${sharedErrors.date ? "is-invalid" : ""}`}
									disabled={isBusy}
								/>
								{sharedErrors.date && <div className="invalid-feedback">{sharedErrors.date}</div>}
							</div>
						</div>
						<button type="button" className="btn btn-success btn-sm" onClick={handleAddExpense} disabled={isBusy}>
							+ Add Row
						</button>
					</div>
					<div className={styles.sectionHeading}><div><h2>2. Expense items</h2><p>Use a separate row for each expense. Amounts are in Ghana cedis.</p></div></div>
					<div className={styles.tableWrap}>
						<table className={styles.table} >
							<thead >
								<tr>
									<th style={{ width: "5%" }}>#</th>
									<th style={{ width: "20%" }}>Expense Name *</th>
									<th style={{ width: "18%" }}>Merchant *</th>
									<th style={{ width: "15%" }}>Amount (GHC) *</th>
									<th style={{ width: "18%" }}>Category *</th>
									<th style={{ width: "12%" }}>Tax (GHC)</th>
									<th style={{ width: "5%" }}>Action</th>
								</tr>
							</thead>
							<tbody>
								{expenseForms.map((formData, idx) => (
									<tr key={idx} className={Object.values(errors[idx] || {}).some(Boolean) ? "table-danger" : ""}>
										<td className="text-center fw-bold">{idx + 1}</td>
										<td>
											<input
												name="name"
												aria-label={`Expense ${idx + 1} name`}
												value={formData.name}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.name ? "is-invalid" : ""}`}
												type="text"
												placeholder="Expense name"
												disabled={isBusy}
											/>
											{errors[idx]?.name && <div className="invalid-feedback">{errors[idx]?.name}</div>}
										</td>
										<td>
											<Select
												aria-label={`Expense ${idx + 1} merchant`}
												options={merchants.map((merchant) => ({
													value: merchant.id,
													label: merchant.name,
												}))}
												styles={smallSelectStyles}
												menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
												menuPosition="fixed"
												placeholder="Merchant"
												classNamePrefix="react-select"
												isClearable
												onChange={handleSelectChange(idx, "merchant")}
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
												isDisabled={isBusy}
											/>
											{errors[idx]?.merchant && <div className="invalid-feedback d-block">{errors[idx]?.merchant}</div>}
										</td>
										<td>
											<input
												name="amount"
												aria-label={`Expense ${idx + 1} amount in Ghana cedis`}
												value={formData.amount || ""}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.amount ? "is-invalid" : ""}`}
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												disabled={isBusy}
											/>
											{errors[idx]?.amount && <div className="invalid-feedback">{errors[idx]?.amount}</div>}
										</td>
										<td>
											<Select
												options={categories.map((item) => ({
													value: item.id,
													label: item.category,
												}))}
												styles={smallSelectStyles}
												menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
												menuPosition="fixed"
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
												isDisabled={isBusy}
											/>
											{errors[idx]?.category && <div className="invalid-feedback d-block">{errors[idx]?.category}</div>}
										</td>
										<td>
											<input
												name="taxAmount"
												aria-label={`Expense ${idx + 1} tax in Ghana cedis`}
												value={formData.taxAmount}
												onChange={(e) => handleInputChange(idx, e)}
												className={`form-control form-control-sm ${errors[idx]?.taxAmount ? "is-invalid" : ""}`}
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												disabled={isBusy}
											/>
											{errors[idx]?.taxAmount && <div className="invalid-feedback">{errors[idx]?.taxAmount}</div>}
										</td>
										<td className="text-center">
											<button
												type="button"
												className="btn btn-danger btn-sm"
												onClick={() => handleRemoveExpense(idx)}
												disabled={isBusy || expenseForms.length === 1}
												title="Remove this expense"
												aria-label={`Remove expense ${idx + 1}`}
											>
												×
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* Shared Invoice Fields */}
					<div className={styles.summary}>
						<div className="col-12">
							<h2 className={styles.summaryTitle}>3. Review your request</h2>
						</div>
						<div className="col-12">
							<label htmlFor="expense-description" className="form-label pls-label small">
								Description <span className="text-danger">*</span>
							</label>
							<textarea
								name="sharedDescription"
								id="expense-description"
								value={sharedDescription}
								onChange={(e) => {
									setSharedDescription(e.target.value);
									setSharedErrors(prev => ({ ...prev, description: undefined }));
								}}
								className={`form-control form-control-sm ${sharedErrors.description ? "is-invalid" : ""}`}
								rows={3}
								placeholder="Enter description for all expense items"
								disabled={isBusy}
							/>
							{sharedErrors.description && <div className="invalid-feedback">{sharedErrors.description}</div>}
						</div>
						<div className="col-12">
							<hr className="my-3" />
							<div className="row">
								<div className="col-6">
									<div className="d-flex justify-content-between mb-2">
										<span className="fw-bold">Subtotal:</span>
										<span className="fw-bold">GHC {totalAmount.toFixed(2)}</span>
									</div>
								</div>
								<div className="col-6">
									<div className="d-flex justify-content-between mb-2">
										<span className="fw-bold">Tax:</span>
										<span className="fw-bold">GHC {totalTax.toFixed(2)}</span>
									</div>
								</div>
								<div className="col-12">
									<div className="d-flex justify-content-between pt-2 border-top">
										<span className="fw-bold fs-5">Total Amount:</span>
										<span className="fw-bold fs-5">GHC {(totalAmount + totalTax).toFixed(2)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					<div className={styles.actions}>
						<button type="button" className="btn btn-outline-primary btn-sm" onClick={handleAddExpense} disabled={isBusy}>
							Add New Line Item
						</button>

						<div>
							<button
								type="submit"
								className="btn btn-primary btn-sm me-2"
								disabled={isBusy}
							>
								{isSubmitting ? (
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
								className="btn btn-secondary btn-sm"
								onClick={() => {
									setExpenseForms([{ ...defaultExpense }]);
									setSharedInvoiceNumber("");
									setSharedDescription("");
									setSharedDate("");
									setSharedErrors({});
									setErrors({}); setFeedback(null);
								}}
								disabled={isBusy}
							>
								Reset All
							</button>
						</div>
					</div>
				</form>
			</div>
		</main>
	);
}
