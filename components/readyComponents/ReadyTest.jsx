import { Card } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { customFetch } from '../Auth/customFetch';
import { Email, Print, WhatsApp } from '@mui/icons-material';
import styles from '../../styles/readyTest.module.css';
import { useRouter } from 'next/router';

export default function ReadyTest({ id }) {
  const [test, setTest] = useState([]);

  const getTest = async () => {
    try {
      const response = await customFetch(`result/ready/:${id}`);
      setTest(response);
      console.log(response);
    } catch (err) {
      alert('error in connecting to server');
    }
  };


  const navigate = useRouter();

  useEffect(() => {
    getTest();
  }, [id]);

  const printResult = async (item) => {
    const { testid, name } = item;
    let nwName = name;
    if (name.split(" ").length > 1) {
       nwName = name.split(" ").join("_")
       if (new String(nwName).includes('(')){
         nwName = nwName.split("(");
         nwName = nwName[0]
       }
    }


    navigate.push(`/registration/result?billingid=${id}&&testid=${testid}&&test=${nwName.toLowerCase()}`)
  }

  return (
    <div>
      <Card className={styles.card}>
        {test.length > 0 &&
          test.map((item, index) => {
            return (
              <ul key={index} className={styles.dropdownlist}>
                <li>{item.name}</li>
                {item.ready === 'true' && (
                  <>
                    <li className={styles.textPrimary}>share via</li>
                    <li className='btn btn-secondary' onClick={(e) => printResult(item)}>
                      <Print className={`${styles.icon} text-white ${styles.printIcon}`} />
                    </li>
                    <li className='btn btn-success'>
                      <WhatsApp className={`${styles.icon} text-white ${styles.whatsappIcon}`} />
                    </li>
                    <li className='btn btn-primary'>
                      <Email className={`${styles.icon} text-white ${styles.emailIcon}`} />
                    </li>
                  </>
                )}
              </ul>
            );
          })}
      </Card>
    </div>
  );
}
