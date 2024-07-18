import React from 'react';
import Link from 'next/link';
import { Draw, IntegrationInstructions } from '@mui/icons-material';

export default function FrontPagePhelobotomyView() {
  return (
    <div>
      <ul style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
        gap: '20px',
        listStyleType: 'none',
        padding: 0,
        margin: 0
      }}>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/phelobotomy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Draw sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Phelobotomy</div>
          </Link>
        </li>
        <li>
          <Link className="bg-primary text-white p-4 text-center" href="/instructions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <IntegrationInstructions sx={{ height: 100, width: 100, marginBottom: '8px' }} />
            <div>Instructions</div>
          </Link>
        </li>
      </ul>
    </div>
  );
}
