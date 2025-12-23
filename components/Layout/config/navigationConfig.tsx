import {
    RiDashboardLine,
    RiUserAddLine,
    RiUserStarLine,
    RiMoneyDollarBoxLine,
    RiCalendarLine,
    RiBuildingLine,
    RiTeamLine,
    RiGridLine,
    RiPriceTag3Line,
    RiCalendarTodoLine,
    RiBarChartBoxLine,
    RiTestTubeLine,
    RiHospitalLine,
    RiErrorWarningLine,
    RiFileTextLine,
    RiFlaskLine,
    RiFileList3Line,
    RiStethoscopeLine,
    RiUserHeartLine,
    RiMedicineBottleLine,
    RiShoppingCart2Line,
    RiFileChartLine,
    RiSettings3Line,
    RiTruckLine,
    RiWalletLine,
    RiShoppingBagLine,
    RiBoxingLine
} from '@remixicon/react';

export interface NavigationItem {
    title: string;
    icon: React.ReactNode;
    link?: string;
    children?: NavigationItem[];
    badge?: string;
    divider?: boolean;
}

export interface NavigationCategory {
    category: string;
    items: NavigationItem[];
}

export const navigationConfig: NavigationCategory[] = [
    {
        category: "Dashboard",
        items: [
            {
                title: "Overview",
                icon: <RiDashboardLine size={20} />,
                link: "/dashboard"
            }
        ]
    },
    {
        category: "Front Desk",
        items: [
            {
                title: "Patient Registration",
                icon: <RiUserAddLine size={20} />,
                link: "/registration"
            },
            {
                title: "Customers",
                icon: <RiUserStarLine size={20} />,
                link: "/customers"
            },
            {
                title: "Appointments",
                icon: <RiCalendarLine size={20} />,
                link: "/appointments"
            },
            {
                title: "Billing",
                icon: <RiMoneyDollarBoxLine size={20} />,
                children: [
                    {
                        title: "Payment",
                        icon: <RiWalletLine size={18} />,
                        link: "/billing/payment"
                    },
                    {
                        title: "Sales Summary",
                        icon: <RiBarChartBoxLine size={18} />,
                        link: "/billing/salessummary"
                    },
                    {
                        title: "Daily Summary",
                        icon: <RiCalendarTodoLine size={18} />,
                        link: "/billing/salessummary/daily"
                    }
                ]
            }
        ]
    },
    {
        category: "Laboratory Operations",
        items: [
            {
                title: "Operations",
                icon: <RiFlaskLine size={20} />,
                children: [
                    {
                        title: "Laboratory",
                        icon: <RiTestTubeLine size={18} />,
                        link: "/operations/laboratory"
                    },
                    {
                        title: "Archive Results",
                        icon: <RiFileTextLine size={18} />,
                        link: "/operations/laboratory/patientarchives"
                    }
                ]
            },
            {
                title: "Phlebotomy",
                icon: <RiHospitalLine size={20} />,
                link: "/phelobotomy"
            },
            {
                title: "Sample Management",
                icon: <RiTestTubeLine size={20} />,
                children: [
                    {
                        title: "Sample Validation",
                        icon: <RiTestTubeLine size={18} />,
                        link: "/sample"
                    },
                    {
                        title: "Rejected Samples",
                        icon: <RiErrorWarningLine size={18} />,
                        link: "/sample/rejected"
                    }
                ]
            },
            {
                title: "Results",
                icon: <RiGridLine size={20} />,
                link: "/registration/ready"
            }
        ]
    },
    {
        category: "Clinical Management",
        items: [
            {
                title: "Clinicians",
                icon: <RiTeamLine size={20} />,
                link: "/clinician"
            },
            {
                title: "Organizations",
                icon: <RiBuildingLine size={20} />,
                link: "/organization"
            },
            {
                title: "Test Price List",
                icon: <RiPriceTag3Line size={20} />,
                link: "/pricelist"
            }
        ]
    },
    {
        category: "Expense Management",
        items: [
            {
                title: "Expenses",
                icon: <RiShoppingCart2Line size={20} />,
                link: "/expense"
            },
            {
                title: "Expense Categories",
                icon: <RiBoxingLine size={20} />,
                link: "/expense/category"
            },
           
            {
                title:"New Expense",
                icon:<RiMoneyDollarBoxLine size={20} />,
                link:"/expense/newExpense"
            }
        ]
    },
    {
        category: "Administration",
        items: [
            {
                title: "Settings",
                icon: <RiSettings3Line size={20} />,
                children: [
                    {
                        title: "General Settings",
                        icon: <RiSettings3Line size={18} />,
                        link: "/settings"
                    },
                    {
                        title: "User Management",
                        icon: <RiTeamLine size={18} />,
                        link: "/administration/users"
                    },
                    {
                        title: "System Config",
                        icon: <RiSettings3Line size={18} />,
                        link: "/settings/system"
                    }
                ]
            }
        ]
    }
];
