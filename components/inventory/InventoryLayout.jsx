import AppCustomLayout from "../Layout/CustomLayout"
import {
  Analytics,
  ExpandCircleDownSharp,
  Inventory2,
  PushPinRounded,
  Settings,
  UnarchiveRounded,
  Warehouse,
  WaterDamage
} from "@mui/icons-material"
import GridViewIcon from "@mui/icons-material/GridView"
import DepartureBoardIcon from "@mui/icons-material/DepartureBoard"
export default function InventoryLayout({ children }) {
  const sidebarLinks = [
    { title: "Stocks", link: "/inventory", icon: <GridViewIcon fontSize="small" /> },
    {
      title: "Expires Stocks",
      link: "/inventory/expirestocks",
      icon: <ExpandCircleDownSharp fontSize="small" />,
    },
    { title: "Instocks", link: "/inventory/stocks", icon: <UnarchiveRounded fontSize="small" /> },
    {
      title: "General Store",
      link: "/inventory/stocksrequest",
      icon: <DepartureBoardIcon fontSize="small" />,
    },
    {
      title: "Dispatch Approved",
      link: "/inventory/stocksrequest/dispatch",
      icon: <Inventory2 fontSize="small" />,
    },
    { title: "Warehouse", link: "/inventory/warehouse", icon: <Warehouse /> },
    { title: "Inventory Analytics", link: "/inventory/analytics", icon: <Analytics /> },
    { title: "Wastage Analytics", link: "/inventory/analytics/wastage", icon: <WaterDamage /> },
    { title: "PO to GRN", link: "/inventory/analytics/purchasesflow", icon: <PushPinRounded /> },
    { title: "Settings", link: "/inventory/settings", icon: <Settings /> },
  ]

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
