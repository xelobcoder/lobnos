import { plsEncryption } from "@/lib/encryption";
import { 
    BarChart3, 
    Percent, 
    ExternalLink, 
    Activity, 
    DollarSign, 
    CreditCard, 
    LineChart,  
    Scan, 
    TestTube, 
    MessageSquare, 
    UserPlus, 
    Users, 
    Receipt, 
    TrendingUp, 
    Calendar, 
    Stethoscope, 
    UserCog, 
    Settings, 
    Pill, 
    Building 
} from "lucide-react";

interface Link {
    icon: any
    title: string;
    link: string
    subLinks: { title: string, link: string }[]
}

// Remove the generic icon
// const Icon = (...)

export const Mylinks = function (branchid: number): Link[] {
    const branchId = plsEncryption(branchid.toString());
    return [
        {
            title: "Sales Overview",
            icon: <BarChart3 />,
            link: "/sales/overview",
            subLinks: [
                {
                    title: "Total Sales by Service Category",
                    link: "/sales/totalSalesByServiceCategory?targetKey=0"
                },
                {
                    title: "Average Cost per Service",
                    link: "/sales/averageCostPerService?targetKey=1"
                },
                {
                    title: "Total Sales by Branch",
                    link: "/sales/totalSalesByBranch?targetKey=2"
                },
                {
                    title: "Total Sales by Clinician",
                    link: "/sales/totalSalesByClinician?targetKey=3"
                },
                {
                    title: "Total Sales by Organization",
                    link: "/sales/totalSalesByOrganization?targetKey=4"
                },
                {
                    title: "Total Sales by Registration Type",
                    link: "/sales/totalSalesByRegistrationType?targetKey=5"
                }
            ]
        },
        {
            title: "Tax and Discount Overview",
            icon: <Percent />,
            link: "/sales/tax-discount-overview",
            subLinks: [
                {
                    title: "Total Tax by Service Category",
                    link: "/sales/totalTaxByServiceCategory?targetKey=15"
                },
                {
                    title: "Sales with Highest Tax Included",
                    link: "/sales/salesWithHighestTaxIncluded?targetKey=18"
                },
                {
                    title: "Total Discount by Branch",
                    link: "/sales/totalDiscountByBranch?targetKey=20"
                },
                {
                    title: "Average Discount per Service",
                    link: "/sales/averageDiscountPerService?targetKey=21"
                },
                {
                    title: "Total Discount by Clinician",
                    link: "/sales/totalDiscountByClinician?targetKey=22"
                }
            ]
        },
        {
            title: "Outsourced Services",
            icon: <ExternalLink />,
            link: "/sales/outsourced-services",
            subLinks: [
                {
                    title: "Total Sales from Outsourced Services",
                    link: "/sales/totalSalesFromOutsourcedServices?targetKey=34"
                },
                {
                    title: "Sales from Outsourced by Branch",
                    link: "/sales/salesFromOutsourcedByBranch?targetKey=35"
                },
                {
                    title: "Number of Outsourced Services by Org",
                    link: "/sales/numberOfOutsourcedServicesByOrg?targetKey=36"
                }
            ]
        },
        {
            title: 'Customers Vital signs',
            link: "/customers/recordVitalSigns",
            icon: <Activity />,
            subLinks: []
        },
        {
            title: "Service Costs",
            icon: <DollarSign />,
            link: "/sales/service-costs",
            subLinks: [
                {
                    title: "Max and Min Service Costs",
                    link: "/sales/maxAndMinServiceCosts?targetKey=37"
                },
                {
                    title: "Service Cost by Category",
                    link: "/sales/serviceCostByCategory?targetKey=38"
                },
                {
                    title: "Cost Breakdown by Clinician",
                    link: "/sales/costBreakdownByClinician?targetKey=39"
                }
            ]
        },
        {
            title: "Transaction Overview",
            icon: <CreditCard />,
            link: "/sales/transactions-overview",
            subLinks: [
                {
                    title: "Number of Transactions by Branch",
                    link: "/sales/numberOfTransactionsByBranch?targetKey=40"
                },
                {
                    title: "Total Sales by Transaction ID",
                    link: "/sales/totalSalesByTransactionId?targetKey=41"
                },
                {
                    title: "Transaction Count by Employee",
                    link: "/sales/transactionCountByEmployee?targetKey=42"
                },
                {
                    title: "Total Sales and Transactions by Date",
                    link: "/sales/totalSalesAndTransactionsByDate?targetKey=43"
                }
            ]
        },
        {
            title: 'Analytics',
            link: '/analytics',
            icon: <LineChart />,
            subLinks: [
                { title: 'Patient Analytics', link: '/dashboard/analytics/patients' },
                {
                    title: 'Clinicians Analytics', link: "/dashboard/analytics/clinicians"
                },
                {
                    title: 'Phelobotomy Analytics', link: "/operations/laboratory/phelobotomy/analytics"
                }
            ]
        },
        {
            title: "Ultrasound Operations",
            icon: <Scan />,
            link: '/operations/imaging/ultrasound',
            subLinks: [
                { title: 'Waiting List', link: '/operations/imaging/ultrasound' },
                { title: 'Processed List', link: '/operations/imaging/ultrasound/processedlist' },
                { title: 'Analytics', link: '/operations/imaging/ultrasound/analytics' },
                { title: 'Create Templates', link: '/operations/imaging/ultrasound/templates' },
                { title: 'Ultrasound Templates', link: '/operations/imaging/ultrasound/templates/list' },
            ]
        },
        {
            title: 'Laboratory Operations',
            icon: <TestTube />,
            link: '${/operations/laboratory/validated',
            subLinks: [
                { title: "Phlebotomy", link: "/operations/laboratory/phelobotomy" },
                { title: "Rejected Samples", link: "/operations/laboratory/phelobotomy/rejectedsamples" },
                { title: "Analytics", link: "/operations/laboratory/phelobotomy/analytics" },
                {
                    title: "Sample Validation",
                    link: `/operations/laboratory/sample/validation`
                },
                {
                    title: "Processing stage",
                    link: `/operations/laboratory/processing`
                },
                {
                    title: "Completed stage",
                    link: `/operations/laboratory/completed`
                },
                {
                    title: "Validation stage",
                    link: `/operations/laboratory/validation`
                },
                {
                    title: "Validated Result",
                    link: `/operations/laboratory/validated`
                },
                {
                    title: "Critical Values Alert",
                    link: `/operations/laboratory/criticalvaluesAlert`
                },
                {
                    title: "Turn around Time",
                    link: `/operations/laboratory/turnaroundtime`
                },
                {
                    title: "Stock Management",
                    link: `/operations/laboratory/stockmanagement`,
                }
            ]
        },
        {
            title: "SMS",
            icon: <MessageSquare />,
            link: "/sms",
            subLinks: [
                { title: "Schedule SMS Campaign", link: "/sms/schedule-sms-campaign" },
                { title: "Create SMS Template", link: "/sms/create-sms-templates" },
                { title: "SMS logs", link: "/sms/smslogs" },
                { title: "SMS Templates", link: "/sms/sms-templates" },
                { title: "SMS Messages", link: "/sms/smsmessages" },
                { title: "UnResolved Messages", link: "/sms/smsmessages/unresolved" }
            ]
        },
        {
            title: "Registration",
            icon: <UserPlus />,
            link: "/registration",
            subLinks: []
        },
        {
            title: "Customers",
            icon: <Users />,
            link: "/customers",
            subLinks: []
        },
        {
            title: "Billing",
            icon: <Receipt />,
            link: "/billing/patientid",
            subLinks: [
                { title: 'Filter Client ', link: '/billing/patientid' },
                { title: 'packages', link: '/billing/packages/create-new-package' }, { title: 'Bill settings Night Adjustment', link: '/billing/settings/night-adjustments' },
                { title: 'Daily Transactions', link: '/billing/sales/branches' },
                { title: "Refund Admin", link: "/billing/refund/refundAdmin" },
                { title: "Refund FrontDesk Representative", link: "/billing/refund" }
            ]
        },
        {
            title: "Sales",
            icon: <TrendingUp />,
            link: "/billing/salessummary",
            subLinks: [

            ]
        },
        {
            title: "Appointments",
            icon: <Calendar />,
            link: "/appointments",
            subLinks: [
                { title: 'Appointments Calender', link: '/appointments' },
                { title: 'Bok Appointment', link:'/appointments/book'},
                { title: 'Create Tasks', link: '/appointments/tasks/create-new-tasks' },
                { title: 'Create Attendance', link: '/appointments/attendance/create-attendance' },
                {
                    title: "Create Shifts", link: "/appointments/attendance/create-shifts"
                },
                {
                    title: "Tasks", link:'/appointments/taskmanagement/task-list'
                },
                {
                    title: "Create New Tasks", link: "/appointments/taskmanagement/create-new-tasks"
                }
            ]
        },
        {
            title: "Doctors Portal",
            icon: <Stethoscope />,
            link: "/doctor/consultation",
            subLinks: [
                { title: 'Consulations', link: '/doctor/consultation/allconsultations' },
                { title: "Consult", link: '/doctor/consultation' },
                {
                    title: 'Pending Consultations', link: "/doctor/consultation/clients/pending"
                }
            ]
        },
        {
            title: "Clinicians",
            icon: <UserCog />,
            link: '/clincian',
            subLinks: [
                { title: "Clinicians", link: "/clinician" },
                { title: "Add New Clinician", link: "/clinician/new" },
            ]
        },
        {
            title: 'Settings',
            icon: <Settings />,
            link: '/settings',
            subLinks: [
                { title: "Applications Settings", link: "/settings/applicationsettings" },
                { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields" },
                { title: "Result Entry Settings", link: "/settings/applicationsettings/resultEntrySettings" },
                { title: "Users", link: "/authentication/users" },
                { title: "Branches", link: "/settings/branches" },
                { title: "Sample Types", link: "/settings/testpanel/sampletypes" },
                { title: "Company Info", link: "/settings/companyprofile" },
                { title: "Departments", link: "/settings/department" },
                { title: "Taxes", link: "/settings/tax" },
                { title: "Test Panels", link: "/settings/testpanel/testlist" },
                { title: "Services", link: "/settings/additionalservices" },


                { title: "Email Management", link: "/settings/emailsetting" },

            ]
        },
        {
            title: "Drugs", 
            link: "/settings/applicationsettings/drugs", 
            icon: <Pill />, 
            subLinks: [
                { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView' },
                { title: 'Drugs List', link: '/settings/applicationsettings/drugs' }
            ]
        },
        {
            title: "Outsourcing", 
            link: "/settings/outsource", 
            icon: <Building />,
            subLinks: [
                { title: 'New Organization', link: '/settings/outsource/newOutsourcing' },
                { title: 'Outsourcing List', link: '/settings/outsource' }
            ]
        },
    ];
}