
interface Security {
    logout: boolean;
}

interface User {
    employeeid: number;
    username: string;
    token: string;
    role: string;
}

interface Result {
    resultLockAfter24Hours: number;
    isPinOnResultEntry: number;
    isPinOnResultViewAfter24Hours: number;
    maximumResultValidation: number;
    minimumResultValidation: number;
    staffQualifiedToValidationResult: number[];
    showPastTestResult: number;
    allowScientistViewAudit: number;
    showTaTAnalysis: number;
    encryptResultAfter24Hours: number;
    staffToDecryptResult: number[];
    sendLoginEmailNotificationAfterResultEdit: number;
    monitorForCriticalValues: number;
    notifyClientOnResultReady: number;
    notificationType: string;
}

interface Services {
    isConnectedInventory: number;
    isPhysicianOfficeConnected: number;
    isSupplierConnected: number;
    isDoctorPortalConnected: number;
    isResultAnalysisConnected: number;
    isPatientPortalConnected: number;
    isSmsServicesConnected: number;
    isEmailServicesConnected: number;
}

interface Customization {
    currency: string | null;
    decimalPlaces: number;
    fontFamily: string;
    headerColor: string;
    backgroundColor: string;
    textColor: string;
    sidebarColor: string | null;
    theme: string;
}

interface PatientIdGeneration {
    iHasPrefix: boolean;
    iHasSuffix: boolean;
    prefixValue: string;
    suffixValue: string;
}

interface BillingSettings {
    taxToIncludeIdx: number[];
}

export interface Store {
    security: Security;
    user: User;
    company: string;
    branchid: number;
    centerid: null;
    synchronize: boolean;
    lastSynchronizationdate: null;
    isMultiCenterSubscribed: number;
    result: Result;
    services: Services;
    loginDuration: number;
    daysToExpiration: number;
    maximumUsers: number;
    customization: Customization;
    patientIdGeneration: PatientIdGeneration;
    billingsettings: BillingSettings;
}

export const store: Store = {
    security: {
        logout: false
    },
    user: {
        employeeid: 3,
        username: "Dr Karim Tiifu Hamza",
        token: "7uduu",
        role: "admin",
    },
    company: 'VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE',
    branchid: 36,
    centerid: null,
    synchronize: false,
    lastSynchronizationdate: null,
    isMultiCenterSubscribed: 0,
    result: {
        resultLockAfter24Hours: 1,
        isPinOnResultEntry: 1,
        isPinOnResultViewAfter24Hours: 1,
        maximumResultValidation: 4,
        minimumResultValidation: 1,
        staffQualifiedToValidationResult: [1, 3, 4, 5],
        showPastTestResult: 0,
        allowScientistViewAudit: 1,
        showTaTAnalysis: 0,
        encryptResultAfter24Hours: 1,
        staffToDecryptResult: [],
        sendLoginEmailNotificationAfterResultEdit: 0,
        monitorForCriticalValues: 1,
        notifyClientOnResultReady: 1,
        notificationType: 'Email'
    },
    services: {
        isConnectedInventory: 1,
        isPhysicianOfficeConnected: 0,
        isSupplierConnected: 0,
        isDoctorPortalConnected: 0,
        isResultAnalysisConnected: 0,
        isPatientPortalConnected: 0,
        isSmsServicesConnected: 0,
        isEmailServicesConnected: 0,
    },
    loginDuration: 6,
    daysToExpiration: 200,
    maximumUsers: 3,
    customization: {
        currency: null,
        decimalPlaces: 3,
        fontFamily: '"Lexend Deca", Helvetica, Arial, sans-serif',
        headerColor: 'green',
        backgroundColor: 'black',
        textColor: 'white',
        sidebarColor: null,
        theme: "light",
    },
    patientIdGeneration: {
        iHasPrefix: false,
        iHasSuffix: false,
        prefixValue: 'VITAL',
        suffixValue: 'WECARE'
    },
    billingsettings: {
        taxToIncludeIdx: [],
    }
};


