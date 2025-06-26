"use client"
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { customFetch, customPost } from '../../../Auth/customFetch';
import { DeviceOption, ControlMaterialOption } from './types';
import { QCReadingForm } from './QCReadingForm';
import { fetchDevices } from '../lib';
import { useApplication } from '../../../Auth/useApplicationContext';

interface Device {
    id: string;
    deviceName: string;
    model: string;
}

interface Control {
    id: string;
    name: string;
    lotNumber: string;
}



export function QCSessionCreator() {
    const [selectedDevice, setSelectedDevice] = useState<DeviceOption | null>(null);
    const [selectedControl, setSelectedControl] = useState<ControlMaterialOption | null>(null);
    const [devices, setDevices] = useState<DeviceOption[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(false);
    const [controlMaterials, setControlMaterials] = useState<ControlMaterialOption[]>([]);
    const [loadingControls, setLoadingControls] = useState(false);
    const [loadingParameters, setLoadingParameters] = useState(false);
    const EMPLOYEEID = useApplication().user.employeeid;

    useEffect(() => {
        getUserDevices();
    }, []);

    const getUserDevices = async () => {
        try {
            setLoadingDevices(true);
            const response = await fetchDevices();
            if (!response) throw new Error('Failed to fetch devices');
            
            const deviceOptions = response.map((device: Device) => ({
                value: device.id,
                label: `${device.deviceName} (${device.model})`,
                device: device
            }));
            setDevices(deviceOptions);
        } catch (error: any) {
            console.error('Failed to load devices:', error);
            toast.error(error.message || 'Failed to load devices');
        } finally {
            setLoadingDevices(false);
        }
    };

    const fetchControlMaterials = async (deviceId: string) => {
        try {
            setLoadingControls(true);
            const response = await customFetch(`controlmaterials/device/${deviceId}`);
            if (!response) throw new Error('Failed to fetch control materials');
            
            const controlOptions = response.map((control: Control) => ({
                value: control.id,
                label: `${control.name} (${control.lotNumber})`,
                control: control
            }));
            
            setControlMaterials(controlOptions);
        } catch (error: any) {
            console.error('Failed to load control materials:', error);
            toast.error(error.message || 'Failed to load control materials');
        } finally {
            setLoadingControls(false);
        }
    };

    const handleDeviceChange = (selected: DeviceOption | null) => {
        setSelectedDevice(selected);
        setSelectedControl(null);
        setControlMaterials([]);
        if (selected?.value) {
            fetchControlMaterials(selected.value);
        }
    };

    const handleControlChange = (selected: ControlMaterialOption | null) => {
        setSelectedControl(selected);
    };

    const createSession = async () => {
        if (!selectedDevice || !selectedControl) {
            toast.error('Please select device and control material first');
            return;
        }

        try {
            setLoadingParameters(true); // Set loadingParameters to true before API call
            const sessionData = {
                controlMaterialId: selectedControl.value,
                createdby: EMPLOYEEID,
                updatedby: EMPLOYEEID
            };

            const response = await customPost('qc-sessions', 'POST', sessionData);
            if (response.status === true ) {
                toast.success('QC session created successfully');
            } else {
                throw new Error('Failed to create QC session');
            }
        } catch (error: any) {
            console.error('Error creating QC session:', error);
            toast.error(error.message || 'Failed to create QC session');
        } finally {
            setLoadingParameters(false); 
        }
    };

    return (
        <QCReadingForm
            selectedDevice={selectedDevice}
            selectedControl={selectedControl}
            devices={devices}
            controlMaterials={controlMaterials}
            loadingDevices={loadingDevices}
            loadingControls={loadingControls}
            loadingParameters={loadingParameters} 
            onDeviceChange={handleDeviceChange}
            onControlChange={handleControlChange}
            onContinue={createSession}
        />
    );
}