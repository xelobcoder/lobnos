import AppCustomLayout from "../Layout/CustomLayout"
import {
  SettingsApplications,
  Forest,
  CorporateFareRounded,
  TripOrigin,
  Sms,
  TextSnippetRounded,
  Looks3Sharp,
  VerifiedUser,
  Outbox,
} from "@mui/icons-material"

export default function MainSettingsLayoutView({ children, sidebar }) {
  const sidebarLinks = [
    { title: "Applications Settings", link: "/settings/applicationsettings", icon: <SettingsApplications /> },
    { title: "Users", link: "/authentication/users", icon: <VerifiedUser /> },
    { title: "Branches", link: "/settings/branches", icon: <Forest /> },
    { title: "sample types", link: "/settings/testpanel/sampletypes", icon: <Forest /> },
    { title: "Company Info", link: "/settings/companyprofile", icon: <CorporateFareRounded /> },
    { title: "Departments", link: "/settings/department", icon: <TripOrigin /> },
    { title: "Taxes", link: "/settings/tax", icon: <Looks3Sharp /> },
    { title: "Test Panels", link: "/settings/testpanel/testlist", icon: <TextSnippetRounded /> },
    { title: "outsourcing", link: "/settings/outsource", icon: <Outbox /> },
    { title: "Email Management", link: "/settings/emailsetting", icon: <Sms /> },
  ];

  return (
    <AppCustomLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </AppCustomLayout>
  )
}
