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
  OutboxSharp,
  MedicationRounded,
  RoomServiceSharp,
  AppRegistration,
  ResetTvOutlined,
  FileDownload,
} from "@mui/icons-material";
import MainLayout from "../Layout/MainLayout";

export default function MainSettingsLayoutView({ children }) {
  const sidebarLinks = [
    { title: "Applications Settings", link: "/settings/applicationsettings", icon: <SettingsApplications /> },
    { title: "Registration Fields", link: "/settings/applicationsettings/registrationFields", icon: <FileDownload/> },
    { title: "Result Entry Settings", link: "/settings/applicationsettings/resultEntrySettings", icon: <ResetTvOutlined/> },
    { title: "Users", link: "/authentication/users", icon: <VerifiedUser /> },
    { title: "Branches", link: "/settings/branches", icon: <Forest /> },
    { title: "sample types", link: "/settings/testpanel/sampletypes", icon: <Forest /> },
    { title: "Company Info", link: "/settings/companyprofile", icon: <CorporateFareRounded /> },
    { title: "Departments", link: "/settings/department", icon: <TripOrigin /> },
    { title: "Taxes", link: "/settings/tax", icon: <Looks3Sharp /> },
    { title: "Test Panels", link: "/settings/testpanel/testlist", icon: <TextSnippetRounded /> },
    { title: "Services", link: "/settings/additionalservices", icon: <RoomServiceSharp/> },
    {
      title: "outsourcing", link: "/settings/outsource", icon: <Outbox />, subLinks: [
        { title: 'New Organization', link: '/settings/outsource/newOutsourcing', icon: <OutboxSharp /> },
        { title: 'Outsourcing List', link: '/settings/outsource', icon: <OutboxSharp /> }
      ]
    },
    {
      title: 'Drugs', link: '/settings/applicationsettings/drugs', icon: <MedicationRounded />, subLinks: [
        { title: 'Drug Category', link: '/settings/applicationsettings/drugs/drugCategoryView' },
        {
          title: 'Drugs List', link: '/settings/applicationsettings/drugs', icon: <MedicationRounded />
        }
      ]
    },
    { title: "Email Management", link: "/settings/emailsetting", icon: <Sms /> },
  ];

  return (
    <MainLayout sideLinks={sidebarLinks} defaultscreen={false}>
      {children}
    </MainLayout>
  )
}
