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
          <h1>
            <span className='alert alert-info'>Add New Branch</span>
          </h1>
        </div>
        <AddBranchComponent data={branch} target={'POST'} update={setBranch} />
      </MainSettingsLayoutView>
    </>
  )
}
