import { RiTimeLine } from '@remixicon/react';
import { Link } from '../types';
import {
    RiSettings4Line,
    RiFileListLine,
    RiFileTextLine,
    RiUserSettingsLine,
    RiBuilding2Line,
    RiTestTubeLine,
    RiBuildingLine,
    RiGroupLine,
    RiMoneyDollarCircleLine,
    RiListCheck2,
    RiCustomerService2Line,
    RiMailSettingsLine,
    RiMedicineBottleLine,
    RiMedicineBottleFill,
    RiBuildingFill,
    RiGitRepositoryFill,
    RiStarHalfLine,
    RiGift2Line,
    RiSteamLine,
    RiEyeLine,
    RiShieldCheckLine,
    RiShieldLine,
    RiMoonClearLine,
    RiUserHeartLine,
    RiMessage2Line
} from '@remixicon/react';

export const ApplicationSettingsLinks: Link[] =
    [
        {
            title: "Platform Administration",
            link: "",
            icon: <RiShieldLine />,
            roles: ['super-admin', 'super_admin', 'super admin', 'superadmin'],
            children: [
                { title: "Client provisioning", link: "/settings/facilities", icon: <RiBuilding2Line /> },
                { title: "Website applications", link: "/settings/facilities/applications", icon: <RiBuilding2Line /> },
                { title: "Client payments", link: "/settings/facilities/payments", icon: <RiBuilding2Line /> },
                { title: "Client SMS configuration", link: "/settings/facilities/sms", icon: <RiBuilding2Line /> },
                { title: "Medical Device Interfacing", link: "/settings/facilities/devices", icon: <RiSettings4Line /> },
                { title: "Client audit logs", link: "/settings/facilities/audit", icon: <RiBuilding2Line /> }
            ]
        },
        {
            title: "User Management",
            link: "",
            icon: <RiUserSettingsLine />,
            children: [
                { title: "Users", link: "/authentication/users", icon: <RiUserSettingsLine /> },
                { title: "Departments", link: "/settings/departments", icon: <RiGroupLine /> },
                { title: "Login History", link: "/authentication/users-login-history", icon: <RiUserSettingsLine /> }
            ]
        },
        {
            title: "Organization",
            link: "",
            icon: <RiBuildingLine />,
            children: [
                { title: "Company Info", link: "/settings/companyprofile", icon: <RiBuildingLine /> },
                { title: "Application Settings", link: "/settings/applicationsettings", icon: <RiSettings4Line /> },
                { title: "Expense Controls", link: "/accounting/expense-controls", icon: <RiShieldCheckLine />, roles: ['admin', 'super-admin', 'super_admin'] },
                { title: "Referral Codes", link: "/settings/applicationsettings/referral-codes", icon: <RiGift2Line />, roles: ['admin', 'super-admin', 'super_admin'] },
                { title: "Patient Portal", link: "/settings/applicationsettings/patient-portal", icon: <RiUserHeartLine />, roles: ['admin', 'manager', 'super-admin', 'super_admin'] },
                { title: "Branches", link: "/settings/branches", icon: <RiBuilding2Line /> },
                { title: "Taxes", link: "/settings/tax", icon: <RiMoneyDollarCircleLine /> },
                { title: "Online Payments", link: "/settings/payment-gateways", icon: <RiMoneyDollarCircleLine />, roles: ['admin', 'super-admin', 'super_admin', 'accountant'] }
            ]
        },
        {
            title: "Commission Settings",
            link: "",
            icon: <RiMoneyDollarCircleLine />,
            children: [
                {
                    title: "Configurations",
                    link: "/settings/applicationsettings/commisions-defaults/commissions/configs",
                },
                {
                    title: "Assignments",
                    link: "/settings/applicationsettings/commisions-defaults/commissions/assignments",
                },
                {
                    title: "Defaults",
                    link: "/settings/applicationsettings/commisions-defaults",
                },
            ]

        },
        {
            title: "Laboratory",
            link: "",
            icon: <RiTestTubeLine />,
            children: [
                { title: "Sample Types", link: "/settings/applicationsettings/testpanels/sampletypes", icon: <RiTestTubeLine /> },
                { title: "Test Panels", link: "/settings/applicationsettings/testpanels/testlist", icon: <RiListCheck2 /> },
                { title: "Customizations", link: "/settings/applicationsettings/customization", icon: < RiTestTubeLine /> },
                { title: 'Sample Container', link: '/settings/applicationsettings/sample-containers', icon: <RiSteamLine /> },
                { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <RiFileListLine /> },
                { title: "Result Entry Settings", link: "/settings/applicationsettings/resultentrysettings", icon: <RiFileTextLine /> },
                { title: "Report Settings", link: "/settings/applicationsettings/reportSettings", icon: <RiFileTextLine /> },
                { title: "sales session management", link: "/settings/applicationsettings/sales-session-manager", icon: <RiMoneyDollarCircleLine /> },
                { title: "Update Test Prices Bulk", link: "/settings/applicationsettings/testpanels/pricing", icon: <RiSettings4Line /> }

            ]
        },
        {
            title: "Outsourcing",
            link: "",
            icon: <RiBuildingFill />,
            children: [
                { title: 'New Outsourcing Organization', link: '/settings/outsource/new-outsourcing', icon: <RiBuildingFill /> },
                { title: 'Outsourcing List', link: '/settings/outsource', icon: <RiBuilding2Line /> }
            ]
        },
        {
            title: "Billing & Services",
            link: "",
            icon: <RiMoneyDollarCircleLine />,
            children: [
                { title: "Discount Limits", link: "/settings/applicationsettings/discount-limits", icon: <RiMoneyDollarCircleLine /> },
                { title: "Services", link: "/settings/additionalservices", icon: <RiCustomerService2Line /> },
                { title: 'Billing Strategy', link: '/billing/billing-strategy/strategies', icon: <RiStarHalfLine /> },
                { title: 'Insurance Companies', link: '/billing/insurance', icon: <RiGitRepositoryFill /> },
                { title: 'Free Service Authorization', link: '/billing/admin/free-service-authorization-approval', icon: <RiShieldCheckLine /> },
                { title: "Time Based Adjustment", link: "/settings/applicationsettings/time-adjustments", icon: <RiTimeLine /> },
                { title: "commisions-defaults", link: "/settings/applicationsettings/commisions-defaults", icon: <RiMailSettingsLine /> }
            ]
        },
        {
            title: "Drugs & Pharmacy",
            link: "",
            icon: <RiMedicineBottleLine />,
            children: [
                { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView', icon: <RiMedicineBottleLine /> },
                { title: 'Drugs List', link: '/settings/applicationsettings/drugs', icon: <RiMedicineBottleFill /> }
            ]
        },
        {
            title: "Marketing",
            link: "",
            icon: <RiGift2Line />,
            children: [
                { title: 'Promo Codes', link: '/settings/promos/promo-code-generation', icon: <RiGift2Line /> },
                { title: 'Campaigns', link: '/settings/promos/campaign-creation', icon: <RiGift2Line /> }
            ]
        },
        {
            title: "Communications",
            link: "",
            icon: <RiMailSettingsLine />,
            roles: ['admin', 'manager', 'super-admin', 'super_admin'],
            children: [
                { title: "Email Overview", link: "/email-services", icon: <RiMailSettingsLine /> },
                { title: "Email Providers", link: "/email-services/providers", icon: <RiSettings4Line /> },
                { title: "Email Notification Events", link: "/email-services/notifications/events", icon: <RiFileTextLine /> },
                { title: "Email Queue", link: "/email-services/queue", icon: <RiListCheck2 /> },
                { title: "SMS Dashboard", link: "/communications/sms/dashboard", icon: <RiMessage2Line /> },
                { title: "SMS Templates", link: "/communications/sms/templates", icon: <RiFileTextLine /> }
            ]
        },
        {
            title: "Records Settings",
            link: "",
            icon: <RiFileListLine />,
            children: [
                { title: "Result Accessibility", link: "/settings/records/result-accessible-settings", icon: <RiEyeLine /> },
                { title: "Result Access Requests", link: "/settings/records/result-access-requests", icon: <RiListCheck2 /> },
                { title: "Data Backup & Restore", link: "/settings/records/data-backup-restore", icon: <RiShieldCheckLine /> },
                { title: "Backup Security", link: "/settings/records/backup-security", icon: <RiShieldLine /> },
            ]
        },

    ];