"use client"
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ToastContainer, toast } from 'react-toastify';
import { customPost, customFetch } from '../../../../../components/Auth/customFetch';
import { useApplication } from '../../../../../components/Auth/useApplicationContext';
import Loader from '../../../../../components/accessories/Loader';
import Modal from 'react-bootstrap/Modal';
import { RiAddBoxFill, RiDeleteBack2Fill, RiEdit2Fill } from '@remixicon/react';
import PrimeTable from '../../../../../components/accessories/Datatables/PrimeTable';
import { noopServerSideHandle } from '../../../../../components/serverActions/ActionFiltering';

const merchantSchema = z.object({
    name: z.string().min(1, "Merchant name is required"),
    email: z.string().email("Invalid email address").optional().or(z.literal('')),
    phone: z.string().min(10, "Phone number must be exactly 10 digits").max(10, "Phone number must be exactly 10 digits").optional().or(z.literal('')),
    address: z.string().optional(),
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
    const [merchants, setMerchants] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editMerchant, setEditMerchant] = useState<any | null>(null);
    const user = useApplication().user;
    const employeeid = user?.employeeid;
    const branchid = useApplication().branchid;
    const { register, handleSubmit, formState: { errors }, reset } = useForm<MerchantFormData>({
        resolver: zodResolver(merchantSchema),
        defaultValues: defaultMerchant
    });

    useEffect(() => {
        async function fetchMerchants() {
            try {
                const response = await customFetch(`expense/merchants?branchid=${branchid}&&employeeid=${employeeid}`);
                if (Array.isArray(response)) {
                    setMerchants(response);
                } else if (response?.data && Array.isArray(response.data)) {
                    setMerchants(response.data);
                } else {
                    setMerchants([]);
                }
            } catch (e) {
                setMerchants([]);
            }
        }
        fetchMerchants();
    }, []);

    // Handler for deleting a merchant
    const handleDeleteMerchant = async (merchant: any) => {
        if (!merchant?.id) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete merchant "${merchant.name}"? This action cannot be undone.`);
        if (!confirmDelete) return;
        setLoading(true);
        try {
            const response = await customPost(`expense/merchant?id=${merchant.id}&&employeeid=${employeeid}&&branchid=${branchid}`, 'DELETE', {});
            if (response?.status === true || response?.status === "success") {
                toast.success('Merchant deleted successfully', { autoClose: 2000 });
                // Refresh merchants
                const refreshed = await customFetch(`expense/merchants?branchid=${branchid}&&employeeid=${employeeid}`);
                setMerchants(Array.isArray(refreshed) ? refreshed : refreshed?.data || []);
            } else {
                toast.error(response?.message || "Failed to delete merchant", { autoClose: 5000 });
            }
        } catch (error) {
            toast.error("An error occurred while deleting merchant", { autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const handleEditMerchant = (m: any) => {
        setEditMerchant(m);
        reset({
            name: m.name || '',
            email: m.email || '',
            phone: m.phone || '',
            address: m.address || '',
            taxId: m.taxId || '',
            website: m.website || '',
            notes: m.notes || ''
        });
        setShowModal(true);
    };
    
    const handleMerchantFormSubmit = async (data: MerchantFormData) => {
        setLoading(true);
        try {
            let response;
            if (editMerchant) {
                response = await customPost('expense/merchant', 'PUT', {
                    ...editMerchant,
                    ...data,
                    employeeid,
                    branchid
                });
            } else {
                response = await customPost('expense/merchant', 'POST', {
                    employeeid,
                    branchid,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    address: data.address,
                    website: data.website,
                    notes: data.notes
                });
            }
            if (response?.status === true || response?.status === "success") {
                toast.success(editMerchant ? 'Merchant updated successfully' : 'Merchant added successfully', { autoClose: 2000 });
                reset(defaultMerchant);
                setShowModal(false);
                setEditMerchant(null);
                // Refresh merchants
                const refreshed = await customFetch(`expense/merchants?branchid=${branchid}&&employeeid=${employeeid}`);
                setMerchants(Array.isArray(refreshed) ? refreshed : refreshed?.data || []);
            } else {
                toast.error("Failed to save merchant", { autoClose: 5000 });
            }
        } catch (error) {
            toast.error("An error occurred", { autoClose: 5000 });
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            Header: 'Name',
            accessor: 'name',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Phone',
            accessor: 'phone',
        },
        {
            Header: 'Address',
            accessor: 'address',
        },
        {
            Header: 'Website',
            accessor: 'website',
        },
        {
            Header: 'Created By',
            accessor: 'created_by_name',
        },
        {
            Header: 'Created At',
            accessor: 'created_at',
            Cell: ({ value }: any) => value ? new Date(value).toLocaleString() : '',
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            disableSortBy: true,
            Cell: ({ row }: any) => (
                <div className="d-flex gap-2">
                    <button className="btn btn-outline-primary btn-sm me-2" onClick={() => handleEditMerchant(row.original)}>
                        <RiEdit2Fill /> Edit
                    </button>
                    <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteMerchant(row.original)}>
                        <RiDeleteBack2Fill /> Delete
                    </button>
                </div>
            ),
        },
    ];



    return (
        <div className="container-fluid p-4">
            {isLoading && <Loader w={50} h={50} />}
            {!isLoading && (
                <>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="mb-0">Add New Merchant</h4>
                        <button className="btn btn-primary btn-sm" onClick={() => { setShowModal(true); setEditMerchant(null); reset(defaultMerchant); }}>
                            <RiAddBoxFill /> New Merchant
                        </button>
                    </div>
                    <Modal show={showModal} onHide={() => { setShowModal(false); setEditMerchant(null); }}>
                        <Modal.Header closeButton>
                            <Modal.Title>{editMerchant ? 'Edit Merchant' : 'Add New Merchant'}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <form onSubmit={handleSubmit(handleMerchantFormSubmit)} className='row g-3'>
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
                                        maxLength={10}
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
                                <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editMerchant ? 'Update Merchant' : 'Add Merchant'}
                                    </button>
                                </div>
                            </form>
                        </Modal.Body>
                    </Modal>

                    {Array.isArray(merchants) && merchants.length > 0 && (
                        <div className="mt-5">
                            <PrimeTable column={columns}
                                data={merchants}
                                filtering={true}
                                urlparams={{ employeeid, branchid }}
                                serverSideFiltering={true}
                                handleSeverSideProcessing={noopServerSideHandle} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}