import { useState, useEffect } from 'react'
import { customFetch, handleChangeWithState, updatePagination } from '../../../../components/Auth/customFetch';
import { Print } from '@mui/icons-material';
import { formatTest } from '../../../../components/Auth/customFetch';
import Pagination from '../../../../components/accessories/pagination';
import TableDisplay from '../../../../components/accessories/TableDisplay';
import ImagingSidebar from '../../../../components/ImagingSidebar';
import ApplicationHeader from '../../../../components/Layout/HeaderNav';

export default function Ulrtrasoundprocessedlist() {
  const defaultState = { from: '', to: '', search: '' }
  const [query, setQuery] = useState(defaultState);
  const [loadPage, setLoadPage] = useState(false);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 });
  const [data, setData] = useState([]);

  const filter = async function () {
    const { from, to, search } = query;
    const { count, page } = paginate;
    let endpoint = `operations/imaging/ultrasound/processed?from=${from}&&to=${to}&&search=${search}&&count=${count}&&page=${page}`;
    let response = await customFetch(endpoint);
    response?.result ? setData(response?.result) : setData([])
  }


  const columns = [
    { Header: 'fullname', accessor: 'fullname' },
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'billingid', accessor: 'billingid' },
    { Header: 'scan', accessor: 'name' },
    {
      Header: 'status', accessor: 'ready', Cell: function ({ row }) {
        const status = row.original.ready === 'true' ? 'completed' : 'pending';
        return (<span className='text-success'>
          {status}
        </span>)
      }
    },
    {
      Header: 'entry', Cell: function ({ row }) {
        const source = row.original;
        const { fullname, name, billingid, testid, patientid } = source;
        const link = `./result?billingid=${billingid}&&scan=${name}&&testid=${testid}&&fullname=${fullname}&&patientid=${patientid}`
        return (
          <div>
            <button className='btn btn-primary  btn-sm'
              onClick={(ev) => window.open(link)}>
              edit
            </button>
            <button onClick={(ev) => { window.open(`/registration/result/scan?billingid=${billingid}&&testid=${testid}&&test=${formatTest(name)}&&patientid=${patientid}`) }} className='btn btn-secondary mx-1  btn-sm' >
              Print <Print/>
            </button>
          </div>
        )
      }
    }
  ]

  useEffect(() => {
    filter();
  }, [])

  useEffect(() => {
    filter();
  }, [paginate])



  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate);
  }

  return (
    <>
     <ApplicationHeader/>
      <ImagingSidebar />
      <div className='mx-2'>
          <div className='card br-5'>
            <div className='card-header bg-secondary text-white'>
              <h5>Filter Processed List</h5>
            </div>
            <div className='card-body'>
              <section className='d-flex justify-content-between'>
                <div className='col-3'>
                  <label>from</label>
                <input type='date' value={query.from} onChange={(ev) => { handleChangeWithState(ev, 'from', setQuery, query) }} className='custom-input' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>to</label>
                <input type='date' onChange={(ev) => { handleChangeWithState(ev, 'to', setQuery, query) }} value={query.to} className='custom-input' placeholder='date' />
                </div>
                <div className='col-3'>
                  <label>search using fullname </label>
                <input type='text' onChange={(ev) => { handleChangeWithState(ev, 'search', setQuery, query) }} className='custom-input' value={query.search} placeholder='search using fullname' />
                </div>
              <div className='col-2 mt-3'>
                <button onClick={filter} className='btn btn-primary btn-sm mt-1'>search</button>
                <button onClick={(ev) => setQuery(defaultState)} className='btn btn-danger  btn-sm mt-1 mx-1'>clear</button>
                </div>
              </section>
            </div>
          </div>
          <h4 className='mt-2 text-success'>Processed List</h4>
        <TableDisplay filtering={true} showpage={false} column={columns} data={data} />
        <div className='d-flex justify-content-center'>
          <Pagination updateFunction={updateFunction} load={setLoadPage} />
        </div>
      </div>
    </>
  )
}
