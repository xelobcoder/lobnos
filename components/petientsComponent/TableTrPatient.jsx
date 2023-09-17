import React, { useState } from 'react';
import { AnalyticsRounded, ExploreTwoTone, Menu, TrackChanges, ViewCompactAltTwoTone } from '@mui/icons-material';
import styles from '../../styles/patients.module.css';
import { printResultNavigator } from '../Auth/customFetch';
import { useRouter } from 'next/router';
import Message from '../accessories/message';



export default function TableTrPatient({ index, item,openModal}) {
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
            className={`${styles.ptlist} text-center text-white ${item.COLLECTION == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.COLLECTION == "true" ? "collected" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center text-white ${item.PROCESSING == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.PROCESSING == "true" ? "processed" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center text-white ${item.READY == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.READY == "true" ? "ready" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={` ${styles.ptlist} text-center text-white ${item.APPROVALSTATUS == 1 ? "bg-success" : "bg-danger"
              }`}
          >
            {item.APPROVALSTATUS == 1 ? "approved" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <Menu onClick={(ev) => setMenu(!menu)} />
          {
            (item.READY && item.APPROVALSTATUS) ? (
              <div className={menu ? styles.ptttmenu : "d-none"}>
                <ul>
                  <li className='text-secondary' onClick={(e) => { printResultNavigator(navigator, item.BILLINGID, { testid: item.TESTID, name: item.NAME }, true) }}>
                    <ViewCompactAltTwoTone /> view result
                  </li>
                  <li className='text-secondary'>
                    <AnalyticsRounded /> run test analysis
                  </li>
                  <li onClick={(e) => {openModal()}} className='text-danger badge-danger'>
                    <TrackChanges  /> Track
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
