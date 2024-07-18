import React from 'react';
import Link from 'next/link';
import { Bloodtype, Draw, IntegrationInstructions } from '@mui/icons-material';

export default function FrontPageLabScientistView() {
  return (
    <div>
      <ul className='front-page-ui-presentation'>
        <li >
          <Link className='bg-primary text-white p-4 text-center' href="/phelobotomy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Draw sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Phelobotomy</div>
          </Link>
        </li>
        <li >
          <Link className='bg-primary text-white p-4 text-center' href="/operations/laboratory" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Bloodtype sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Laboratory</div>
          </Link>
        </li>
        <li >
          <Link className='bg-primary text-white p-4 text-center' href="/instructions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <IntegrationInstructions sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Instructions</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
