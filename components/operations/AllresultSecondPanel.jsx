import React, { useContext } from 'react'
import OperationsContext from './OperationsContext'

export default function AllresultSecondPanel() {
  const {operationsKey,updateOperations} = useContext(OperationsContext)

  return (
    <>
      <div className='bg-warning m-2 br-5' >
        <h6 className='text-white p-3 text-center'>All query result will appeaar here </h6>
      </div>
    </>
  )
}
