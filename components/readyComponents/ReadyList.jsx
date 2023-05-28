import { Box, Button, Typography } from '@mui/material';
import React, { useState } from 'react';
import style from '../../styles/ready.module.css';
import { EnergySavingsLeaf } from '@mui/icons-material';

export default function ReadyList({ readydata, changeLayout }) {
  const [active, setActive] = useState(null);
  return (
    <>
      <Box sx={{ height: '80vh', overflowY: 'auto' }}>
        <table className={style.custom_table}>
          <thead>
            <tr>
              <th>Billingid</th>
              <th>fullname</th>
              <th>status</th>
              <th>Completed test</th>
              <th>debt</th>
              <th>view</th>
            </tr>
          </thead>
          <tbody>
            {readydata.length > 0 &&
              readydata.map((item, index) => {
                return (
                  <tr key={index}   style={{border: `${active == index ? '4px solid #3949ab' : 'none'}`}}>
                    <td className={style.billing_id}>{item.billingid}</td>
                    <td>{item.fullname}</td>
                    <td>
                      <div
                        className={`${style.status} ${
                          item.status === 'Ready'
                            ? style.ready_status
                            : style.pending_status
                        }`}
                      >
                        {item.status}
                      </div>
                    </td>
                    <td>{item.readycount}/{item.testcount}</td>
                    <td
                      className={`${style.negative_debt} ${
                        (parseInt(item.outstanding) >= 1 ||
                          parseInt(item.outstanding) <= -1) && style.negative_debt
                      }`}
                    >
                      {parseInt(item.outstanding)}
                    </td>
                    <td>
                      <EnergySavingsLeaf
                        className={style.view_icon}
                        onClick={(e) => {
                          changeLayout('three', item.billingid);
                          setActive(index);
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </Box>
    </>
  );
}
