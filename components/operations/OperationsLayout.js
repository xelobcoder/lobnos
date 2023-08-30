import React, { useContext } from 'react';
import OperationsContext, { OperationsProvider } from '../../components/operations/OperationsContext';
import { useState } from 'react';
import OperationsTestCollection from './OperationsTestCollection';
import TestPreview from './TestPreview';

export default function OperationsLayout({componentOne,componentTwo,componentThree}) {
  return (
    <>
      <OperationsProvider >
        <div className='operations-wrapper'>
          <aside>
            {componentOne}
          </aside>
          <main id='operation-test-collection-wrapper'>
           {componentTwo}
          </main>
          <main className='children'>
            {componentThree}
          </main>
        </div>
      </OperationsProvider>
    </>
  )
}
