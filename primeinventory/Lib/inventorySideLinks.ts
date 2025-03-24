import { SidebarLinkType } from "../components/interfaces/departmentInterface";

export const sidebarLinks: SidebarLinkType[] = [
    {
        subLinks: [
            { title: "Purchase Management", link: "/purchasemanagement" },
            { title: "Place Stock Order", link: "/purchasemanagement/placeorder" },
            { title: "New Supplier", link: "/purchasemanagement/suppliers/newsuppliers" },
            { title: "Purchases Transactions", link: "/purchasemanagement/purchases" },
        ],
        title: "Purchase Management",
        link: "/purchasemanagement"
    },
    {
        subLinks: [
            { title: "Stock Details", link: "/inventory" },
            { title: "Stock Management", link: "/inventory/stocks" }
        ],
        title: "Stocks",
        link: "/inventory/stocks"
    },
    {
        subLinks: [
            { title: "Departments", link: "/inventory/department" },
            { title: "Department Analytics", link: "/inventory/department/analytics" }
        ],
        title: "Departments",
        link: "/inventory/departments"
    },
    {
        title: "Stock Request ",
        link: "/inventory/stockrequest"
    },
    {
        // subLinks: [
        //     { title: "Stock Details", link: "/inventory/stock-details" },
        //     { title: "Stock Management", link: "/inventory/stock-management" }
        // ],
        title: "Dispatch Approved",
        link: "/inventory/stockrequested/"
    },
    {
        title: "Warehouse",
        link: "/inventory/warehouse"
    },
    {
        subLinks: [
            { title: "Stock General receipt Note", link: "/inventory/analytics/purchasesflow" },
            { title: "Stock Consumption History", link: "/inventory/analytics/consumptionhx" },
            { title: "Stock Purchase Order History", link: "/inventory/analytics/stockpohistory" },
            { title: "Stock Requisition History", link: "/inventory/analytics/stockrequisitionhx" },
            { title: "Stock Management", link: "/inventory/stock-management" }
        ],
        title: "Inventory Analytics",
        link: "/inventory/analytics"
    },
    {
        subLinks: [
            { title: "Wastages Analytic", link: "/inventory/wastages" },
            { title: "Stock Management", link: "/inventory/stock-management" }
        ],
        title: "Wastage",
        link: "/inventory/wastage"
    },
    {
        subLinks: [
            {
                title: "Inventory Settings",
                link: "/inventory/settings"
            },
            {
                title: "Prime Lims Connection",
                link: "/inventory/settings/autolaboratorydeductions"
            }
        ],
        title: "Settings",
        link: "/inventory/settings"
    }
];