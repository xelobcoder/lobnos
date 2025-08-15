export const store = {
    user: {
        employeeid: 3,
        username: "Mr Tiifu Hamza",
        token: "7uduu",
        role: "admin",
    },
    company: 'VITALSCAN LABORATORY AND DIAGNOSTIC CENTRE',
    branchid: 32,
    tenantId: 3,
    loginDuration: 6,
    daysToExpiration: 200,
    maximumUsers: 3,
    customization: {
        decimalPlaces: 3,
        headerColor: '#3bb75e', // default healthcare green
        headerGradient: 'linear-gradient(90deg, #3bb75e 0%, #0ba4db 100%)',
        sidebarColor: '#3ab75e', // Updated to preferred healthcare green
        sidebarGradient: '#3bb75e',
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
};


