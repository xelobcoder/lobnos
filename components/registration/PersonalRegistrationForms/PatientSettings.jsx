'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFormContext, Controller } from 'react-hook-form';
import { Form } from 'react-bootstrap';
import Select from 'react-select';
import { customFetch, reactSelectCustomStyles } from '../../Auth/customFetch';

const PatientSettings = ({ patientid: passedPatientId }) => {
    const searchParams = useSearchParams();
    const patientid = passedPatientId || searchParams.get('patientid');
    const { control, register, watch, setValue } = useFormContext();
    const [loading, setLoading] = useState(true);
    const notifyEnabled = watch('notify', false);

    const modeOptions = [
        { value: 'hardcopy', label: 'Hard Copy' },
        { value: 'softcopy', label: 'Soft Copy' }
    ];

    const methodOptions = [
        { value: 'None', label: 'None' },
        { value: 'Email', label: 'Email' },
        { value: 'SMS', label: 'SMS' },
        { value: 'WhatsApp', label: 'WhatsApp' }
    ];

    const authModeOptions = [
        { value: 'email', label: 'Email' },
        { value: 'sms', label: 'SMS' },
        { value: 'both', label: 'Both' }
    ];

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const response = await customFetch(
                    `patients/notifications?patientid=${patientid}`
                );
                if (response) {
                    const { mode, notify, method, authenticationMode } = response;

                    const modeValue = modeOptions.find(option => option.value === mode) || null;
                    const methodValue = methodOptions.find(option => option.value === method) || null;
                    const authValue = authModeOptions.find(option => option.value === authenticationMode) || null;

                    setValue('mode', modeValue || '');
                    setValue('notify', notify ? true : false);
                    setValue('method', methodValue || '');
                    setValue('authenticationMode', authValue || '');
                }
            } catch (error) {
                console.error('Failed to load settings:', error);
            } finally {
                setLoading(false);
            }
        };

        if (patientid) {
            loadSettings();
        }
    }, [patientid, setValue]);

    return (
        <div className="row g-3">
            <div className="col-md-6">
                <label className="pls-label fs-6">Preferred Mode</label>
                <Controller
                    name="mode"
                    control={control}
                    defaultValue="hardcopy"
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={modeOptions}
                            styles={reactSelectCustomStyles}
                        />
                    )}
                />
            </div>

            <div className="col-12 mb-3">
                <Form.Check
                    type="switch"
                    id="notify"
                    label="Enable Notifications"
                    {...register('notify')}
                    defaultChecked
                />
            </div>

            <div className="col-md-6">
                <label className="pls-label fs-6">Notification Method</label>
                <Controller
                    name="method"
                    control={control}
                    defaultValue="None"
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={methodOptions}
                            styles={reactSelectCustomStyles}
                            isDisabled={!notifyEnabled}
                        />
                    )}
                />
            </div>

            <div className="col-md-6">
                <label className="pls-label fs-6">Authentication Mode</label>
                <Controller
                    name="authenticationMode"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={authModeOptions}
                            styles={reactSelectCustomStyles}
                        />
                    )}
                />
            </div>

            <div className="col-12 mt-4 text-end">
                <button type="submit" className="btn btn-sm btn-outline-primary">
                    Save Settings
                </button>
            </div>
        </div>
    );
};

export default PatientSettings;