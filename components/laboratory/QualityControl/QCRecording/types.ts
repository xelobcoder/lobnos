export interface ControlParameter {
    id: string;
    controlMaterialId: string;
    parameter: string;
    value: string;
    unit: string;
    standardDeviation: string;
    warningLimit: string;
    actionLimit: string;
    validationNotes: string | null;
}

export interface Reading {
    value: string;
    parameterId: string;
    parameterName: string;
    status: ReadingStatus;
}

export type ReadingStatus = 'normal' | 'warning' | 'critical' | 'unmonitored';

export interface ControlMaterialOption {
    value: string;
    label: string;
    control: {
        id: string;
        name: string;
        lotNumber: string;
    };
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