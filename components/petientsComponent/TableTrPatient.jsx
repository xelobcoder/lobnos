import React, { useState } from 'react';
import { AnalyticsRounded, ExploreTwoTone, Menu, TrackChanges, ViewCompactAltTwoTone } from '@mui/icons-material';
import styles from '../../styles/patients.module.css';
import { printResultNavigator } from '../Auth/customFetch';
import { useRouter } from 'next/router';

export default function TableTrPatient({ index, item }) {
  const navigator = useRouter();
  const [menu, setMenu] = useState(false)
  return (
    <>
      <tr>
        <td>{index + 1}</td>
        <td>{item.BILLINGID}</td>
        <td>{item.NAME}</td>
        <td className="pointer">
          <span
            className={`${styles.ptlist} text-center rounded text-white ${item.COLLECTION == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.COLLECTION == "true" ? "Yes" : "No"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center rounded text-white ${item.PROCESSSING == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.PROCESSING == "true" ? "Yes" : "No"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center rounded text-white ${item.READY == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.READY == "true" ? "Yes" : "No"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center rounded text-white ${item.APPROVALSTATUS == 1 ? "bg-success" : "bg-danger"
              }`}
          >
            {item.APPROVALSTATUS == 1 ? "Yes" : "No"}
          </span>
        </td>
        <td className="pointer">
          <Menu onClick={(ev) => setMenu(!menu)} />
          {
            (item.READY && item.APPROVALSTATUS) ? (
              <div className={menu ? styles.ptttmenu : "d-none"}>
                <ul>
                  <li className='text-secondary' onClick={(e) => { printResultNavigator(navigator, item.BILLINGID, { testid: item.TESTID, name: item.NAME },true) }}>
                    <ViewCompactAltTwoTone /> view result
                  </li>
                  <li className='text-secondary'>
                    <AnalyticsRounded /> run test analysis
                  </li>
                  <li className='text-danger badge-danger'>
                    <TrackChanges /> track
                  </li>
                  <li className='text-secondary'>
                    <ExploreTwoTone /> export result csv
                  </li>
                </ul>
              </div>
            ) : null
          }
        </td>
      </tr>
    </>
  );
}
