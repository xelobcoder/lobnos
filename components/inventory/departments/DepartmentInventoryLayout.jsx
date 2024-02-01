import SettingsLayout from "../../settingsComponents/SettingsLayout";
import DepartmentLevelSidebar from "../DepartmentLevelSidebar";
import Authorization from "../../accessories/authorization";
import AuthContext from "../../Auth/useAuthentification";
import { useContext } from "react";
export default function DepartmentInventoryLayout({children}) {
  const { auth } = useContext(AuthContext)
  const authorized = ["manager", "admin"].includes(auth?.role) != false

  return <>{authorized ? <SettingsLayout sidebar={<DepartmentLevelSidebar auth={auth} />}>{children}</SettingsLayout> : <Authorization />}</>
}
