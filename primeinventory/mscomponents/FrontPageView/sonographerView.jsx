import React from 'react';
import Link from 'next/link';
import { ImagesearchRoller, IntegrationInstructions } from '@mui/icons-material';

export default function FrontPageSonographerView() {
  return (
    <div>
      <ul className='front-page-ui-presentation'>
        <li>
          <Link className='bg-primary text-white p-4 text-center' href="/operations/imaging/ultrasound" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <ImagesearchRoller sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Imaging</div>
          </Link>
        </li>
        <li>
          <Link className='bg-primary text-white p-4 text-center' href="/instructions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', }}>
            <IntegrationInstructions
              sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Instructions</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
