import { useState } from 'react';
import  { OperationsProvider } from '../../components/operations/OperationsContext';

export default function OperationsLayout({ componentOne, componentTwo, componentThree }) {

  return (
    <>
      <OperationsProvider >
        <div style={{ display: 'grid', gridTemplateColumns: '30% auto' }}>
          <aside>
            {componentOne}
          </aside>
          <main className='children'>
            {componentTwo}
            {componentThree}
          </main>
        </div>
      </OperationsProvider>
    </>
  )
}
