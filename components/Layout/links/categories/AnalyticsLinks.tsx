import { Link } from '../types';
import {
    RiUserHeartLine,
    RiTestTubeLine,
    RiUserAddLine,
    RiMoneyDollarCircleLine,
    RiBarChart2Line,
    RiLineChartLine,
    RiCalendarEventFill,
    RiScales2Fill,
    RiBarChartBoxLine,
    RiPriceTag3Line,
    RiUserLine,
    RiBuildingLine,
    RiCalendarLine,
    RiListCheck2,
    RiShoppingBagLine,
    RiExternalLinkLine,
    RiTimeLine,
    RiCalendarTodoLine,
    RiCalendarCheckLine,
    RiCalendarScheduleLine,
    RiTrophyLine,
    RiCalculatorLine,
    RiCalendarEventLine,
    RiErrorWarningLine,
    RiPhoneLine,
    RiCloseCircleLine
} from '@remixicon/react';




const analyticsPages = [
    {
        title: "Patient Dashboards",
        description: "Overview of key patient metrics and statistics",
        icon: <RiBarChartBoxLine size={24} />,
        link: "/analytics/patients/dashboards",
        color: "primary"
    },
    {
        title: "Age Distribution",
        description: "Patient distribution across different age groups",
        icon: <RiUserLine size={24} />,
        link: "/analytics/patients/age-distribution",
        color: "success"
    },
    {
        title: "Gender Distribution",
        description: "Patient gender breakdown and analysis",
        icon: <RiCalculatorLine size={24} />,
        link: "/analytics/patients/gender-distribution",
        color: "info"
    },
    {
        title: "Marital Status",
        description: "Marital status distribution of patients",
        icon: <RiUserLine size={24} />,
        link: "/analytics/patients/marital-status",
        color: "warning"
    },
    {
        title: "Registration Over Time",
        description: "Patient registration trends and patterns",
        icon: <RiCalendarEventLine size={24} />,
        link: "/analytics/patients/patient-registration-over-time",
        color: "secondary"
    },
    {
        title: "Occupation Distribution",
        description: "Patient occupations and employment analysis",
        icon: <RiBarChartBoxLine size={24} />,
        link: "/analytics/patients/occupation-distribution",
        color: "dark"
    },
    {
        title: "Missing Data Analysis",
        description: "Analysis of incomplete patient information",
        icon: <RiErrorWarningLine size={24} />,
        link: "/analytics/patients/missing-data-analysis",
        color: "danger"
    },
    {
        title: "Contact Completeness",
        description: "Patient contact information completion status",
        icon: <RiPhoneLine size={24} />,
        link: "/analytics/patients/contact-completeness",
        color: "success"
    },
    {
        title: "Registration by Day",
        description: "Weekly patient registration patterns",
        icon: <RiCalendarEventLine size={24} />,
        link: "/analytics/patients/registration-by-day",
        color: "info"
    }
];

export const AnalyticsLinks: Link[] = [
    {
        title: 'Patient Analytics', link: '/analytics/patients', icon: <RiUserHeartLine />,
        children: analyticsPages
    },
    { title: 'Leads Analytics', link: "/analytics/leads", icon: <RiUserAddLine /> },
    { title: 'Compliance Analytics', link: "/analytics/compliance", icon: <RiBarChart2Line /> },
    {
        title: 'Sales Analytics',
        link: "/analytics/sales",
        icon: <RiLineChartLine />,
        children: [
            { title: 'Daily Sales Trend', link: '/analytics/sales/dailySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Monthly Sales Trend', link: '/analytics/sales/monthlySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Sales By Week And Branch', link: '/analytics/sales/salesByWeekAndBranch', icon: <RiBuildingLine /> },
            { title: ' Sales By Employee', link: '/analytics/sales/totalSalesByEmployee', icon: <RiUserLine /> },
            { title: 'Sales By Clinician', link: '/analytics/sales/totalSalesByClinician', icon: <RiUserLine /> },
            { title: 'Sales By Organization', link: '/analytics/sales/totalSalesByOrganization', icon: <RiBuildingLine /> },
            { title: ' Sales By Outsourced Status', link: '/analytics/sales/totalSalesByOutsourcedStatus', icon: <RiPriceTag3Line /> },
            { title: ' Sales By Service Category', link: '/analytics/sales/totalSalesByServiceCategory', icon: <RiPriceTag3Line /> },
            { title: 'Weekly Sales Trend', link: '/analytics/sales/weeklySalesTrend', icon: <RiCalendarLine /> },
            { title: 'Yearly Sales Trend', link: '/analytics/sales/yearlySalesTrend', icon: <RiCalendarLine /> },
        {title:"Outstanding Breakdown",link:"/analytics/sales/outstanding-payments-breakdown", icon: <RiCalendarLine /> }
        ]
    },
    {
        title: 'Expenses Analytics',
        link: "/analytics/expenses",
        icon: <RiMoneyDollarCircleLine />,
        children: [
            {
                title: 'Expense Analytics',
                link: '/analytics/expenses',
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: 'Monthly Expenses',
                link: '/analytics/expenses/monthly-expenses',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Branch Monthly Expenses',
                link: '/analytics/expenses/branch-monthly-expenses',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Daily Expense Summary',
                link: '/analytics/expenses/daily-expense-summary',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Weekly Expense Summary',
                link: '/analytics/expenses/weekly-expense-summary',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Yearly Expense Summary',
                link: '/analytics/expenses/yearly-expense-summary',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Hourly Expense Summary',
                link: '/analytics/expenses/hourly-expense-summary',
                icon: <RiCalendarEventFill />
            },
            {
                title: 'Top Expense Categories',
                link: '/analytics/expenses/top-expense-categories',
                icon: <RiMoneyDollarCircleLine />
            },
            {
                title: 'Comparative Expense Analysis',
                link: '/analytics/expenses/comparison-by-period',
                icon: <RiBarChartBoxLine />
            },
            {
                title: "Top Expense Employees",
                link: "/analytics/expenses/top-expense-employees",
                icon: <RiUserLine />
            },
            {
                title: "Top Expense Merchants",
                link: "/analytics/expenses/top-expense-merchants",
                icon: <RiShoppingBagLine />
            },
            {
                title: 'Expense Payment Status',
                link: '/analytics/expenses/expense-payment-status',
                icon: <RiListCheck2 />
            },
            {
                title: 'Expense Buckets',
                link: '/analytics/expenses/expense-buckets',
                icon: <RiBarChartBoxLine />
            },
            {
                title: 'Expense Approval Timeline',
                link: '/analytics/expenses/expense-approval-timeline',
                icon: <RiTimeLine />
            },
            {
                title: 'Quarterly Expense Summary',
                link: '/analytics/expenses/quarterly-expense-summary',
                icon: <RiScales2Fill />
            },
            {
                title: 'Expense Growth Rate',
                link: '/analytics/expenses/expense-growth-rate',
                icon: <RiLineChartLine />
            },
            {
                title: 'Rejected Expenses',
                link: '/analytics/expenses/rejected',
                icon: <RiCloseCircleLine />
            }
        ]
    },
    {
        title: 'Results Analytics',
        link: "/analytics/resultanalysis/alltest",
        icon: <RiTestTubeLine />,
        children: [
            { title: 'All Test', link: '/analytics/resultanalysis/alltest', icon: <RiTestTubeLine /> }
        ]
    },
    {
        title: 'Outsourcing Analytics',
        link: "/analytics/outsourcing",
        icon: <RiExternalLinkLine />,
        children: [
            { title: 'Overview', link: '/analytics/outsourcing', icon: <RiListCheck2 /> },
            { title: 'Daily Analytics', link: '/analytics/outsourcing/daily', icon: <RiCalendarLine /> },
            { title: 'Monthly Analytics', link: '/analytics/outsourcing/monthly', icon: <RiCalendarEventFill /> },
            { title: 'Weekly Analytics', link: '/analytics/outsourcing/weekly', icon: <RiCalendarScheduleLine /> },
            { title: 'Quarterly Analytics', link: '/analytics/outsourcing/quarterly', icon: <RiCalendarTodoLine /> },
            { title: 'Yearly Analytics', link: '/analytics/outsourcing/yearly', icon: <RiCalendarCheckLine /> },
            { title: 'Top Facilities', link: '/analytics/outsourcing/top-facilities', icon: <RiTrophyLine /> },
            { title: 'Hourly Analytics', link: '/analytics/outsourcing/hourly', icon: <RiTimeLine /> }
        ]
    }
];