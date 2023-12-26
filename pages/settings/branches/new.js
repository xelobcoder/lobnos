import React, { useState } from 'react'
import AddBranchComponent from '../../../components/settingsComponents/AddBranchComponent'
import { newBranchDefault } from '../../../components/Auth/customFetch'
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

export default function AddNewBranch() {
  const [branch, setBranch] = useState(newBranchDefault);
  return (
    <>
      <MainSettingsLayoutView>
        <div className='container'>
          <div className='card mx-1 my-3'>
          <div className='card-header bg-secondary text-white'>
             <div className='card-title'>Add New Branch</div >
          </div>
          <div className='card-body'>
          <AddBranchComponent data={branch} target={'POST'} update={setBranch} /> 
          </div>
         </div>
       </div>
      </MainSettingsLayoutView>
    </>
  )
}
