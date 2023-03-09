import { Button, Container } from '@mui/material';
import React from 'react';
import ADD_NEW_SUPPLIER from '../../components/suppliers/addNewSupplier';
import SUPPLIERS_SEARCH_BAR from '../../components/suppliers/searchBar'
import SUPPLIERS_LIST from '../../components/suppliers/supllyList'

export default function SUPPLY() {
  const [viewadd, setviewadd] = React.useState(false);
  const [rawdata, setRawdata] = React.useState([]);


  // fetch data from server
  React.useEffect(() => {
    try {
      const fetchdata = async () => {
        const response = await fetch('http://localhost:5000/api/v1/suppliers');
        const data = await response.json();
        console.log(data);
        setRawdata(data);
      }
      fetchdata();
    }
    catch (error) {
      console.log(error);
    }
  }, [])
  // set new suppier useState
  const [newsupplier, setNewSupplier] = React.useState({
    name: '',
    commodity: '',
    address: ''
  })


  const controllerName = async function (ev, target) {
    const ans = ev.target.value;
    setNewSupplier(prev => {
      return { ...prev, name: ans }
    })
  }

  const controllerCommodity = async function (ev, target) {
    const ans = ev.target.value;
    setNewSupplier(prev => {
      return { ...prev, commodity: ans }
    })
  }

  const controllerAddress = async function (ev, target) {
    const ans = ev.target.value;
    setNewSupplier(prev => {
      return { ...prev, address: ans }
    })
  }


  const handleSubmit = async function (ev) {
    // send data to server
    ev.preventDefault();
    try {
      const values = Object.values(newsupplier).filter(item => item === '');
      //  check if the data is not empty
      if (values.length > 0) {
        alert('please fill all fields');
        return;
      }
      else {
        const senddata = async () => {
          const response = await fetch('http://localhost:5000/api/v1/suppliers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(newsupplier)
          })
          const data = await response.json();
          if (data.status === 'success') {
            setRawdata(prev => {
              return [newsupplier, ...prev]
            })
            setNewSupplier({
              name: '',
              commodity: '',
              address: ''
            })
          }
        }
        senddata();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const viewhandler = () => setviewadd(false);

  return (
    <div id='supply-overhead'>
      <div className='container'>
        {
          !viewadd &&
          <div className='d-flex justify-content-end mt-2'>
            <Button
              sx={{ marginBottom: '20px' }}
              onClick={(e) => setviewadd(true)}
              color='primary' variant='contained'>Add supplier</Button>
          </div>
        }
      </div>
      {/* once viewadd which toggles the display of ADD NEW SUPLLIER component is true, then this add section appears */}
      {
        viewadd === true ? (
          <div>
            <ADD_NEW_SUPPLIER newsupplier={newsupplier}
              controllerName={controllerName}
              controllerAddress={controllerAddress}
              controllerCommodity={controllerCommodity}
              handleSubmit={handleSubmit}
              viewhandler={viewhandler}
              rawdata={rawdata}
            />
          </div>
        ) : null
      }
      <SUPPLIERS_SEARCH_BAR />
      <SUPPLIERS_LIST rawdata={rawdata || []} />
    </div>
  )
}

