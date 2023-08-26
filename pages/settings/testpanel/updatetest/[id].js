import React, { useContext } from 'react'
import AddPanel from '../../../../components/testpanel/add'
import TestPanelLayout from '../../../../components/testpanel/TestPanelLayout'
import TestContext, { TestPanelProvider } from '../../../../components/testpanel/contextTest'
import Opay from '../../../../components/payment'

export default function TESTPANEL() {
  return (
    <>
      <TestPanelProvider>
        <TestPanelLayout>
          <AddPanel />
        </TestPanelLayout>
      </TestPanelProvider>
    </>
  )
}
