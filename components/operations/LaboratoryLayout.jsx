import AuthContext from "../Auth/useAuthentification"
import { useContext } from "react"
import SettingsLayout from "../settingsComponents/SettingsLayout"
import LabSideBarComponents from "./labSideBarComponents"
import Authorization from "../accessories/authorization"

export default function LaboratoryLayout({ children }) {
  const { auth } = useContext(AuthContext)

  const pageView = () => {
    if (!(["scientist", "manager", "admin"].includes(auth?.role))) {
      return <Authorization />
    } else {
      return <SettingsLayout sidebar={<LabSideBarComponents auth={auth} />}>{children}</SettingsLayout>
    }
  }

  return <>{pageView()}</>
}
