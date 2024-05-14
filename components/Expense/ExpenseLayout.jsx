import { CategoryOutlined, ExpandLessRounded, NewReleases, RequestPage } from "@mui/icons-material"
import AppCustomLayout from "../Layout/CustomLayout"

export default function ExpenseLayout({ children }) {
  const sideLinks = [
    { title: "expenses", link: "/expense", icon: <ExpandLessRounded /> },
    { title: "expense category", link: "/expense/category", icon: <CategoryOutlined /> },
    { title: "new Expense", link: "/expense/newExpense", icon: <NewReleases /> },
    { title: "New Expense Request", link: "/expense/request", icon: <RequestPage /> },
  ]
  return (
    <>
      <AppCustomLayout sideLinks={sideLinks}>{children}</AppCustomLayout>
    </>
  )
}
