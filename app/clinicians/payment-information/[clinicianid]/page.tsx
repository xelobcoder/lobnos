"use client"
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    RiPhoneLine,
    RiMoneyDollarBoxLine,
    RiBankLine,
    RiAccountBoxLine,
    RiSaveLine,
    RiSecurePaymentLine,
    RiGitBranchLine,
    RiStackLine,
    RiSettingsLine
} from '@remixicon/react';
import { useParams } from 'next/navigation'
import { customFetch, customPost } from '../../../../components/Auth/customFetch';
import { toast } from 'react-toastify';


// Define the Zod schema for validation
const paymentSchema = z.object({
    module: z.enum(['credit-card', 'mobile-money', 'cash'], {
        required_error: "Payment method is required",
    }),
    commission: z.preprocess(
        (val) => {
            const num = Number(val);
            return isNaN(num) ? val : num;
        },
        z.number({
            required_error: "Commission is required",
            invalid_type_error: "Commission must be a number"
        })
            .min(1, "Commission cannot be less than 1%")
            .max(100, "Commission cannot exceed 100%")
    ),
    momo: z.string().optional(),
    account: z.string().optional(),
    bankName: z.string().optional(),
    branch: z.string().optional(),
    accountName: z.string().optional(),
})
    .superRefine((data, ctx) => {

        if (data.module === 'mobile-money') {
            if (!data.momo) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Mobile money number is required",
                    path: ["momo"]
                });
            } else if (!/^\d{10}$/.test(data.momo)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Mobile money number must be 10 digits",
                    path: ["momo"]
                });
            }
        }

        // Bank details validation
        if (data.module === 'credit-card') {
            const requiredFields = {
                account: "Bank account number is required",
                bankName: "Bank name is required",
                branch: "Bank branch is required",
                accountName: "Account holder name is required"
            };

            Object.entries(requiredFields).forEach(([field, message]) => {
                if (!data[field as keyof typeof data]) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message,
                        path: [field]
                    });
                }
            });

            // Additional validation for account number if needed
            if (data.account && !/^[0-9]{8,20}$/.test(data.account)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Account number must be 8-20 digits",
                    path: ["account"]
                });
            }

            // Validate account name format
            if (data.accountName && !/^[a-zA-Z\s]{3,}$/.test(data.accountName)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Account name must be at least 3 letters",
                    path: ["accountName"]
                });
            }
        }
    });

// Infer the TypeScript type from the schema
type PaymentData = z.infer<typeof paymentSchema>;

export default function PaymentModuleClinician() {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<PaymentData>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            module: 'credit-card',
            commission: 10,
            momo: '',
            account: '',
            bankName: '',
            branch: '',
            accountName: '',
        },
    });
    const [isLoading, setIsLoading] = useState(false);
    const paymentModule = watch('module');
    const clinicianid = useParams()?.clinicianid

    const onSubmit = async (data: PaymentData) => {
        try {
            const payload = {
                clinicianid: Number(clinicianid),
                module: data.module,
                momo: data.momo ? Number(data.momo) : undefined,
                bankname: data.bankName,
                bankbranch: data.branch,
                accountnumber: data.account ? Number(data.account) : undefined,
                accountname: data.accountName,
                created_on: new Date(),
                commission: data.commission,
                momoname: data.momo ? data.momo : undefined,
            };

            const response = await customPost(`clinicians/payments/${clinicianid}`, 'PUT', payload);
            const { status } = response;

            if (response && status == true) {
                toast.success('Clincian Payment Information Updated Successuly')
            }
        } catch (error) {
            alert(`Failed to save configuration: ${error.message}`);
        }
    };

    const showMomoFields = paymentModule === 'mobile-money';
    const showBankFields = paymentModule === 'credit-card';

    // if clicnidianid is porvided, we have to load the existing payment configuration
    const loadPreviousConfiguration = useCallback(async () => {
        try {
            setIsLoading(true);
            const configuration = await customFetch(`clinicians/payments/${clinicianid}`);
            if (configuration) {
                const { module, commission, momo, account, bankname, bankbranch, accountname, clinicianid, accountnumber } = configuration;
                // Set default values based on the fetched configuration
                reset({
                    module: module || 'credit-card',
                    commission: commission || 0,
                    momo: momo || '',
                    bankName: bankname || '',
                    branch: bankbranch || '',
                    accountName: accountname || '',
                    account: accountnumber || '',
                });
            }
        } catch (error) {
            console.error('Error loading previous configuration:', error);
            toast.error('Failed to load previous payment configuration');
        }
        finally {
            setIsLoading(false);
        }
    }, [clinicianid, reset]);


    useEffect(() => {
        loadPreviousConfiguration();
    }, [loadPreviousConfiguration]);


    if (isLoading) {
        return (
            <div className="p-4 mx-3">
                <h3 className="mb-5 fw-bold text-primary text-muted  fw-bold  bg-secondary-subtle p-3 br-5">
                    <RiSettingsLine size={28} className="me-2" /> Loading Payment Configuration...
                </h3>
                <div className="d-flex justify-content-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 mx-3" >
            <h3 className="mb-5 fw-bold text-primary text-muted  fw-bold  bg-secondary-subtle p-3 br-5">
                <RiSettingsLine size={28} className="me-2" /> Payment Configuration
            </h3>
            <hr />
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                    <label htmlFor="payment-module-select" className="form-label fs-6 fw-medium">Payment Module</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-secondary">
                            <RiSecurePaymentLine size={24} />
                        </span>
                        <select
                            className={`form-select form-control-sm ${errors.module ? 'is-invalid' : ''}`}
                            id="payment-module-select"
                            {...register('module')}
                            disabled={isSubmitting}
                        >
                            <option value="credit-card">Credit Card / Bank</option>
                            <option value="mobile-money">Mobile Money</option>
                            <option value="cash">Cash</option>
                        </select>
                        {errors.module && (
                            <div className="invalid-feedback d-block">
                                {errors.module.message}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label htmlFor="commission" className="form-label fs-6 fw-medium">Commission (%)</label>
                    <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-secondary">
                            <RiMoneyDollarBoxLine size={24} />
                        </span>
                        <input
                            type="number"
                            className={`form-control form-control-sm ${errors.commission ? 'is-invalid' : ''}`}
                            id="commission"
                            {...register('commission')}
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="e.g., 5"
                            disabled={isSubmitting}
                        />
                        {errors.commission && (
                            <div className="invalid-feedback d-block">
                                {errors.commission.message}
                            </div>
                        )}
                    </div>
                </div>

                {showMomoFields && (
                    <div className="mb-4">
                        <label htmlFor="momo" className="form-label fs-6 fw-medium">Mobile Money Number</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0 text-secondary">
                                <RiPhoneLine size={24} />
                            </span>
                            <input
                                type="tel"
                                className={`form-control form-control-sm ${errors.momo ? 'is-invalid' : ''}`}
                                id="momo"
                                minLength={10}
                                maxLength={10}
                                pattern="\d{10}"
                                {...register('momo')}
                                placeholder="e.g., 0241234567"
                                disabled={isSubmitting}
                            />
                            {errors.momo && (
                                <div className="invalid-feedback d-block">
                                    {errors.momo.message}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {showBankFields && (
                    <>
                        <div className="mt-5 mb-4 pt-3">
                            <h4 className="text-secondary fw-semibold pb-2 border-bottom">
                                Bank Account Details for Settlement
                            </h4>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="account" className="form-label fs-6 fw-medium">Bank Account Number</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <RiBankLine size={24} />
                                </span>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm ${errors.account ? 'is-invalid' : ''}`}
                                    id="account"
                                    {...register('account')}
                                    pattern="\d{8,20}"
                                    minLength={8}
                                    maxLength={20}
                                    placeholder="Enter account number"
                                    disabled={isSubmitting}
                                />
                                {errors.account && (
                                    <div className="invalid-feedback d-block">
                                        {errors.account.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="bankName" className="form-label fs-6 fw-medium">Bank Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <RiGitBranchLine size={24} />
                                </span>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm ${errors.bankName ? 'is-invalid' : ''}`}
                                    id="bankName"
                                    {...register('bankName')}
                                    placeholder="e.g., Equity Bank"
                                    disabled={isSubmitting}
                                />
                                {errors.bankName && (
                                    <div className="invalid-feedback d-block">
                                        {errors.bankName.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="branch" className="form-label fs-6 fw-medium">Bank Branch</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <RiStackLine size={24} />
                                </span>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm ${errors.branch ? 'is-invalid' : ''}`}
                                    id="branch"
                                    {...register('branch')}
                                    placeholder="e.g., Main Street Branch"
                                    disabled={isSubmitting}
                                />
                                {errors.branch && (
                                    <div className="invalid-feedback d-block">
                                        {errors.branch.message}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label htmlFor="accountName" className="form-label fs-6 fw-medium">Account Holder Name</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0 text-secondary">
                                    <RiAccountBoxLine size={24} />
                                </span>
                                <input
                                    type="text"
                                    className={`form-control form-control-sm ${errors.accountName ? 'is-invalid' : ''}`}
                                    id="accountName"
                                    {...register('accountName')}
                                    placeholder="As it appears on the account"
                                    disabled={isSubmitting}
                                />
                                {errors.accountName && (
                                    <div className="invalid-feedback d-block">
                                        {errors.accountName.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                <div className="d-flex justify-content-center mt-5 pt-4 border-top border-secondary-subtle">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg px-5 py-3 d-flex align-items-center"
                        disabled={isSubmitting}
                    >
                        <RiSaveLine size={24} className="me-2" />
                        {isSubmitting ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}