import React from 'react'
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView'
import { AddOutlined } from '@mui/icons-material'
import Application_Tax_Inclusion from '../../components/settingsComponents/newTaxModal'

export default function Application_Taxes_List() {
  return (
    <MainSettingsLayoutView>
      <div className='d-flex justify-content-end mx-2 my-1'>
        <button className='btn btn-secondary'><AddOutlined /> new tax</button>
      </div>
      <Application_Tax_Inclusion/>
    </MainSettingsLayoutView>
  )
}
