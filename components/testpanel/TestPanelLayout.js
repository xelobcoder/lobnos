import React, { useContext } from 'react';
import { TestPanelProvider } from '../../components/testpanel/contextTest';

export default function TestPanelLayout({ children }) {
  return (
    <>
      <div className='container'>
        <div className='testpanel'>
          <div>
            <ul>
              <li>test</li>
              <li>categories</li>
              <li>Add categories</li>
              <li>add test</li>
            </ul>
          </div>
          <div>
            {children}
          </div>
        </div>
      </div>
    </>
  )
}


