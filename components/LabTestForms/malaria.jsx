import React from 'react'
import Indicator from '../accessories/Reports/indicator'

export default function Malaria({clientdata}) {

  return (
    <div className='p-4'>
      <form>
        <h4>Malaria test</h4>
        <Indicator/>
        <div className='form-group'>
          <label>parasite present </label>
          <input type='number' className='custom-input' placeholder='number of parasite seen' required />
        </div>
        <div className='form-group mt-2'>
           <input type='checkbox'/> Plasmodium Falciparum<br/> 
           <input type='checkbox'/> <br/>
           <input type='checkbox'/> <br/>
           <input type='checkbox'/> <br/>
           <input type='checkbox'/> <br/>
        </div>
      </form>
    </div>
  )
}
