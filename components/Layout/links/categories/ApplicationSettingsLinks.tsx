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
    RiShieldLine
} from '@remixicon/react';

export const ApplicationSettingsLinks: Link[] =
    [
        {
            title: "User Management",
            link: "",
            icon: <RiUserSettingsLine />,
            children: [
                { title: "Users", link: "/authentication/users", icon: <RiUserSettingsLine /> },
                { title: "Departments", link: "/settings/departments", icon: <RiGroupLine /> }
            ]
        },
        {
            title: "Organization",
            link: "",
            icon: <RiBuildingLine />,
            children: [
                { title: "Company Info", link: "/settings/companyprofile", icon: <RiBuildingLine /> },
                { title: "Branches", link: "/settings/branches", icon: <RiBuilding2Line /> },
                { title: "Taxes", link: "/settings/tax", icon: <RiMoneyDollarCircleLine /> }
            ]
        },
        {
            title: "Laboratory",
            link: "",
            icon: <RiTestTubeLine />,
            children: [
                { title: "Sample Types", link: "/settings/applicationsettings/testpanels/sampletypes", icon: <RiTestTubeLine /> },
                { title: "Test Panels", link: "/settings/applicationsettings/testpanels/testlist", icon: <RiListCheck2 /> },
                { title: 'Sample Container', link: '/settings/applicationsettings/sample-containers', icon: <RiSteamLine /> },
                { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <RiFileListLine /> },
                { title: "Result Entry Settings", link: "/settings/applicationsettings/resultentrysettings", icon: <RiFileTextLine /> },
                { title: "Report Settings", link: "/settings/applicationsettings/reportSettings", icon: <RiFileTextLine /> }
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
                { title: "Services", link: "/settings/additionalservices", icon: <RiCustomerService2Line /> },
                { title: 'Billing Strategy', link: '/billing/billing-strategy/strategies', icon: <RiStarHalfLine /> },
                { title: 'Insurance Companies', link: '/billing/insurance', icon: <RiGitRepositoryFill /> }
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
            title: "Records Settings",
            link: "",
            icon: <RiFileListLine />,
            children: [
                { title: "Record Management", link: "/settings/records", icon: <RiFileListLine /> },
                { title: "Result Accessibility", link: "/settings/records/result-accessible-settings", icon: <RiEyeLine /> },
                { title: "Result Access Requests", link: "/settings/records/result-access-requests", icon: <RiListCheck2 /> },
                { title: "Data Backup & Restore", link: "/settings/records/data-backup-restore", icon: <RiShieldCheckLine /> },
                { title: "Backup Security", link: "/settings/records/backup-security", icon: <RiShieldLine /> },
            ]
        },
        { title: "Email Management", link: "/crm/customers/send-email", icon: <RiMailSettingsLine /> }
    ];