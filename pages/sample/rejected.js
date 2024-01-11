import React, { useContext } from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import LabSideBarComponents from '../../components/operations/labSideBarComponents'
import RejectedSamplesComponent from '../../components/samples/rejectedListView'
import AuthContext from '../../components/Auth/useAuthentification'
export default function RejectedSamplesPage() {
  const { auth } = useContext(AuthContext);
  return (
    <SettingsLayout sidebar={<LabSideBarComponents  auth={auth}/>}>
      <RejectedSamplesComponent />
    </SettingsLayout>
  )
}