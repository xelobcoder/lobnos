import React from 'react';
import TestSidebar from '../../settingsComponents/testSidebar';

export default function CHEMISTRY_LAYOUT_SETUP({children}) {
  return (
    <>
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
