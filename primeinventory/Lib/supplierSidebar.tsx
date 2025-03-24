import { SidebarLinkType } from "../components/interfaces/departmentInterface";

export const supplierSideBar: SidebarLinkType[] = [{
    subLinks: [
        { title: "Purchase Management", link: "/purchasemanagement" },
        { title: "place stock order", link: "/purchasemanagement/placeorder" },
        { title: "New Supplier", link: "/purchasemanagement/suppliers/newsuppliers" },
        { title: "Product Suppliers", link: "/purchasemanagement/suppliers" },
    ],
    title: "Purchase Management",
    link: "/purchasemanagement"
}
];