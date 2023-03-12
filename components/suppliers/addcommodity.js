import React from 'react'
import { Modal, Button } from 'react-bootstrap';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
export default function ADD_COMMODITY_MODAL(props) {
 const [commdity, setCommodity] = React.useState([]);
 const [currentvalue, setCurrentValue] = React.useState({
  category: '',
  name: '',
 });

 const [category, setCategory] = React.useState([
  'reagents',
  'chemicals',
  'equipment',
  'consumables',
  'others'
 ]);


 // display after adding commodity to show the commodity added or not
 const [show, setMessageshow] = React.useState(false);
 const [message, setMessage] = React.useState('');


 const addCommodity = () => {
  setCommodity((prev) => {
   return [...prev, { ...currentvalue }]
  })

  setCurrentValue({
   category: '',
   name: '',
  })
 }

 const removeCommodity = (index) => {
  setCommodity((prev) => {
   return prev.filter((item, i) => i !== index)
  })
 }


 const handleChange = (ev, index) => {
  const { value } = ev.target;
  setCommodity((prev) => {
   return [...prev, prev.slice(index, 1)]
  })
 }


 const handleSave = () => {
  // save the commodity to the db
  // send data to server 
  // close the modal
  // update the state of the parent component
  try {
   const forward = async () => {
    const response = await fetch('http://localhost:5000/api/v1/commodities', {
     method: 'POST',
     headers: {
      'Content-Type': 'application/json'
     },
     body: JSON.stringify(commdity)
    })
    const data = await response.json();
    const { status, message } = data;
    if (status === 'success') {
     setMessageshow(true);
     setMessage(message);
     setTimeout(() => {
      props.onHide();
      setMessageshow(false);
      setMessage('');
      setCurrentValue({
       category: '',
       name: '',
      })
     }, 3000)
     // removing all items in commodity
     setCommodity([]);
    } else {
     setMessageshow(true);
     setMessage(message.toUpperCase());
    }
   }
   forward();
  } catch (error) {
   console.log(error);
  }
 }
 return (
  <div id='addsupplier'>
   <Modal
    {...props}
    size="lg"
    aria-labelledby="contained-modal-title-vcenter"
    style={{ marginTop: '100px' }}
   >
    <Modal.Header closeButton style={{ backgroundColor: '#00224f', color: 'white', padding: '0px !important', borderRadius: '0px' }}>
     <Modal.Title id="contained-modal-title-vcenter"  >
      Add commodity
     </Modal.Title>
    </Modal.Header>
    <Modal.Body>
     {
      show && <div className='alert alert-info' id='modal-msg'>{message}</div>
     }
     <div id='addsupplier' style={{ padding: '0px' }}>
      <div className='modal-commodity'>
       <select className='custom-input'
        value={currentvalue.category}
        style={{ marginRight: '20px' }} onChange={(ev) => setCurrentValue({ ...currentvalue, category: ev.target.value })}>
        <option value=''>select category</option>
        {
         category.map((item, index) => {
          return (
           <option key={index} value={item}>{item}</option>
          )
         })
        }
       </select>
       <input className='custom-input' placeholder='type a commodity name here' value={currentvalue.name} onChange={(ev) => setCurrentValue({
        ...currentvalue,
        name: ev.target.value
       })} style={{ marginRight: '20px' }} />
       <button className='btn btn-primary' onClick={() => addCommodity()}>add</button>
      </div>
      <form>
       {
        commdity.map((item, index) => {
         return (
          <div className='form-group modal-commodity mt-2' key={index}>
           <label htmlFor='name'>commodity name</label>
           <input className='custom-input' value={item.category} disabled></input>
           <input className='custom-input' style={{ marginRight: '20px' }} onChange={(ev, index) => handleChange(ev)} id='name' value={item.name} placeholder='commodity name' />
           <div>
            <span style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
             <RemoveCircleIcon fontSize='large' color='error' onClick={() => removeCommodity(index)} />
            </span>
           </div>
          </div>
         )
        })
       }
      </form>
     </div>
    </Modal.Body>
    <Modal.Footer>
     <Button variant='success'
      onClick={() => { handleSave();  }}
     >save</Button>
     <Button onClick={props.onHide} variant='danger'>Close</Button>
    </Modal.Footer>
   </Modal>
  </div>
 )
}
