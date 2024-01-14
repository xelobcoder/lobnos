import React from 'react';
import TestSidebar from '../../settingsComponents/testSidebar';
import Header from '../../header';
export default function CHEMISTRY_LAYOUT_SETUP({children}) {
  return (
    <>
      <Header/>
      <div className='test-setup-layout'>
        <div >
          <TestSidebar/>
        </div>
        <div>
          {children}
        </div>
      </div>
    </>
  )
}
