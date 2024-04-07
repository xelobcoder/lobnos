import { ExpandLessRounded, NewReleases } from "@mui/icons-material"
import AppCustomLayout from "../Layout/CustomLayout"

export default function ExpenseLayout({ children }) {
  const sideLinks = [
    { title: "expenses", link: "/expense", icon: <ExpandLessRounded /> },
    { title: "new Expense", link: "/expense/newExpense", icon: <NewReleases /> },
    
  ]
  return (
    <>
      <AppCustomLayout sideLinks={sideLinks}>{children}</AppCustomLayout>
    </>
  )
}
