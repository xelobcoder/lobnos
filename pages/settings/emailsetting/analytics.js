import React from 'react'
import EmailSidebarJSX from '../../../components/settingsComponents/EmailSidebar'
import { ErrorOutlineRounded, Send } from '@mui/icons-material'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView'

export default function Analytics() {
  return (
    <>
      <MainSettingsLayoutView sidebar={<EmailSidebarJSX />}>
        <div className='container p-2' style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gridGap:'30px' }}>
          <div className='card br-5'>
            <div className='card-header bg-light d-flex justify-content-between pointer'>
              <span> <Send /> Total Emails </span>
            </div>
            <div className='card-body'>
              <h1>7838</h1>
            </div>
          </div>
          <div className='card br-5'>
            <div className='card-header d-flex justify-content-between pointer'>
              <span> <ErrorOutlineRounded /> Failed </span>
            </div>
            <div className='card-body'>
              <h1 className='text-danger'>838</h1>
            </div>
          </div>
          <div className='card br-5'>
            <div className='card-header d-flex justify-content-between pointer'>
              <span> <Send />  sent</span>
            </div>
            <div className='card-body'>
              <h1 className='text-success'>780</h1>
            </div>
          </div>
        </div>
      </MainSettingsLayoutView>
    </>
  )
}
