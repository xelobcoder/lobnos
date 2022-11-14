import { useState } from 'react';
import parameters from './livercountparameters';
import {Button} from '@mui/material';

function LiverPanel() {
 const [liverpanel, setLiverpanel] = useState(parameters);
 const [mode,setmode] = useState('new')

 // listener for changing unit
 const onChangeUnit = (e, index) => {
  setLiverpanel(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], unit: e.target.value }, ...prevState.slice(index + 1)]
  })
 }
 // listener for changing lower limit
 const onChangeLower = (e, index) => {
  setLiverpanel(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], lower: e.target.value }, ...prevState.slice(index + 1)]
  }
  )
 }
 // listener for chnaging upper limit
 const onChangeUpper = (e, index) => {
  setLiverpanel(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], upper: e.target.value }, ...prevState.slice(index + 1)]
  }
  )
 }


 // save info to the database 

 const saveinformation = function (e) {
  
 }

 return (
  <>
   <div className='_fbc'>
    <div className='wrapperx'>
     <div className='fbc_header'>
      <ul>
       <li>parameter name</li>
       <li>unit</li>
       <li>upper</li>
       <li>lower</li>
      </ul>
     </div>
     <div className='fbc_header'>
      <div className='parameter-list'>
       {
        liverpanel.length == 0 ? null : liverpanel.map((item, index) => {
         return (
          <ul key={index}>
           <li>{item.name}</li>
           <li>
            <input value={item.unit} type='text' onChange={(e) => onChangeUnit(e, index)} />
           </li>
           <li>
            <input value={item.upper} type='number' onChange={(e) => onChangeUpper(e, index)} />
           </li>
           <li>
            <input value={item.lower} type='number' onChange={(e) => onChangeLower(e, index)} />
           </li>
          </ul>
         )
        })
       }
      </div>
     </div>
    </div>
    <div className='fbc_header' style={{ display: "flex", justifyContent: 'right' }} >
     <Button variant='contained' color='success'>
      {/* if new entry button dispaly save changes, else update */}
      {
       mode === 'new' ? 'save changes' : 'update changes'
      }
     </Button>
    </div>
   </div>
  </>
 )
}

export default LiverPanel;
