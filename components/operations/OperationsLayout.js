import { useState } from 'react';
import  { OperationsProvider } from '../../components/operations/OperationsContext';

export default function OperationsLayout({ componentOne, componentTwo, componentThree }) {

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
