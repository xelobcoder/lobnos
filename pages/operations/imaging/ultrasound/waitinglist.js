import React, { useState, useEffect } from 'react'
import { customFetch } from '../../../../components/Auth/customFetch';
import TableDisplay from '../../../../components/accessories/TableDisplay'
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function UltrasoundWaitingList() {
  const [waitingList, setWaitingList] = useState([]);
  const router = useRouter();

  const getWaitingList = async function () {
    let response = await customFetch(`operations/imaging/ultrasound`);
    response?.result ? setWaitingList(response?.result) : setWaitingList([])
  }



  const columns = [
    { Header: 'fullname', accessor: 'FULLNAME' },
    { Header: 'patientid', accessor: 'PATIENTID' },
    { Header: 'billingid', accessor: 'BILLINGID' },
    { Header: 'scan', accessor: 'NAME' },
    {
      Header: 'entry', Cell: function ({ row }) {
        const source = row.original;
        const { FULLNAME, NAME, BILLINGID, TESTID,PATIENTID} = source;
        const link = `./result/${BILLINGID}?scan=${NAME}&&testid=${TESTID}&&fullname=${FULLNAME}&&patientid=${PATIENTID}`
        return (<Button variant='contained'
          onClick={(ev) => router.push(link)}>
          enter result
        </Button>)
      }
    }
  ]

  useEffect(() => { getWaitingList() }, [])
  return (
    <div className='container-fluid'>
      <h1 className='text-primary'>Ultrasound Department Waiting List ({waitingList.length} -- on queue)</h1>
      <TableDisplay styling={'excel-table'} filtering={true} column={columns} data={waitingList} />
    </div>
  )
}
