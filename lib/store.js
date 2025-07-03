export const store = {
    security: {
        logout: false
    },
    user: {
        employeeid: 3,
        username: "Mr Tiifu Hamza",
        token: "7uduu",
        role: "admin",
    },
    company: 'VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE',
    branchid: 32,
    centerid: null,
    tenantId: 3,
    synchronize: false,
    lastSynchronizationdate: null,
    isMultiCenterSubscribed: 0,
    result: {
        resultLockAfter24Hours: 1,
        isPinOnResultEntry: 1,
        isPinOnResultViewAfter24Hours: 1,
        maximumResultValidation: 4,
        minimumResultValidation: 1,
        staffQualifiedToValidationResult: [],
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
        currency: 'GHC',
        currencyOptions: [
            { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
            { code: 'USD', symbol: '$', name: 'US Dollar' },
            { code: 'EUR', symbol: '€', name: 'Euro' },
            { code: 'GBP', symbol: '£', name: 'British Pound' },
            { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
            { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
            { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
            { code: 'XAF', symbol: 'FCFA', name: 'Central African CFA franc' },
            { code: 'XOF', symbol: 'CFA', name: 'West African CFA franc' }
        ],
        decimalPlaces: 3,
        fontFamily: '"Lexend Deca", Helvetica, Arial, sans-serif',
        fontFamilyOptions: [
            '"Lexend Deca", Helvetica, Arial, sans-serif',
            '"Roboto", Arial, sans-serif',
            '"Open Sans", Arial, sans-serif',
            '"Montserrat", Arial, sans-serif',
            '"Lato", Arial, sans-serif',
            '"Nunito", Arial, sans-serif',
            '"Poppins", Arial, sans-serif',
            '"Source Sans Pro", Arial, sans-serif',
            '"Inter", Arial, sans-serif',
            'Arial, sans-serif',
            'Tahoma, Geneva, sans-serif',
            'Verdana, Geneva, sans-serif'
        ],
        headerColor: '#3bb75e', // default healthcare green
        headerGradient: 'linear-gradient(90deg, #3bb75e 0%, #0ba4db 100%)',
        sidebarColor: '#3ab75e', // Updated to preferred healthcare green
        sidebarGradient:'#3bb75e',
        sidebarNavGradient: '#3bb75e',
        sidebarNavBorder: '1px solid #eaf6fc',
        backgroundColor: '#f9fbfc', // Soft healthcare background
        backgroundGradient: 'linear-gradient(135deg, #f9fbfc 0%, #f1fef4 60%, #eaf8ee 100%)', // Professional healthcare gradient
        contentCardColor: '#ffffff',
        contentCardBorder: '#eaf6fc',
        contentCardShadow: '0 1px 3px rgba(0,0,0,0.05)',
        textColor: '#011b33',
        textSecondary: '#3bb75e',
        textSidebar: '#ffffff',
        textSidebarActive: '#0ba4db',
        textSidebarIcon: '#eaf6fc',
        accentColor: '#3bb75e',
        accentColorHover: '#3ab75e',
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


