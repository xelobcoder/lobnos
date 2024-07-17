import AuthContext from "../Auth/useAuthentification"
import { useContext } from "react"
import Authorization from "../accessories/authorization"
import { Science, LocalHospital, History, Home, Dangerous } from "@mui/icons-material"
import AppCustomLayout from "./CustomLayout"
import FlaskIconSvg from "../icons/FlaskIcon";
import PaperProfile from "../icons/profilePaper";

const sidebarLinks = [
  { title: "Operations", link: "/operations/laboratory", icon: <FlaskIconSvg /> },
  { title: "Archive Results", link: "/operations/laboratory/patientarchives", icon: <PaperProfile /> },
  { title: "Phelobotomy", link: "/phelobotomy", icon: <LocalHospital /> },
  { title: "Sample Validation", link: "/sample", icon: <Science /> },
  { title: "Rejected Samples", link: "/sample/rejected", icon: <Dangerous /> },
];

export default function LaboratoryLayout({ children }) {
  const { auth } = useContext(AuthContext)

  const pageView = () => {
    if (!["scientist", "manager", "admin"].includes(auth?.role)) {
      return <Authorization />
    } else {
      return (
        <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
          {children}
        </AppCustomLayout>
      )
    }
  }

  return <>{pageView()}</>
}
