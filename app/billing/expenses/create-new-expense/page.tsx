"use client"
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { customFetch, customPost ,reactSelectCustomStyles} from '../../../../components/Auth/customFetch';
import Loader from '../../../../components/accessories/Loader';
import { useSearchParams } from 'next/navigation';
import { useApplicationSettings } from '../../../../components/Auth/useApplicationContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Select from 'react-select';

interface ExpenseForm {
    name: string;
    date: string;
    merchant: string;
    amount: string;
    category_name: string; // Renamed from category
    category_id: number; // New field for category ID
    mode: string;
    description: string;
    receipt: FileList | null;
    invoiceNumber: string;
    taxAmount: string;
}

interface PaymentMode {
    KeyID: string;
    PaymentMode: string;
}

interface Category {
    category: string; // This seems to be category name from the existing fetch
    categoryid: number; // This seems to be category id from the existing fetch
}

// New interface for our mock/future API categories
interface ExpenseCategory {
    id: number;
    name: string;
}

interface SelectOption {
    value: string;
    label: string;
}
const expenseSchema = z.object({
    name: z.string().min(1, "Expense name is required"),
    date: z.string().min(1, "Date is required"),
    merchant: z.string().min(1, "Merchant name is required"),
    amount: z.string().min(1, "Amount is required"),
    category_name: z.string().min(1, "Category Name is required"), // Renamed from category
    category_id: z.number().min(1, "Expense Category is required"), // New field for category ID
    mode: z.string().min(1, "Payment mode is required"),
    description: z.string().min(1, "Description is required"),
    receipt: z.any().optional(),
    invoiceNumber: z.string().optional(),
    taxAmount: z.string().optional(),
});

const defautExpense: ExpenseForm = {
    name: '',
    date: '',
    merchant: '',
    amount: '',
    category_name: '', // Renamed from category
    category_id: 0, // Default for the new ID
    mode: '',
    description: '',
    receipt: null,
    invoiceNumber: '',
    taxAmount: ''
};

type ExpenseFormData = z.infer<typeof expenseSchema>;

export default function AddNewExpense() {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: defautExpense
    });
    const [isLoading, setLoading] = useState<boolean>(false);
    const [paymentmode, setPaymentMode] = useState<PaymentMode[]>([]);
    const [fetchedCategories, setFetchedCategories] = useState<Category[]>([]); // Renamed from category for clarity
    
    // Mocked expense categories as per requirements
    const mockCategories: ExpenseCategory[] = [
      { id: 1, name: 'Travel' },
      { id: 2, name: 'Meals & Entertainment' },
      { id: 3, name: 'Software & Subscriptions' },
      { id: 4, name: 'Office Supplies' },
    ];
    const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(mockCategories);


    const { user,branchid } = useApplicationSettings().applicationsettings;
    const employeeid = user?.employeeid;
    const searchParams = useSearchParams();
    const method = searchParams?.get('action');
    const editid = searchParams?.get("id");

    const onSubmit = async (data: ExpenseFormData) => {
        // if (!employeeid || !branchid) {
        //     return window.location.reload();
        // }
 

        const httpMethod = method && editid ? 'PUT' : 'POST';
        try {
            const formData = {...data, branchid,employeeid}
            const response = await customPost('expenses', httpMethod, formData);
            if (response?.status == true) {
                toast.success('New expense generated successfully awaiting approval', { autoClose: 2000 });
  
            } else {
                toast.error("Expense generation failed", { autoClose: 5000 });
            }
        } catch (error) {
            toast.error("An error occurred", { autoClose: 5000 });
        }
    };

    // This useEffect fetches what seems to be category names for a different purpose
    // Let's keep it and store its data in fetchedCategories (renamed from category)
    useEffect(() => {
        setLoading(true);
        customFetch(`expense/get/category`)
            .then((data: Category[]) => {
                if (Array.isArray(data)) {
                    setFetchedCategories(data); // Store in renamed state
                }
            })
            .catch((err: Error) => { /* Handle error */ })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // useEffect for fetching actual expense categories (currently mocked)
    // In a real scenario, this would fetch from an endpoint like `/api/expense-categories`
    // For now, it just sets the mocked data.
    useEffect(() => {
        // Simulate API call
        setLoading(true);
        setTimeout(() => {
            setExpenseCategories(mockCategories);
            setLoading(false);
        }, 500); // Simulate network delay
    }, []);


    useEffect(() => {
        async function getPaymentModes() {
            try {
                setLoading(true);
                const paymentModes = await customFetch('paymentmodes');
                setPaymentMode(paymentModes?.data);
            } catch (err) {
                setPaymentMode([]);
            } finally {
                setLoading(false);
            }
        }
        getPaymentModes();
    }, []);

    useEffect(() => {
        if (method && editid) {
            setLoading(true);
            customFetch(`expenses/record/single?expenseid=${editid}`)
                .then((data) => {
                    if (data.length > 0) {
                        const expenseData = data[0];
                        reset(expenseData); 
                    }
                })
                .catch(() => reset(defautExpense))
                .finally(() => { setLoading(false); });
        }
    }, [editid, method, reset]);

    return (
        <div className="container-fluid p-4">
            <ToastContainer theme='colored' />
            {isLoading && <Loader w={50} h={50} />}
            {!isLoading && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">New Expense Request</h4>
                        <small className="text-muted">Fill all the required fields</small>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className='row g-3 bg-white p-4 rounded shadow-sm'>
                        <div className="col-md-12 ">
                            <label className="form-label pls-label">Expense Name</label>
                            <input
                                {...register("name")}
                                className={`custom-input ${errors.name ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter expense name"
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                        </div>

                        <div className="col-md-12 ">
                            <label className="form-label pls-label">Expense Date</label>
                            <input
                                {...register("date")}
                                type="datetime-local"
                                className={`custom-input ${errors.date ? 'is-invalid' : ''}`}
                            />
                            {errors.date && <div className="invalid-feedback">{errors.date.message}</div>}
                        </div>

                        <div className="col-md-12 ">
                            <label className="form-label pls-label">Merchant</label>
                            <input
                                {...register("merchant")}
                                className={`custom-input ${errors.merchant ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter merchant name"
                            />
                            {errors.merchant && <div className="invalid-feedback">{errors.merchant.message}</div>}
                        </div>

                        <div className="col-md-12 ">
                            <label className="form-label pls-label">Amount</label>
                            <div className="input-group">
                                <span className="input-group-text">$</span>
                                <input
                                    {...register("amount")}
                                    className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                                    type="number"
                                    placeholder="0.00"
                                />
                                {errors.amount && <div className="invalid-feedback">{errors.amount.message}</div>}
                            </div>
                        </div>

                        <div className="col-md-12 ">
                            {/* This seems to be the old category dropdown, let's rename its label and field */}
                            <div className="col-md-12">
                                <label className="form-label pls-label">Category Name (Legacy)</label>
                                <Select
                                    options={fetchedCategories.map(item => ({ // Use renamed fetchedCategories
                                        value: String(item.categoryid || ''), // This might be the ID for the category_name
                                        label: item.category
                                    }))}
                                    styles={reactSelectCustomStyles}
                                    placeholder="Select a category name"
                                    className={`react-select-container ${errors.category_name ? 'is-invalid' : ''}`}
                                    classNamePrefix="react-select"
                                    isClearable
                                    onChange={(option) => setValue('category_name', option?.label || '')} // Store label as category_name
                                />
                                {errors.category_name && <div className="invalid-feedback">{errors.category_name.message}</div>}
                            </div>
                        </div>

                        <div className="col-md-12 ">
                            <label className="form-label pls-label">Expense Category</label>
                            <Select
                                options={expenseCategories.map(item => ({
                                    value: String(item.id),
                                    label: item.name
                                }))}
                                styles={reactSelectCustomStyles}
                                placeholder="Select an expense category"
                                className={`react-select-container ${errors.category_id ? 'is-invalid' : ''}`}
                                classNamePrefix="react-select"
                                isClearable
                                onChange={(option) => setValue('category_id', option ? parseInt(option.value) : 0)}
                            />
                            {errors.category_id && <div className="invalid-feedback">{errors.category_id.message}</div>}
                        </div>
                        
                        <div className="col-md-12">
                            <label className="form-label pls-label">Payment Method</label>
                            <Select
                                options={paymentmode.map(item => ({
                                    value: item.KeyID.toString(),
                                    label: item.PaymentMode
                                }))}
                                placeholder="Select payment method"
                                className={`react-select-container ${errors.mode ? 'is-invalid' : ''}`}
                                classNamePrefix="react-select"
                                isClearable
                                styles={reactSelectCustomStyles}
                                onChange={(option) => setValue('mode', option?.value || '')}
                            />
                            {errors.mode && <div className="invalid-feedback">{errors.mode.message}</div>}
                        </div>

                        <div className="col-md-12">
                            <label className="form-label pls-label">Invoice Number</label>
                            <input
                                {...register("invoiceNumber")}
                                className={`custom-input ${errors.invoiceNumber ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter invoice number"
                            />
                            {errors.invoiceNumber && <div className="invalid-feedback">{errors.invoiceNumber.message}</div>}
                        </div>

                        <div className="col-12">
                            <label className="form-label pls-label">Description</label>
                            <textarea
                                {...register("description")}
                                className={`custom-input ${errors.description ? 'is-invalid' : ''}`}
                                rows={3}
                                placeholder="Enter expense description"
                            />
                            {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                        </div>

                        <div className="col-12 mt-4">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                Submit Expense Request
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
