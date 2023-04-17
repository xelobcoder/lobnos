import React, { useContext } from 'react';
import OperationsContext, { OperationsProvider } from '../../components/operations/OperationsContext';
import { useState } from 'react';
import OperationsTestCollection from './OperationsTestCollection';
import TestPreview from './TestPreview';

export default function OperationsLayout({ children }) {
  return (
    <>
      <OperationsProvider >
        <div className='operations-wrapper'>
          <aside>
            <OperationsTestCollection />
          </aside>
          <main id='operation-test-collection-wrapper'>
           <TestPreview/>
          </main>
          <main className='children'>
            {children}
          </main>
        </div>
      </OperationsProvider>
    </>
  )
}
