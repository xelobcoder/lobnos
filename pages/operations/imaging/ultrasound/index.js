import { useState, useEffect, useCallback } from 'react'
import { customFetch, updatePagination } from '../../../../components/Auth/customFetch';
import TableDisplay from '../../../../components/accessories/TableDisplay'
import ImagingSidebar from '../../../../components/ImagingSidebar';
import Pagination from '../../../../components/accessories/pagination';
import ApplicationHeader from '../../../../components/Layout/HeaderNav';
import UltrasoundLayout from '../../../../components/Layout/ImagingLayout';
import { UltrasoundStagesProvider } from '../../../../components/operations/Ultrasound/UltrasoundContext';
import LaboratoryAscensionFiltering from '../../../../components/operations/Laboratory/LaboratoryAscensionFiltering';
import UltrasoundAscensionFiltering from '../../../../components/operations/Ultrasound/UtrasoundFiltering';
import AscentionUltrasoundUnCompletedTable from '../../../../components/operations/Ultrasound/UncompletedUltrasoundWaitingListTable';

export default function UltrasonograhyWaitingList() {
  const [waitingList, setWaitingList] = useState([]);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 })
  const [loadpage, setPage] = useState(false);

  const getWaitingList = useCallback(async function () {
    let response = await customFetch(`operations/imaging/ultrasound?count=${paginate.count}&&page=${paginate.page}`);
    response?.result ? setWaitingList(response?.result) : setWaitingList([])
  }, [paginate])


  useEffect(() => {
    getWaitingList();
  }, [getWaitingList])


  const columns = [
    { Header: 'fullname', accessor: 'fullname' },
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'billingid', accessor: 'billingid' },
    { Header: 'scan', accessor: 'name' },
    {
      Header: 'entry', Cell: function ({ row }) {
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



  const handlePagination = (value) => { updatePagination(value, setPaginate, paginate) };
  return (
    <UltrasoundLayout>
      <UltrasoundStagesProvider>
        <UltrasoundAscensionFiltering ascension_stage={'ULTRASOUND_UNCOMPLETED'} />
        <AscentionUltrasoundUnCompletedTable/>
        {/* <div className='container-fluid'>
          <h4 className='text-primary'>Ultrasound Department Waiting List ({waitingList.length} -- on queue)</h4>
          <TableDisplay filtering={true} showpage={false} column={columns} data={waitingList} />
          <div className='d-flex justify-content-center'>
            <Pagination updateFunction={handlePagination} load={setPage} />
          </div>
        </div> */}
      </UltrasoundStagesProvider>
    </UltrasoundLayout>
  )
}