import AccountSvg from "../icons/AccountSvg"
import ComposeNewMessageSvg from "../icons/ComposeNewMessageSvg"
import LogoutHistorySvg from "../icons/LogoutSvg"
import PlusBookShelf from "../icons/PlusOutlineSvg"
import SettingsFolder from "../icons/SettingsFolderSvg"
import AppCustomLayout from "./CustomLayout"

export default function AuthenticationLayout({ children }) {
  const sidebarLinks = [
    { title: "Settings Home", link: "/settings/applicationsettings", icon: <SettingsFolder /> },
    { title: "Register User", link: "/authentication/register", icon: <PlusBookShelf /> },
    { title: "Users", link: "/authentication/users", icon: <AccountSvg /> },
    { title: "Login History", link: "/authentication/loginhistory", icon: <LogoutHistorySvg /> },
    { title: "Compose Email", link: "/email-services/queue", icon: <ComposeNewMessageSvg /> },
  ]

  return <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>{children}</AppCustomLayout>
}
