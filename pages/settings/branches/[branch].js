import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AddBranchComponent from '../../../components/settingsComponents/AddBranchComponent';
import { getBranches } from '../../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../../components/settingsComponents/MainSettingsLayoutView';

export default function UpdateBranchPage() {
  const id = useRouter().query.branch;
  const [branchData, setBranchData ] = useState({});

  useEffect(() => { getBranches(setBranchData, id) }, [id]);

  return (
    <MainSettingsLayoutView>
      <div className='container'>
        <h3 className='mt-2'>
          <span className='alert alert-info'>
            Editing Data for branch ::: {branchData?.name}
          </span>
        </h3>
      </div>
      <AddBranchComponent data={branchData} update={setBranchData}  target={'PUT'}/>
    </MainSettingsLayoutView>
  )
}
