// import { Inventory, MoneyOffCsredRounded, OutboxRounded, Person, Storage } from "@mui/icons-material"
import DefaultSvg from "../icons/Default"
import AppCustomLayout from "../Layout/CustomLayout"
export default function SupplierLayout({ children }) {
  const sidebarLinks = [
    { title: "Suppliers", link: "/supplier", icon: <DefaultSvg/>  },
    { title: "Inventory", link: "/inventory", icon: <DefaultSvg/>  },
    { title: "Place Order", link: "/supplier/placeorder", icon: <DefaultSvg/>  },
    { title: "Purchases", link: "/supplier/purchases", icon: <DefaultSvg/> },
    { title: "Stock", link: "/inventory", icon: <DefaultSvg/>},
  ]

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
