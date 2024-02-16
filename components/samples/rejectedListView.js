import { useState, useEffect, useCallback } from "react";
import Loader from '../../components/accessories/Loader';
import { toast, ToastContainer } from 'react-toastify';
import { customPost, getDataAndUpdateState, updatePagination } from "../../components/Auth/customFetch";
import RejectionMessageModalDialogJsx from "../../components/samples/RejectionMessageModalDialogJsx/RejectionMessageModalDialogJsx";
import Pagination from "../accessories/pagination";
import FlexTableDisplay from "../accessories/FlexTableDisplay";

export default function RejectedSamplesComponent() {
  const [data, setData] = useState([]);
  const [viewRejection, setViewRejection] = useState({ status: false, message: '', id: '' });
  const [loading, setLoading] = useState(true);
  const [paginate, setPaginate] = useState({ count: 10, page: 1 })
  const [load, setLoad] = useState(false);



  const fetchInitialData = useCallback(async function () {
    getDataAndUpdateState(setData, `rejected?count=${paginate.count}&&page=${paginate.page}`, false, setLoading)
  }, [paginate])


  useEffect(() => { fetchInitialData(); }, [fetchInitialData])

  const handleClose = () => { setViewRejection({ status: false, message: '', id: '' }); }


  const removeClient = (id) => {
    if (!id) return;
    setData((prev) => { prev.filter((item, index) => index !== id); })
  }

  const handleDisputed = async (id, reason) => {
    // id refers to index of the data array
    // filter the data array to get the billingid
    const filtered = data[id];

    const { billingid, testid } = filtered;

    const body = { billingid, testid, disputedby: 1, disputedon: new Date(), disputereason: reason };

    const response = await customPost(`sample/rejection/disputed`, 'PUT', body);
    const { status, statusCode, message } = response;
    if (statusCode == 200 && status == 'success') {
      toast.success(message);
      removeClient(id);
      handleClose();
    } else {
      toast.error(message);
    }
  }


  const updateFunction = (value) => {
    updatePagination(value, setPaginate, paginate)
  }


  const columns = [
    { Header: 'collection date', accessor: "collection_date", Cell: ({ value }) => new Date(value).toLocaleDateString() },
    { Header: 'fullname', accessor: 'fullname' },
    {
      Header: 'details', accessor: 'age', Cell: ({ value, row }) => {
        const { gender, mobilenumber } = row.original;
        return (<div>{value}{" || "}{gender}{" || "}{mobilenumber}</div>)
      }
    },
    { Header: 'test', accessor: 'name', Cell: ({ value }) => <span className="border-bottom border-danger border-2">{value}</span> },
    { Header: 'validated On', accessor: "samplevalidatedon", Cell: ({ value }) => <div>{new Date(value).toLocaleDateString()}</div> },
    { Header: 'validated by', accessor: 'validatedby', Cell: ({ value }) => <div>{value}</div> },
    { Header: 'reason', accessor: 'rejectionmessage',width:200 },
    {
      Header: 'actions', accessor: '', Cell: ({ row }) => {
        const item = row.original;
        return (
          <span>
            <button className="btn btn-sm btn-secondary"
              onClick={() => { setViewRejection({ status: true, message: item?.rejectionmessage, id: item?.id }); }}>
              view
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
        <section>
          <FlexTableDisplay showpage={false} column={columns} data={data} filtering={true} />
          <div className="d-flex justify-content-center">
            <Pagination page={paginate.page} updateFunction={updateFunction} load={setLoad} />
          </div>
        </section>
      )
    }
  }


  return (
    <>
      <ToastContainer />
      {renderingView()}
      <RejectionMessageModalDialogJsx handleDisputed={handleDisputed} id={viewRejection.id} message={viewRejection.message} show={viewRejection.status} hide={handleClose} />
    </>
  )
}