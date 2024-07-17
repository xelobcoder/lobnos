import { List } from "@mui/icons-material";
import CartIconSvg from "../icons/cartIcon";
import InventoryIconSvg from "../icons/InventoryIcon";
import PurchaseIconSvg from "../icons/purchasesIcon";
import StackMenuIconSvg from "../icons/stackMenuIcon";
import AppCustomLayout from "../Layout/CustomLayout"
export default function SupplierLayout({ children }) {
  const sidebarLinks = [
    {
      title: "Suppliers",
      link: "/supplier",
      icon: <StackMenuIconSvg />,
    },
    {
      title: "Inventory",
      link: "/inventory",
      icon: <InventoryIconSvg />,
    },
    {
      title: "Place Order",
      link: "/supplier/placeorder",
      icon: <CartIconSvg />,
    },
    {
      title: "Purchases",
      link: "/supplier/purchases",
      icon: <PurchaseIconSvg />,
    },
    {
      title: "Transactions",
      link: "/supplier/transactions",
      icon: <List/>
    },
  ];

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
