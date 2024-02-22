import AppCustomLayout from "../Layout/CustomLayout"
import {
  SettingsApplications,
  Forest,
  CorporateFareRounded,
  BloodtypeRounded,
  TripOrigin,
  PriceChange,
  Sms,
  Add,
  TextSnippetRounded,
  Looks3Sharp,
} from "@mui/icons-material";

export default function MainSettingsLayoutView({ children, sidebar }) {
  const sidebarLinks = [
    { title: "Applications Settings", link: "/settings/applicationsettings", icon: <SettingsApplications /> },
    { title: "Branches", link: "/settings/branches", icon: <Forest /> },
    { title: "Company Info", link: "/settings/companyprofile", icon: <CorporateFareRounded /> },
    { title: "Departments", link: "/settings/department", icon: <TripOrigin /> },
    { title: "Taxes", link: "/settings/tax", icon: <Looks3Sharp /> },
    { title: "Test Setup", link: "/settings/setup", icon: <BloodtypeRounded /> },
    { title: "Test Panels", link: "/settings/testpanel/testlist", icon: <TextSnippetRounded /> },
    { title: "Email Management", link: "/settings/emailsetting", icon: <Sms /> },
  ]

  return <AppCustomLayout sideLinks={sidebarLinks}  defaultscreen={false}>{children}</AppCustomLayout>
}
