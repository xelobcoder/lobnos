"use client"
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ToastContainer, toast } from 'react-toastify';
import { customPost } from '../../../../../components/Auth/customFetch';
import { useApplicationSettings } from '../../../../../components/Auth/useApplicationContext';
import Loader from '../../../../../components/accessories/Loader';

const merchantSchema = z.object({
    name: z.string().min(1, "Merchant name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal('')),
    address: z.string().min(1, "Address is required"),
    taxId: z.string().optional(),
    website: z.string().url("Invalid website URL").optional().or(z.literal('')),
    notes: z.string().optional(),
});

type MerchantFormData = z.infer<typeof merchantSchema>;

const defaultMerchant: MerchantFormData = {
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    website: '',
    notes: '',
};

export default function AddMerchant() {
    const [isLoading, setLoading] = useState(false);
    const { user } = useApplicationSettings().applicationsettings;
    const { register, handleSubmit, formState: { errors }, reset } = useForm<MerchantFormData>({
        resolver: zodResolver(merchantSchema),
        defaultValues: defaultMerchant
    });

    const onSubmit = async (data: MerchantFormData) => {
        if (!user?.branchid) {
            return toast.error("Authentication error", { autoClose: 5000 });
        }

        try {
            setLoading(true);
            const response = await customPost('merchants', 'POST', {
                ...data,
                branchid: user.branchid
            });

            if (response?.status === "success") {
                toast.success('Merchant added successfully', { autoClose: 2000 });
                reset(defaultMerchant);
            } else {
                toast.error("Failed to add merchant", { autoClose: 5000 });
            }
        } catch (error) {
            toast.error("An error occurred", { autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid p-4">
            <ToastContainer theme='colored' />
            {isLoading && <Loader w={50} h={50} />}
            {!isLoading && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Add New Merchant</h4>
                        <small className="text-muted">Fill all the required fields</small>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className='row g-3 bg-white p-4 rounded shadow-sm'>
                        <div className="col-md-6">
                            <label className="form-label pls-label">Merchant Name</label>
                            <input
                                {...register("name")}
                                className={`custom-input ${errors.name ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter merchant name"
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label pls-label">Email</label>
                            <input
                                {...register("email")}
                                className={`custom-input ${errors.email ? 'is-invalid' : ''}`}
                                type="email"
                                placeholder="Enter email address"
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label pls-label">Phone Number</label>
                            <input
                                {...register("phone")}
                                className={`custom-input ${errors.phone ? 'is-invalid' : ''}`}
                                type="tel"
                                placeholder="Enter phone number"
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
                        </div>

                        <div className="col-md-6">
                            <label className="form-label pls-label">Tax ID</label>
                            <input
                                {...register("taxId")}
                                className={`custom-input ${errors.taxId ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter tax ID"
                            />
                            {errors.taxId && <div className="invalid-feedback">{errors.taxId.message}</div>}
                        </div>

                        <div className="col-md-12">
                            <label className="form-label pls-label">Address</label>
                            <input
                                {...register("address")}
                                className={`custom-input ${errors.address ? 'is-invalid' : ''}`}
                                type="text"
                                placeholder="Enter full address"
                            />
                            {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                        </div>

                        <div className="col-md-12">
                            <label className="form-label pls-label">Website</label>
                            <input
                                {...register("website")}
                                className={`custom-input ${errors.website ? 'is-invalid' : ''}`}
                                type="url"
                                placeholder="Enter website URL"
                            />
                            {errors.website && <div className="invalid-feedback">{errors.website.message}</div>}
                        </div>

                        <div className="col-12">
                            <label className="form-label pls-label">Notes</label>
                            <textarea
                                {...register("notes")}
                                className={`custom-input ${errors.notes ? 'is-invalid' : ''}`}
                                rows={3}
                                placeholder="Enter additional notes"
                            />
                            {errors.notes && <div className="invalid-feedback">{errors.notes.message}</div>}
                        </div>

                        <div className="col-12 mt-4">
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                            >
                                Add Merchant
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}