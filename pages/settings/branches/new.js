import React, { useState } from 'react'
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout'
import AddBranchComponent from '../../../components/settingsComponents/AddBranchComponent'
import { newBranchDefault } from '../../../components/Auth/customFetch'

export default function AddNewBranch() {
  const [branch, setBranch] = useState(newBranchDefault);
  return (
    <>
      <SettingsLayout>
        <div className='container'>
          <h1>
            <span className='alert alert-info'>Add New Branch</span>
          </h1>
        </div>
        <AddBranchComponent data={branch} target={'POST'} update={setBranch} />
      </SettingsLayout>
    </>
  )
}
