import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { TextField, Button, Typography } from '@mui/material';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch } from '../../components/Auth/customFetch';

export default function Activator() {
  const [activationData, setActivationData] = useState([]);
  const [tempStore, setStore] = useState([]);

  const [id, setId] = useState('');
  const billing = useRouter();

  const patientid = useRouter().query.patientid;

  const handleNameFilter = (e) => {
    const filtered = e.target.value;
    setId(filtered);

    if (activationData.length !== 0) {
      if (filtered.length == 0) {
        setActivationData(tempStore);
      } else {
        const filteredData = activationData.filter((item) => {
          const fullName = new String(item.FULLNAME.toLowerCase())
          const patientId = new String(item.PATIENTID);

          return fullName.match(filtered.toLowerCase()) || patientId.includes(filtered.toLowerCase());
        });

        console.log(filteredData.length)
        if (filteredData.length > 0) {
          setActivationData(filteredData);
        }
      }
    }
  };


  const handleBilling = (e, patientid) => {
    billing.push(`/billing?patientid=${patientid}`);
  };


  useEffect(() => {
    const getInitData = async () => {
      try {
        const data = await customFetch('activation');
        setActivationData(data);
        setStore(data)
      } catch (err) {
        alert('error occured in connecting to server')
      }
    }

    getInitData()
  }, [])

  useEffect(() => {
    if (patientid) {
      const filteredData = activationData.filter((item) => item.PATIENTID === patientid);
      setActivationData(filteredData);
      setId(patientid);
    }
  }, [patientid, activationData]);

  return (
    <>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '30% 20% 20% auto',
          gridGap: '20px 20px',
          margin: '20px',
        }}
      >
        <input
          placeholder="Enter patient id or fullname"
          value={id}
          className='custom-input'
          onChange={handleNameFilter}
        />
        <input className='custom-input' type="date" size="small" />
        <input className='custom-input' type="date" size="small" />
        <Button type="button" className='custom-button' variant="contained" color="primary">
          search
        </Button>
      </div>
      <div style={{ height: '70vh', overflowY: 'auto', margin: '10px' }}>
        {activationData.length > 0 && (
          <table id='custom-table'>
            <thead>
              <tr>
                <th>ID</th>
                <th>patient id</th>
                <th>fullname</th>
                <th>date</th>
                <th>status</th>
                <th>action</th>
                <th>options</th>
              </tr>
            </thead>
            <tbody>
              {activationData.length === 0 && <TableIsLoading col={8} />}
              {activationData.length > 0 && activationData.map((item) => (
                <tr key={item.ID}>
                  <td>{item.ID}</td>
                  <td>{item.PATIENTID}</td>
                  <td>{item.FULLNAME}</td>
                  <td>{item.DATE.slice(0, 10)}</td>
                  <td>
                    <div className={item.ACTIVATION_STATUS === 'TRUE' ? 'activated' : 'deactivated'}>
                      {item.ACTIVATION_STATUS === 'TRUE' ? 'activated' : 'deactivated'}
                    </div>
                  </td>
                  <td className="activation-cell">
                    <Button
                      variant="outlined"
                      color={item.ACTIVATION_STATUS === 'TRUE' ? 'error' : 'success'}
                      onClick={(e) => {
                        handleActivation(e, item.ID, item.ACTIVATION_STATUS, item.PATIENTID);
                      }}
                    >
                      {item.ACTIVATION_STATUS === 'FALSE' ? 'activate' : 'deactivate'}
                    </Button>
                  </td>
                  <td>
                    {item.ACTIVATION_STATUS === 'TRUE' ? (
                      <Button
                        sx={{ width: '100px' }}
                        color="success"
                        onClick={(e) => {
                          handleBilling(e, item.PATIENTID);
                        }}
                      >
                        billing
                      </Button>
                    ) : (
                      <Button variant="teal" sx={{ width: '120px' }}>
                        <Link href={`/registration/?patientid=${item.PATIENTID}`}>edit info</Link>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            {activationData.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Typography variant="h5">No data found</Typography>
                </td>
              </tr>
            )}
          </table>
        )}
      </div>
    </>
  );
}
