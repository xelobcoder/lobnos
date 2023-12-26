import AddPanel from '../../../../components/testpanel/add'
import { TestPanelProvider } from '../../../../components/testpanel/contextTest'
import MainSettingsLayoutView from '../../../../components/settingsComponents/MainSettingsLayoutView'

export default function TESTPANEL() {
  return (
    <>
      <TestPanelProvider>
        <MainSettingsLayoutView>
          <AddPanel />
        </MainSettingsLayoutView>
      </TestPanelProvider>
    </>
  )
}
