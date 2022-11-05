import { Container, TextField, Button, Autocomplete } from '@mui/material'
import { useState } from 'react';
import parameter from './countparameter';
function FullBloodCountSetup() {

 const categories = ['male', 'children', 'female', '']
 const [fullcount, setFullcount] = useState(parameter)
 const [category, setCategory] = useState('')
 const [childrenAge, setChildrenAge] = useState('0-10')
 const [disable, setDisabled] = useState(true)
 const [mode,setmode] = useState('new')

 const onChangeUnit = (e, index) => {
  setFullcount(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], unit: e.target.value }, ...prevState.slice(index + 1)]
  })
 }
 const onChangeLower = (e, index) => {
  setFullcount(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], lower: e.target.value }, ...prevState.slice(index + 1)]
  }
  )
 }
 const onChangeUpper = (e, index) => {
  setFullcount(prevState => {
   return [...prevState.slice(0, index), { ...prevState[index], upper: e.target.value }, ...prevState.slice(index + 1)]
  }
  )
 }


 // select options for savin g data im terms of male,female,children

 const Category = function (props) {
  return (
   <>
    <div className='top_cart'>
     <div className='form-group'>
      <label>category</label>
      <select className='form-control'>
       <option>male</option>
       <option>female</option>
       <option>children</option>
      </select>
     </div>
     <div className='form-group'>
      <label>children age range</label>
      <input className='form-control' value={childrenAge} disabled={disable}></input>
     </div>
    </div>
   </>
  )
 }




 return (
  <>
   <div className='_fbc'>
    <Category ctx='0-10' />
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
        fullcount.length == 0 ? null : fullcount.map((item, index) => {
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
    <div className='fbc_header' style={{display:"flex",justifyContent:'right'}} >
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

export default FullBloodCountSetup
