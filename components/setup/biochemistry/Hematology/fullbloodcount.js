import { Container, TextField, Button, Autocomplete } from '@mui/material'
import { useState } from 'react';
import parameter from './countparameter';
function FullBloodCountSetup() {
 const fullcountparameters = ['wbc', 'neutrophils', 'eosinophils', 'basophils', 'lymphocytes']
 const categories = ['male','children','female','']
 const [fullcount, setFullcount] = useState(parameter)
 const [category,setCategory] = useState('')

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

 return (
  <>
   <div className="p-2">
    <div>
     <div className='mb-3'>
      <Autocomplete
       options={categories}
       onChange={ (e,newValue) => {setCategory(newValue)}}
       value={category}
       size='small'
       getOptionLabel ={ (option) => option}
       renderInput={ (params) => <TextField {...params} label='category'/>}
      />
     </div>
     <form className='fullcount-setup'>
      {/* for wbc */}
      {
       fullcount.length == 0 ? null : fullcount.map((parameter, index) => {
        return (
         <div key={index} style={{ display: 'grid', gridTemplateColumns: '35% auto', gridGap: '10px 20px' }}>
          <div>
           <label>
            {parameter.name}
           </label>
          </div>
          <div>
           <TextField label='unit' value={parameter.upper} size='small' onChange={(e) => onChangeUpper(e, index)} margin="normal" variant="outlined"
           />
           <TextField label='lower limit' value={parameter.lower} size='small' onChange={(e) => onChangeLower(e, index)} margin="normal" variant="outlined"
           />
           <TextField label='upper limit' value={parameter.unit} size='small' onChange={(e) => onChangeUnit(e, index)} margin="normal" variant="outlined"
           />
          </div>
         </div>
        )
       })
      }
      <div className='grid-2 mt-3' style={{gridGap:'20px'}}>
       <Button variant='contained' color='warning' onClick={(e) => console.log(fullcount)}>
        save changes
       </Button>
       <Button variant='contained' color='error' >
        clear all
       </Button>
      </div>
     </form>
    </div>
   </div>
  </>
 )
}

export default FullBloodCountSetup
