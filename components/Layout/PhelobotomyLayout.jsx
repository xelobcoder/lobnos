import AppCustomLayout from "./CustomLayout"
import { Analytics, Book, CalendarMonth } from "@mui/icons-material"
export default function PhelobotomyLayout({ children }) {
  const sidebarLinks = [
    { title: "Phlebotomy", link: "/phelobotomy", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M17 2V4H16V18C16 20.2091 14.2091 22 12 22C9.79086 22 8 20.2091 8 18V4H7V2H17ZM14 10H10V18C10 19.1046 10.8954 20 12 20C13.1046 20 14 19.1046 14 18V10ZM13 15C13.5523 15 14 15.4477 14 16C14 16.5523 13.5523 17 13 17C12.4477 17 12 16.5523 12 16C12 15.4477 12.4477 15 13 15ZM11 12C11.5523 12 12 12.4477 12 13C12 13.5523 11.5523 14 11 14C10.4477 14 10 13.5523 10 13C10 12.4477 10.4477 12 11 12ZM14 4H10V8H14V4Z"></path></svg> },
    { title: "Rejected Samples", link: "/phelobotomy/rejectedsamples", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 15H13V17H11V15ZM11 7H13V13H11V7Z"></path></svg> },
    { title: "Analytics", link: "/phelobotomy/analytics", icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M5 3V19H21V21H3V3H5ZM19.9393 5.93934L22.0607 8.06066L16 14.1213L13 11.121L9.06066 15.0607L6.93934 12.9393L13 6.87868L16 9.879L19.9393 5.93934Z"></path></svg> },
  ]
  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
