import AppCustomLayout from "./CustomLayout"
import { AppRegistrationTwoTone, Error, Home, LoginSharp, Person } from "@mui/icons-material"
export default function AuthenticationLayout({children}) {
  const sidebarLinks = [
    { title: "Settings Home", link: "/settings/applicationsettings", icon: <Home /> },
    { title: "Register User", link: "/authentication/register", icon: <AppRegistrationTwoTone /> },
    { title: "Users", link: "/authentication/users", icon: <Person /> },
    { title: "Login History", link: "/authentication/loginhistory", icon: <LoginSharp /> },
    { title: "Compose Email", link: "/settings/emailsetting/customemail", icon: <Error /> },
  ]

  return <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>{children}</AppCustomLayout>
}
