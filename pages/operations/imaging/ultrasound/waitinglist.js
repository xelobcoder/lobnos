import { useState, useEffect } from 'react'
import { customFetch } from '../../../../components/Auth/customFetch';
import TableDisplay from '../../../../components/accessories/TableDisplay'
import ImagingSidebar from '../../../../components/ImagingSidebar';
import Header from '../../../../components/header';

export default function UltrasoundWaitingList() {
  const [waitingList, setWaitingList] = useState([]);

  const getWaitingList = async function () {
    let response = await customFetch(`operations/imaging/ultrasound`);
    response?.result ? setWaitingList(response?.result) : setWaitingList([])
  }



  const columns = [
    { Header: 'fullname', accessor: 'fullname' },
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'billingid', accessor: 'billingid' },
    { Header: 'scan', accessor: 'name' },
    { Header: 'entry', Cell: function ({ row }) {
        const source = row.original;
        const { fullname, name, billingid, testid, patientid } = source;
        const link = `./result?billingid=${billingid}&&scan=${name}&&testid=${testid}&&fullname=${fullname}&&patientid=${patientid}`
        return (
          <button className='btn btn-primary btn-sm'
            onClick={(ev) => window.open(link)}>
            enter result
          </button>)
      }
    }
  ]

  useEffect(() => { getWaitingList() }, [])
  return (
    <>
      <Header />
      <ImagingSidebar />
      <div className='container-fluid'>
        <h4 className='text-primary'>Ultrasound Department Waiting List ({waitingList.length} -- on queue)</h4>
        <TableDisplay  filtering={true} column={columns} data={waitingList} />
      </div>
    </>
  )
}
