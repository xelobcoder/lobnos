import AppCustomLayout from "./CustomLayout"
import { Analytics, Book, CalendarMonth } from "@mui/icons-material"
export default function PhelobotomyLayout({ children }) {
  const sidebarLinks = [
    { title: "Phlebotomy", link: "/phelobotomy", icon: <CalendarMonth /> },
    { title: "Rejected Samples", link: "/phelobotomy/rejectedsamples", icon: <Book /> },
    { title: "Analytics", link: "/phelobotomy/analytics", icon: <Analytics /> },
  ]
  return <AppCustomLayout sideLinks={sidebarLinks}>{children}</AppCustomLayout>
}
