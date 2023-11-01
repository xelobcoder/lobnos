import React, { useEffect, useState } from 'react';
import { customFetch, printResultNavigator } from '../Auth/customFetch';
import { Email, Print } from '@mui/icons-material';
import { useRouter } from 'next/router';

export default function ReadyTest({ id }) {
  const [test, setTest] = useState([]);

  const getTest = async () => {
    try {
      const response = await customFetch(`result/ready/:${id}`);
      setTest(response);
    } catch (err) {
      alert('error in connecting to server');
    }
  };

  const navigate = useRouter();

  useEffect(() => {
    getTest();
  }, [id]);



  return (
    <>
      {test.length > 0 && test.filter((e, i) => { return e.ready === 'true' }).map((item, index) => {
        return (
          <ul key={index} className='border-bottom m-0 p-2 br-5' style={{ display: 'grid', gridTemplateColumns: '60% 20% 10% 10% ' }}>
            <>
              <li className='text-capitalize text-secondary'>{item.name}</li>
              <li>share via</li>
              <li className='btn btn-secondary ' onClick={(e) => printResultNavigator(navigate, id, item, true)}>
                <Print className={`text-white`} />
              </li>
              <li className='btn btn-primary'>
                <Email className={`text-white`} />
              </li>
            </>
          </ul>
        );
      })}
    </>
  );
}
