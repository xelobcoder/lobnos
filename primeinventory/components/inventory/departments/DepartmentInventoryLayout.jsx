import { ExpandCircleDown, FactCheck, GetApp, Inventory, Pending, ShoppingBasket, TransferWithinAStation } from "@mui/icons-material";
import AppCustomLayout from "../../Layout/CustomLayout";
import { useRouter } from "next/router";
export default function DepartmentInventoryLayout({ children }) {
  const departmentId = useRouter().query.id;

  const sidebarLinks = [
    { title: "Department stocks", link: `/inventory/department/${departmentId}`, icon: <Inventory /> },
    { title: "Expired stocks", link: `/inventory/department/${departmentId}/expiredstocks`, icon: <ExpandCircleDown /> },
    { title: "Stocks usage Analytics", link: `/inventory/department/${departmentId}/stockusage`, icon: <Inventory /> },
    { title: "Wastage Analytics", link: `/inventory/department/${departmentId}/wastage`, icon: <Inventory /> },
    { title: "Pending Requests", link: `/inventory/department/${departmentId}/pending`, icon: <Pending /> },
    { title: "Accepted Requests", link: `/inventory/department/${departmentId}/accepted`, icon: <FactCheck /> },
    { title: "Receive stocks", link: `/inventory/department/${departmentId}/receive`, icon: <GetApp /> },
    { title: "Place order", link: `/inventory/department/${departmentId}/request`, icon: <ShoppingBasket /> },
    { title: "Transfer stock", link: "/supplier/purchases", icon: <TransferWithinAStation /> },
    { title: "Stock", link: "/inventory", icon: null },
  ];

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  );
}
