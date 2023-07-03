import React ,{useState} from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { Container } from '@mui/material';
import TopMessage from '../accessories/TopMessage';
import { Button } from 'react-bootstrap';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ADD_COMMODITY_MODAL from './addcommodity';
import UpgradeIcon from '@mui/icons-material/Upgrade';
import AddCommentIcon from '@mui/icons-material/AddComment';
import { useRouter } from 'next/router';
import { customFetch } from '../Auth/customFetch';

export default function ADD_NEW_SUPPLIER() {
  const default_source = {
    name: '',
    commodity: '',
    address: '',
    region: '',
    contactperson: '',
    email: '',
    phonenumber: ''
  };

  // regions in ghana 
  const regions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Eastern',
    'Central',
    'Volta',
    'Northern',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
    'Savannah',
    'North East',
    'Oti',
    'Western North'
  ];

  const tab = useRouter().query.tab;
  const supplierid = useRouter().query.supplierid;

  // list of all commodities
  const [commoditiesList, setCommoditiesList] =useState([]);

  // show modal for adding commodity to db when it is not in the datalist show 
  const [showcmmodal, setshowcmmodal] =useState(false);

  const [show, setMessageshow] =useState(false);
  const [message, setMessage] =useState({ type: 'success', message: '' })

  const [newsupplier, setNewSupplier] =useState(default_source);
  // destructure 
  const { name, commodity, address, email, phonenumber, region, contactperson } = newsupplier;
  // handle the inputs
  const inputhandler = (ev, field) => {
    let value = ev.target.value;
    setNewSupplier((prev) => {
      return { ...prev, [field]: value }
    })
  }


  const handleCommidity = async (ev) => {
    // get the list of commodities from the db
    const data = await customFetch('commodities')
    setCommoditiesList(data.result);
  }

  const handleSubmit = async (ev, tab, newsupplier) => {
    ev.preventDefault();
    const method = tab === 'edit' ? 'PUT' : 'POST';
    try {
      const senddata = async () => {
        const response = await fetch(tab == 'edit' ? `${process.env.BASEURL}/?supplierid=${supplierid}` :
          `${process.env.BASEURL}/suppliers`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
          },
          body: JSON.stringify(newsupplier)
        })
        const data = await response.json();
        console.log(data);
        if (data.status === 'success') {
          setNewSupplier({
            name: '',
            commodity: '',
            address: '',
            region: '',
            contactperson: '',
            email: '',
            phonenumber: ''
          })
          setMessageshow(true);
          setMessage({
            type: 'success',
            message: tab === 'edit' ? 'supplier updated successfully' : 'supplier added successfully'
          })
        }
        else {
          setMessageshow(true);
          setMessage({
            type: 'danger',
            message: data.err.sqlMessage
          })
        }
      }

      const checkEmptyFields = (dataset) => {
        let empty = false;
        for (let key in dataset) {
          if (dataset[key] === '') {
            empty = true;
            break;
          }
        }
        return empty;
      }

      if (checkEmptyFields(newsupplier)) {
        alert('please fill all fields');
        return;
      }
      else {
        senddata()
      }
    }
    catch (error) {
      setMessage({ type: 'error', message: error.message })
      setMessageshow(true)
    }
  }


  const messageTimer = () => {
    setTimeout(() => {
      setMessageshow(false);
    }, 3000)
  }


  React.useMemo(() => {
    handleCommidity();

  }, [])


  React.useMemo(() => {
    if (tab === 'edit' && supplierid) {
      const getResponse = async () => {
        const data = await customFetch(`suppliers?supplierid=${supplierid}`)
        if (data?.result.length === 0) {
          return;
        }
        else {
          // transform keys to lowercase to match 
          const xmap = result[0];
          let transformed = function () {
            let obj = {};
            for (let key in xmap) {
              obj[key.toLowerCase()] = xmap[key];
            }
            // remove supplier id and date created
            delete obj.supplierid;
            delete obj.date
            return obj;
          }
          setNewSupplier(transformed());
        }
      }

      getResponse()
    }
  }, [tab, supplierid])

  return (
    <>
      {
        show && <TopMessage type={message.type} display={show} message={message.message} messageTimer={messageTimer} />
      }
      <div style={{ marginTop: '20px' }}>
        <div id='addsupplier' className='mt-2='>
          <h1>Add new supplier</h1>
          <form>
            <div className='form-group'>
              <label htmlFor='name'>supplier name</label>
              <input className='custom-input' value={name} list='customers' name='name' placeholder='supplier name'
                onChange={(ev) => inputhandler(ev, 'name')} />

            </div>
            <div className='form-group'>
              <label htmlFor='commodity'>commodity</label>
              <div className='d-flex'>
                <input className='custom-input' value={commodity} id='commodity' multiple={true} required list='mycommodity' placeholder='commodity name'
                  onChange={(ev) => {
                    inputhandler(ev, 'commodity');
                  }}
                />
                <datalist id='mycommodity'>
                  {
                    commoditiesList.length > 0 && commoditiesList.map((item, index) => {
                      return <option key={index} value={item.COMMODITY} />
                    })
                  }
                </datalist>
                {/* display modal */}
                <AddBoxIcon fontSize='large' onClick={() => setshowcmmodal(true)} />
              </div>
            </div>
            <div className='form-group'>
              <label htmlFor='address'>address</label>
              <input className='custom-input' id='addx' value={address}
                onChange={(ev) => inputhandler(ev, 'address')}
                placeholder='address' />
            </div>
            {/* email */}
            <div className='form-group'>
              <label htmlFor='email'>email</label>
              <input className='custom-input' type='email' id='email' value={email} placeholder='email' required
                onChange={(ev) => inputhandler(ev, 'email')} />
            </div>
            {/* phone number */}
            <div className='form-group'>
              <label htmlFor='phonenumber'>phone number</label>
              <input className='custom-input' type='number' id='phonenumber' required value={phonenumber} placeholder='phone number'
                onChange={(ev) => inputhandler(ev, 'phonenumber')} />
            </div>
            {/* region */}
            <div className='form-group'>
              <label htmlFor='region'>region</label>
              <select className='custom-input' id='region' value={newsupplier.region} onChange={(ev) => inputhandler(ev, 'region')}>
                <option value=''>select region</option>
                {
                  regions.length > 0 && regions.map((item, index) => {
                    return <option key={index} value={item}>{item}</option>
                  })
                }
              </select>
            </div>
            {/* contact person */}
            <div className='form-group'>
              <label htmlFor='contactperson'>contact person</label>
              <input className='custom-input' id='contactperson' value={contactperson} placeholder='contact person'
                onChange={(ev) => inputhandler(ev, 'contactperson')} />
            </div>
            <div className='form-group'>
              <Button className='btn btn-primary' type='submit'
                onClick={(ev) => handleSubmit(ev, tab, newsupplier)}
              >
                {tab === 'edit' ? <UpgradeIcon /> : <AddCommentIcon />}
                {tab === 'edit' ? 'Update' : 'Add New'}
              </Button>
            </div>

          </form>
          <ADD_COMMODITY_MODAL show={showcmmodal} onHide={() => setshowcmmodal(false)} />
        </div>

      </div></>
  )
}
