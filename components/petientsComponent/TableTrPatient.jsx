import React, { useState } from 'react';
import { printResultNavigator } from '../Auth/customFetch';
import { useRouter } from 'next/router';
import { RiBarChart2Fill, RiExportFill, RiMenu2Fill, RiPulseAiFill, RiTableView } from '@remixicon/react';



export default function TableTrPatient({ index, item,openModal}) {
  const navigator = useRouter();
  const [menu, setMenu] = useState(false)
  return (
    <>
      <tr>
        <td>{item.billingid}</td>
        <td>{item?.name}</td>
        <td className="pointer">
          <span
            className={` text-center text-white ${item.collection == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.collection == "true" ? "collected" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={`  text-center text-white ${item.processing == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.processing == "true" ? "processed" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={`  text-center text-white ${item.ready == "true" ? "bg-success" : "bg-danger"
              }`}
          >
            {item.ready == "true" ? "ready" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <span
            className={`  text-center text-white ${item.approvalStatus == 1 ? "bg-success" : "bg-danger"
              }`}
          >
            {item.approvalStatus == 1 ? "approved" : "Not Yet"}
          </span>
        </td>
        <td className="pointer">
          <RiMenu2Fill onClick={(ev) => setMenu(!menu)} />
          {
            (item.ready && item.approvalStatus == 1) ? (
              <div className={menu ? '' : "d-none"}>
                <ul>
                  <li className='text-secondary' onClick={(e) => { printResultNavigator(navigator, item.BILLINGID, { testid: item.TESTID, name: item.NAME }, true) }}>
                    <RiTableView /> view result
                  </li>
                  <li className='text-secondary'>
                    <RiBarChart2Fill /> run test analysis
                  </li>
                  <li onClick={(e) => {openModal()}} className='text-danger badge-danger'>
                    <RiPulseAiFill  /> Track
                  </li>
                  <li className='text-secondary'>
                    <RiExportFill /> export result csv
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
