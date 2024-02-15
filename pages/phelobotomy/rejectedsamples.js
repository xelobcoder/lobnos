import  { useContext } from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import PhelobotomySidebar from '../../components/PhelobotomySidebar'
import RejectedSamplesComponent from '../../components/samples/rejectedListView'
import AuthContext from '../../components/Auth/useAuthentification'
export default function ReejectedSamplesPage() {
  const { auth } = useContext(AuthContext);
  return (
    <SettingsLayout sidebar={<PhelobotomySidebar auth={auth} />}>
      <RejectedSamplesComponent />
    </SettingsLayout>
  )
}
