import React from 'react';
import Link from 'next/link';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
export default function TestSidebar() {
  return (
    <>
      <div className="box">
        <div className="box-head">
          <input className='custom-input' style={{ paddingLeft: '40px' }} placeholder='search test here '>
          </input>
          <ManageSearchIcon color='primary' sx={{ position: 'relative', top: '-35px', left: '10px' }} />
        </div>
        <div className="box-tail mt-2">
          <ul>
            <li>
              <Link href={'/settings/setup/new'}>
                add new test
              </Link>
            </li>
            <li>
              <Link href='/settings/setup/liverfunctiontest'>
                liver function test
              </Link>
            </li>
            <li>
              <Link href='/settings/setup/renalfunctiontest'>
                renal function test
              </Link>
            </li>
            <li>
              <Link href='/settings/setup/cardiacenzymes'>
                cardiac enzymes
              </Link>
            </li>
            {/* LIPID PROFILE */}
            <li>
              <Link href='/settings/setup/lipidprofile'>
                lipid profile
              </Link>
            </li>
            {/* thyroid */}
            <li>
              <Link href='/settings/setup/thyroidtest'>
                thyroid test
              </Link>
            </li>
            {/* FULL BLOOD COUNT */}
            <li>
              <Link href='/settings/setup/fullbloodcount'>
                full blood count
              </Link>
            </li>
            <li>
              <Link href='/settings/setup/betahcg'>
                beta hcg
              </Link>
            </li>
            <li>
              <Link href={'/settings/setup/esr'}> 
                estimated sedimentation rate (ESR)
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}
