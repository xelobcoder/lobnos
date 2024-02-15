import { useContext } from 'react'
import SettingsLayout from '../../components/settingsComponents/SettingsLayout'
import PhelobotomySidebar from '../../components/PhelobotomySidebar'
import AuthContext from '../../components/Auth/useAuthentification'

export default function PhelobotomyAnalyticPage() {
  const { auth } = useContext(AuthContext);
  return (
    <>
      <SettingsLayout sidebar={<PhelobotomySidebar auth={auth} />}>
        <h3>Phelobotomy Analytic Page</h3>
      </SettingsLayout>
    </>
  )
}