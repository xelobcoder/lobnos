import { AssignmentInd, House, Payment } from "@mui/icons-material"
import AppCustomLayout from "../Layout/CustomLayout"

export default function DashBoardLayoutSales({ children }) {
  const sidebarLinks = [
    { title: "Sales", link: "/dashboard", icon: <AssignmentInd /> },
    { title: "Organization", link: "/dashboard/organization", icon: <House /> },
    { title: "Expense", link: "/expense/expenseslist", icon:<Payment/>},
  ]

  return (
    <AppCustomLayout sideLinks={sidebarLinks} >
      {children}
    </AppCustomLayout>
  )
}
