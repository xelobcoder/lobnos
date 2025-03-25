'use client';
import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { RiLockLine, RiUserLine, RiSaveLine } from '@remixicon/react';
import { customPost } from '../../Auth/customFetch';
import { useApplicationSettings } from '../../Auth/useApplicationContext';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const credentialsSchema = z.object({
  username: z.string().min(6, "Username must be at least 6 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const PatientCredentials = () => {
    const searchParams = useSearchParams();
    const patientid = searchParams.get('patientid');
    
    const { register, handleSubmit, formState: { errors }, getValues } = useForm({
        resolver: zodResolver(credentialsSchema)
    });
    const [updating, setUpdating] = useState(false);
    const {employeeid} = useApplicationSettings().applicationsettings.user;

    const handleUpdateCredentials = async () => {
        try {
            const username = getValues('username');
            const password = getValues('password');
            
            if (!patientid) {
                toast.error('Patient ID is required');
                return;
            }
            
            setUpdating(true);
            
            const updateData = {
                opassword: password,
                npassword: password,
                nppassword: password, 
                employeeid,
                patientid,
                providedUsername: username
            };
            
            const response = await customPost('patients/updatecredentials', 'POST', updateData);
            
            if (response.status === "success") {
                toast.success('Credentials updated successfully');
            } else {
                toast.error(response.message || 'Failed to update credentials');
            }
        } catch (error) {
            toast.error('An error occurred while updating credentials');
            console.error(error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(handleUpdateCredentials)}>
            <div className="row g-3">
                <div className="col-md-6">
                    <label className="pls-label required fs-6">Username</label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <RiUserLine />
                        </span>
                        <input
                            {...register('username')}
                            type="text"
                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                            placeholder="Enter username"
                        />
                    </div>
                    {errors.username && (
                        <p className="text-danger small mt-1">{errors.username.message}</p>
                    )}
                </div>

                <div className="col-md-6">
                    <label className="pls-label required fs-6">Password</label>
                    <div className="input-group">
                        <span className="input-group-text">
                            <RiLockLine />
                        </span>
                        <input
                            {...register('password')}
                            type="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Enter password"
                        />
                    </div>
                    {errors.password && (
                        <p className="text-danger small mt-1">{errors.password.message}</p>
                    )}
                </div>
                
                <div className="col-12 mt-3 text-end">
                    <button 
                        type="submit" 
                        className="btn btn-sm btn-outline-primary"
                        disabled={updating}
                    >
                        <RiSaveLine className="me-1" size={16} />
                        {updating ? 'Updating...' : 'Save Credentials'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default PatientCredentials;