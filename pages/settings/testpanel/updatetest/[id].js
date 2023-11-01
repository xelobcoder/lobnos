import React, { useContext } from 'react'
import AddPanel from '../../../../components/testpanel/add'
import TestPanelLayout from '../../../../components/testpanel/TestPanelLayout'
import TestContext, { TestPanelProvider } from '../../../../components/testpanel/contextTest'
import Opay from '../../../../components/payment'
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
