import { useState, useEffect, useCallback, useContext } from "react";
import Loader from '../../components/accessories/Loader';
import { getDataAndUpdateState, parseDate, updatePagination } from "../../components/Auth/customFetch";
import Pagination from "../accessories/pagination";
import TableDisplay from "../accessories/TableDisplay";

export default function RejectedSamplesComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 })
  const [load, setLoad] = useState(false);



  const fetchInitialData = useCallback(async function () {
    getDataAndUpdateState(setData, `rejected?count=${paginate.count}&&page=${paginate.page}`, false, setLoading)
  }, [paginate])


  useEffect(() => { fetchInitialData(); }, [fetchInitialData])




  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate)
  }


  const columns = [
    { Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className="text-capitalize">{value}</div> },
    {
      Header: 'details', accessor: 'age', Cell: ({ value, row }) => {
        const { gender, mobilenumber } = row.original;
        return (<div>{value}{" || "}{gender}{" || "}{mobilenumber}</div>)
      }
    },

    { Header: 'test', accessor: 'name', Cell: ({ value }) => <span className="border-bottom border-danger border-2">{value}</span> },
    { Header: 'collected on', accessor: "collection_date", Cell: ({ value }) => parseDate(value) },
    { Header: 'validated On', accessor: "samplevalidatedon", Cell: ({ value }) => <div>{new Date(value).toLocaleDateString()}</div> },
    { Header: 'last validated by', accessor: 'validatedby', Cell: ({ value }) => <div>{value}</div> },
    { Header: 'reason', accessor: 'rejectionmessage',width:200 },
    {
      Header: 'actions', accessor: '', Cell: ({ row }) => {
        const item = row.original;
        return (
          <span>
            <button className="btn btn-sm btn-secondary"
              onClick={() => {
                window.open(`/sample/rejected/history?ascensionid=${item.ascensionid}`)
              }}>
              history
            </button>
            <button className="btn btn-sm btn-warning mx-1">redraw</button>
          </span>
        )
      }
    }
  ]


  const renderingView = () => {
    if (loading) return <Loader />
    else {
      return (
        <section className="ui">
          <TableDisplay showpage={false} column={columns} data={data} filtering={true} />
          <div className="d-flex justify-content-center">
            <Pagination page={paginate.page} updateFunction={updateFunction} load={setLoad} />
          </div>
        </section>
      )
    }
  }


  return (
    <>
      <h4>Rejected Sample List</h4>
      {renderingView()}
    </>
  )
}