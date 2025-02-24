
export const store = {
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


