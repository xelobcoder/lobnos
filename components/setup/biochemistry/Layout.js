import React from 'react';
import TestSidebar from '../../settingsComponents/testSidebar';
import { Suspense } from 'react';

export default function CHEMISTRY_LAYOUT_SETUP({children}) {
  return (
    <>
      <div className='test-setup-layout'>
        <div >
          <TestSidebar/>
        </div>
        <div>
         <Suspense fallback={<div>Loading...</div>}>
          {children}
          </Suspense>
        </div>
      </div>
    </>
  )
}
