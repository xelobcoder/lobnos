import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TextField, Button, Typography } from '@mui/material';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch } from '../../components/Auth/customFetch';

export default function Activator() {
  const [activationData, setActivationData] = useState([]);
  const [tempStore, setStore] = useState([]);
  const [advancedSearch, setAdvancedSearch] = useState(false);

  const [id, setId] = useState('');

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
        if (filteredData.length > 0) {
          setActivationData(filteredData);
        }
      }
    } else {
      return
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


  return (
    <>
      {!advancedSearch &&
        <div>
          <button className='btn btn-primary m-2' onClick={() => setAdvancedSearch(!advancedSearch)}>
            advanced search
          </button>
        </div>}
      {advancedSearch &&
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '30% 20% 20% auto',
            gridGap: '5px 5px',
            margin: '20px',
          }}
        >
          <input
            placeholder="Enter patientid"
            value={id}
            name='patientid'
            id='patientid'
            className='custom-input'
            onChange={handleNameFilter}
          />
          <input className='custom-input' type='number' placeholder='fullname' />
          <input className='custom-input' type='tell' inputMode='numeric' placeholder='mobile number' />
          <input className='custom-input' type="date" size="small" placeholder='from' />
          <input className='custom-input' type="date" size="small" />
          <Button type="button" className='custom-button' variant="contained" color="primary">
            search
          </Button>
          <Button type='button' className='btn btn-danger' color='error'
            onClick={(e) => setAdvancedSearch(false)}>
            close
          </Button>
        </div>}
      <div style={{ height: '100vh', overflowY: 'auto', margin: '10px' }}>
        {activationData.length > 0 && (
          <table id='custom-table'>
            <thead>
              <tr>
                <th>reg date</th>
                <th>patient id</th>
                <th>fullname</th>
                <th style={{ display: 'flex', justifyContent: 'center' }}>status</th>
                <th>action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activationData.length === 0 && <TableIsLoading col={8} />}
              {activationData.length > 0 && activationData.map((item) => (
                <tr key={item.ID}>
                  <td>{item.DATE.slice(0, 10)}</td>
                  <td>{item.PATIENTID}</td>
                  <td>{item.FULLNAME}</td>
                  <td>
                    <div className={item.ACTIVATION_STATUS === 'TRUE' ? 'activated' : 'deactivated'}>
                      {item.ACTIVATION_STATUS === 'TRUE' ? 'activated' : 'deactivated'}
                    </div>
                  </td>
                  <td className="activation-cell">
                    <Button size='small'
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
                        variant='contained'
                        size='small'
                        onClick={(e) => {
                          handleBilling(e, item.PATIENTID);
                        }}
                      >
                        billing
                      </Button>
                    ) : (
                      <Button variant='contained' sx={{ width: '100px' }} size='small'>
                        <Link style={{ color: 'white' }} href={`/registration/?patientid=${item.PATIENTID}`}>edit info</Link>
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
