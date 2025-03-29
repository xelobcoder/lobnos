export interface ControlParameter {
    name: string;
    unit: string;
    targetValue: number;
    standardDeviation: number;
    warningLimit: number;
    actionLimit: number;
}

export interface Reading {
    value: number;
    isValid: boolean;
    status: 'normal' | 'warning' | 'critical' | null;
}

export interface DeviceOption {
    value: string;
    label: string;
    device: {
        id: string;
        deviceName: string;
        model: string;
    };
}

export interface ControlMaterialOption {
    value: string;
    label: string;
    control: {
        id: string;
        name: string;
        lotNumber: string;
    };
}