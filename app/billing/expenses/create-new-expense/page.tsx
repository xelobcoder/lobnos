"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { customFetch, customFetchMutation, customPost, reactSelectCustomStyles } from "../../../../components/Auth/customFetch";
import Loader from "../../../../components/accessories/Loader";
import { useSearchParams } from "next/navigation";
import { useApplicationSettings } from "../../../../components/Auth/useApplicationContext";
import Select, { SingleValue } from "react-select";
import { RiReceiptLine, RiStoreLine, RiPriceTag3Line, RiRefreshLine } from '@remixicon/react';
import { useRouter } from "next/navigation";
import { Alert, Button, Modal } from 'react-bootstrap';

interface ExpenseForm {
	name: string;
	date: string;
	merchant: string;
	amount: number;
	category: number;
	description: string;
	receipt: FileList | null;
	invoiceNumber: string;
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
	const [categories, setCategories] = useState<Category[]>([]);
	const [merchants, setMerchants] = useState<Merchant[]>([]);
	const [approvalPromptExpenseId, setApprovalPromptExpenseId] = useState<number | null>(null);
	const [paymentPrompt, setPaymentPrompt] = useState<{ invoiceId: number; invoiceNumber: string } | null>(null);
	const [approvalBusy, setApprovalBusy] = useState(false);
	const [approvalError, setApprovalError] = useState('');
	const router = useRouter();

	// Validation schema
	const validateForm = (formData: ExpenseForm): Partial<Record<keyof ExpenseForm, string>> => {
		const errors: Partial<Record<keyof ExpenseForm, string>> = {};

		if (!formData.name.trim()) errors.name = "Expense name is required";
		if (!formData.date) errors.date = "Date is required";
		if (!formData.merchant || isNaN(Number(formData.merchant))) errors.merchant = "Merchant is required";
		if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";
		if (!formData.category) errors.category = "Category is required";
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

			const expenseId = Number(response?.expenseId ?? response?.status);
			if (Number.isSafeInteger(expenseId) && expenseId > 0) {
				setFormData({ ...defaultExpense });
				setApprovalError('');
				setApprovalPromptExpenseId(expenseId);
			} else {
				throw new Error("Submission failed");
			}
		} catch (error) {
			toast.error("Failed to submit expense. Please try again.", { autoClose: 5000 });
		} finally {
			setLoading(false);
		}
	};

	const approveCreatedExpense = async () => {
		if (!approvalPromptExpenseId) return;
		setApprovalBusy(true);
		setApprovalError('');
		try {
			const response = await customFetchMutation('expense/pending/decision', 'POST', {
				expenseid: approvalPromptExpenseId,
				status: 'approved',
			});
			if (!response?.success || response?.decision?.status !== 'approved') {
				throw new Error(response?.message || 'You are not authorized to approve this expense.');
			}

			const invoice = (response.invoices || []).find((item: any) =>
				Array.isArray(item.expenseIds) && item.expenseIds.some((id: number | string) => Number(id) === approvalPromptExpenseId)
			);
			setApprovalPromptExpenseId(null);
			if (!invoice?.invoiceId) {
				if (response?.invoiceErrors?.length) {
					toast.error('Expense approved, but its invoice could not be generated. Retry from the Expenses page.');
				} else {
					toast.success('Expense approved. Open Invoices to continue with payment.');
				}
				router.push('/billing/expenses/invoices');
				return;
			}
			setPaymentPrompt({ invoiceId: Number(invoice.invoiceId), invoiceNumber: invoice.invoiceNumber || '' });
		} catch (error: any) {
			setApprovalError(error?.message || 'Unable to approve this expense.');
		} finally {
			setApprovalBusy(false);
		}
	};


	const loadFormData = () => {
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
	};

	useEffect(() => {
		loadFormData();
	}, [branchid, employeeid]);

	return (
		<div className="container-fluid">
			<div className="d-flex flex-wrap gap-2 mb-3">
				<button className="btn btn-sm btn-outline-secondary" onClick={() => {
					router.push('/billing/expenses/create-multiple-expenses')
				}}>
					create bulk expenses
				</button>
				<button
					className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
					onClick={() => window.open('/billing/expenses/merchants/create', '_blank')}
				>
					<RiStoreLine size={15} />
					New Merchant
				</button>
				<button
					className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
					onClick={() => window.open('/billing/expenses/category', '_blank')}
				>
					<RiPriceTag3Line size={15} />
					New Category
				</button>
				<button
					className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
					onClick={loadFormData}
					disabled={isLoading}
					title="Refresh merchants and categories"
				>
					<RiRefreshLine size={15} />
					Refresh
				</button>
			</div>
			<div className="row">
				<div className="container ">
					<div >
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
									{/* Expense Name */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Expense Name <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
											<input
												name="name"
												value={formData.name}
												onChange={handleInputChange}
												className={`custom-input ${errors.name ? "is-invalid" : ""}`}
												type="text"
												placeholder="Enter expense name"
												disabled={isLoading}
												style={{ fontSize: '0.8rem' }}
											/>
										</div>
										{errors.name && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.name}</div>}
									</div>

									{/* Date & Time */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Date & Time <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
											<input
												name="date"
												value={formatDateForInput(formData.date)}
												onChange={handleInputChange}
												type="datetime-local"
												className={`custom-input ${errors.date ? "is-invalid" : ""}`}
												disabled={isLoading}
												style={{ fontSize: '0.8rem' }}
											/>
										</div>
										{errors.date && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.date}</div>}
									</div>

									{/* Merchant */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Merchant <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
											<Select
												options={merchants.map((merchant) => ({
													value: merchant.id,
													label: merchant.name,
												}))}
												styles={reactSelectCustomStyles}
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
										</div>
										{errors.merchant && <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>{errors.merchant}</div>}
									</div>

									{/* Category */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Category <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
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
										</div>
										{errors.category && <div className="invalid-feedback d-block" style={{ fontSize: '0.75rem' }}>{errors.category}</div>}
									</div>

									{/* Amount */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Amount (GHC) <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
											<input
												name="amount"
												value={formData.amount || ""}
												onChange={handleInputChange}
												className={`custom-input ${errors.amount ? "is-invalid" : ""}`}
												type="number"
												step="0.01"
												min="0"
												placeholder="0.00"
												disabled={isLoading}
												style={{ fontSize: '0.8rem' }}
											/>
										</div>
										{errors.amount && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.amount}</div>}
									</div>

									{/* Invoice Number */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Invoice Number
										</label>
										<div className="col-6 mx-2">
											<input
												name="invoiceNumber"
												value={formData.invoiceNumber}
												onChange={handleInputChange}
												className={`custom-input ${errors.invoiceNumber ? "is-invalid" : ""}`}
												type="text"
												placeholder="Enter invoice number"
												disabled={isLoading}
												style={{ fontSize: '0.8rem' }}
											/>
										</div>
										{errors.invoiceNumber && <div className="invalid-feedback" style={{ fontSize: '0.75rem' }}>{errors.invoiceNumber}</div>}
									</div>

									{/* Description */}
									<div className="col-12 d-flex">
										<label className="form-label mb-1 col-3 text-end align-content-center">
											Description <span className="text-danger">*</span>
										</label>
										<div className="col-6 mx-2">
											<textarea
												name="description"
												value={formData.description}
												onChange={handleInputChange}
												className={`custom-input ${errors.description ? "is-invalid" : ""}`}
												rows={3}
												placeholder="Enter detailed description of the expense"
												disabled={isLoading}
												style={{ fontSize: '0.8rem', resize: 'vertical' }}
											/>
										</div>
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
			<Modal
				show={approvalPromptExpenseId !== null}
				onHide={() => { if (!approvalBusy) setApprovalPromptExpenseId(null); }}
				animation={false}
				dialogClassName="topSheetDialog"
			>
				<Modal.Header closeButton={!approvalBusy}>
					<Modal.Title>Expense created</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{approvalError && <Alert variant="danger">{approvalError}</Alert>}
					Expense created successfully. Would you like to approve this expense now?
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" disabled={approvalBusy} onClick={() => { setApprovalPromptExpenseId(null); toast.info('Expense remains pending approval.'); }}>Not now</Button>
					<Button variant="primary" disabled={approvalBusy} onClick={() => void approveCreatedExpense()}>
						{approvalBusy ? 'Approving...' : 'Approve expense'}
					</Button>
				</Modal.Footer>
			</Modal>
			<Modal
				show={paymentPrompt !== null}
				onHide={() => setPaymentPrompt(null)}
				animation={false}
				dialogClassName="topSheetDialog"
			>
				<Modal.Header closeButton>
					<Modal.Title>Expense approved</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Expense approved{paymentPrompt?.invoiceNumber ? ` and added to invoice ${paymentPrompt.invoiceNumber}` : ''}. Would you like to make payment now?
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-secondary" onClick={() => setPaymentPrompt(null)}>Not now</Button>
					<Button variant="success" onClick={() => {
						if (paymentPrompt) router.push(`/billing/expenses/invoices?payInvoice=${paymentPrompt.invoiceId}&payExpense=${approvalPromptExpenseId}`);
						setPaymentPrompt(null);
					}}>Make payment</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}