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
    RiBuildingFill
} from '@remixicon/react';

export const ApplicationSettingsLinks :Link[] = 
     [
        { title: "Applications Settings", link: "/settings/applicationsettings", icon: <RiSettings4Line /> },
        { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <RiFileListLine /> },
        { title: "Result Entry Settings", link: "/settings/applicationsettings/resultEntrySettings", icon: <RiFileTextLine /> },
        { title: "Users", link: "/authentication/users", icon: <RiUserSettingsLine /> },
        { title: "Branches", link: "/settings/branches", icon: <RiBuilding2Line /> },
        { title: "Sample Types", link: "/settings/testpanel/sampletypes", icon: <RiTestTubeLine /> },
        { title: "Company Info", link: "/settings/companyprofile", icon: <RiBuildingLine /> },
        { title: "Departments", link: "/settings/department", icon: <RiGroupLine /> },
        { title: "Taxes", link: "/settings/tax", icon: <RiMoneyDollarCircleLine /> },
        { title: "Test Panels", link: "/settings/testpanel/testlist", icon: <RiListCheck2 /> },
        { title: "Services", link: "/settings/additionalservices", icon: <RiCustomerService2Line /> },
        { title: "Email Management", link: "/settings/emailsetting", icon: <RiMailSettingsLine /> },
        { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView', icon: <RiMedicineBottleLine /> },
        { title: 'Drugs List', link: '/settings/applicationsettings/drugs', icon: <RiMedicineBottleFill /> },
        { title: 'New Organization', link: '/settings/outsource/newOutsourcing', icon: <RiBuildingFill /> },
        { title: 'Outsourcing List', link: '/settings/outsource', icon: <RiBuilding2Line /> } // Changed from RiBuildings2Line to RiBuilding2Line
    ];