import { Inventory, MoneyOffCsredRounded, OutboxRounded, Person, Storage } from "@mui/icons-material"
import AppCustomLayout from "../Layout/CustomLayout"
export default function SupplierLayout({ children }) {
  const sidebarLinks = [
    { title: "Suppliers", link: "/supplier", icon: <Person /> },
    { title: "Inventory", link: "/inventory", icon: <Inventory /> },
    { title: "Place Order", link: "/supplier/placeorder", icon: <OutboxRounded /> },
    { title: "Purchases", link: "/supplier/purchases", icon: <MoneyOffCsredRounded /> },
    { title: "Stock", link: "/inventory", icon: <Storage /> },
  ]

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
