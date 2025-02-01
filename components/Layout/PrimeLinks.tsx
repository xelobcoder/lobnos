interface Link {
    icon: HTMLElement
    title: string;
    link: string
    subLinks: { title: string, link: string }[];
}

const Icon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
        <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12.5 7C14.433 7 16 8.567 16 10.5C16 11.7668 15.327 12.8763 14.3191 13.4907L16.869 17H14.397L12.217 14H10V17H8V7H12.5ZM12.5 9H10V12H12.5C13.2797 12 13.9204 11.4051 13.9931 10.6445L14 10.5C14 9.67157 13.3284 9 12.5 9Z"></path>
    </svg>
);


export const FinancialDataKeys = [
    {
        title: "Sales Overview",
        icon: Icon,
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
        icon: Icon,
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
        icon: Icon,
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
        icon: Icon,
        subLinks: []
    },
    {
        title: "Service Costs",
        icon: Icon,
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
        icon: Icon,
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
    }
];

export const links: Link = [
    ...FinancialDataKeys,
    {
        title: "Phelobotomy",
        icon: Icon,
        link: '/operations/laboratory/phelobotomy',
        subLinks: [
            { title: "Phlebotomy", link: "/operations/laboratory/phelobotomy" },
            { title: "Rejected Samples", link: "/operations/laboratory/phelobotomy/rejectedsamples" },
            { title: "Analytics", link: "/operations/laboratory/phelobotomy/analytics" },
        ]
    },
    {
        title: "Ultrasound Operations",
        icon: Icon,
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
        icon: Icon,
        link: '/operations/laboratory/validated',
        subLinks: [
            {
                title: "Sample Validation",
                link: "/operations/laboratory/sample/validation"
            },
            {
                title: "Operations",
                link: "/operations/laboratory"
            },
            {
                title: "Processing stage",
                link: "/operations/laboratory/processing"
            },
            {
                title: "Completed stage",
                link: "/operations/laboratory/completed"
            },
            {
                title: "Validation stage",
                link: "/operations/laboratory/validation"
            },
            {
                title: "Validated Result",
                link: "/operations/laboratory/validated"
            },
            {
                title: "Critical Values Alert",
                link: "/operations/laboratory/criticalvaluesAlert"
            },
            {
                title: "Turn around Time",
                link: "/operations/laboratory/turnaroundtime"
            },
            {
                title: "Stock Management",
                link: "/operations/laboratory/stockmanagement",
                subLinks: [
                    {
                        title: "Ascension Stock Deduction",
                        link: "/operations/laboratory/stockmanagement"
                    }
                ]
            }
        ]
    },
    {
        title: "SMS",
        icon: Icon,
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
        icon: Icon,
        link: "/registration",
        subLinks: []
    },
    {
        title: "Customers",
        icon: Icon,
        link: "/customers",
        subLinks: []
    },
    {
        title: "Billing",
        icon: Icon,
        link: "/billing/patientid",
        subLinks: []
    },
    {
        title: "Sales",
        icon: Icon,
        link: "/billing/salessummary",
        subLinks: []
    },
    {
        title: "Appointments",
        icon: Icon,
        link: "/appointments",
        subLinks: []
    },
    {
        title: "Doctors Portal",
        icon: Icon,
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
        icon: Icon,
        link: '/clincian',
        subLinks: [
            { title: "Clinicians", link: "/clinician" },
            { title: "Add New Clinician", link: "/clinician/new" },
        ]
    },
    {
        title: 'Settings',
        icon: Icon,
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
            {
                title: "Outsourcing", link: "/settings/outsource", subLinks: [
                    { title: 'New Organization', link: '/settings/outsource/newOutsourcing' },
                    { title: 'Outsourcing List', link: '/settings/outsource' }
                ]
            },
            {
                title: "Drugs", link: "/settings/applicationsettings/drugs", subLinks: [
                    { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView' },
                    { title: 'Drugs List', link: '/settings/applicationsettings/drugs' }
                ]
            },
            { title: "Email Management", link: "/settings/emailsetting" },
        ]
    }
];