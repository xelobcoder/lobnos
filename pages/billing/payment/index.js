import { useState, useEffect, useCallback } from "react";
import Navbar from "../../../components/payment/Navbar";
import TableDisplay from "../../../components/accessories/TableDisplay";
import { customFetch, updatePagination } from "../../../components/Auth/customFetch";
import { useRouter } from "next/router";
import SettingsLayout from "../../../components/settingsComponents/SettingsLayout";
import SidebarFrontPage from "../../../components/frontpagesidebar";
import Loader from '../../../components/accessories/Loader';
import Pagination from '../../../components/accessories/pagination';
export default function Payment_Extra() {
  const initValues = { from: "", to: "", month: "", patientid: "", count: 10, page: 1 }
  // using this state , we bind to the checkbox and can print, whatsapp or email client receipt 
  const [querystate, setQueryState] = useState(initValues);
  const [loadPage, setLoadPage] = useState(false);
  const [isloading, setLoading] = useState(true);
  const [selectedBilling, setBilling] = useState(null);
  // this temporarily stores the transaction data to prevent frequent backend fetching
  const [temporary, setTemporary] = useState([]);
  // store all the returned transactions data
  const [transactionData, setTransactionsData] = useState([]);
  // create a router instance
  const router = useRouter();
  // definition of rows
  const columns = [
    {
      Header: "Date", accessor: "date",
      Cell: ({ value }) => <span style={{ width: '90px !important' }}>{new Date(value).toLocaleDateString()}</span>
    },
    {
      Header: "Patient ID", accessor: "patientid",
      Cell: ({ value, row }) => (
        <div>
          <div onClick={(e) => setQueryState({ ...querystate, patientid: value })}>
          {value}
          </div>
          <div>
            {">> "}billingid({row.original.billingid})
          </div>
        </div>
      ),
    },
    {
      Header: 'Fullname', accessor: 'fullname'
    },
    {
      Header: "brief details",
      accessor: "payable",
      Cell: ({ value, row }) => {
        return (
          <div>
            <div> Amount due: {value}</div>
            <div>Amount paid : {row.original.paid_amount}</div>
            <div>
              Outstanding : <span className={`${row.original.outstanding > 0 ? 'text-danger' : 'text-primary'}`}>{row.original.outstanding}</span>
            </div>
          </div>
        )
      },
    },
    {
      Header: "Action",
      accessor: "outstanding",
      Cell: ({ row }) => {
        const outstanding_bill = row.original?.outstanding;
        return (
          <div className="d-flex">
            <button className="btn btn-warning btn-sm mx-1" onClick={(ev) => { router.push(`updatebilling?billingid=${row.original.billingid}&&patientid=${row.original.patientid}`) }}>
              details
            </button>
            <button className="btn btn-warning btn-sm mx-1"
              onClick={(ev) => { router.push(`/billing/payment/invoice/receipt?billingid=${row.original.billingid}`) }}>
              receipt
            </button>
            {outstanding_bill > 0 ?
              <button
                onClick={(ev) => { router.push(`/billing/payment/update/${row.original.patientid}`) }}
                className="btn btn-danger btn-sm" style={{ marginRight: '5px' }}> {" "}settle</button>
              :
              <button className="btn btn-success btn-sm" >
                settled
              </button>
            }
          </div>
        )
      }
    }
  ];


  const handleChange = (event, direct) => {
    setQueryState({ ...querystate, [direct]: event.target.value });
  };

  const handleDropdownSelect = (eventKey) => {
    setQueryState({ ...querystate, month: eventKey });
  };

  const updateBill = (event) => {
    if (querystate.patientid != null && querystate.patientid != '') {
      router.push(`/billing/payment/update/${querystate.patientid}`)
    }
  };


  const runQuery = useCallback(async () => {
    const { patientid, from, to, count, page } = querystate;
    setLoading(true);
    customFetch(`billing/payment/info/client?from=${from}&&to=${to}&&patientid=${patientid}&&count=${count}&&page=${page}`)
      .then((data) => {
        const { status, statusCode, result } = data;
        if (status == "success" && statusCode == 200) {
          setTransactionsData(result);
          setTemporary(result);
        }
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
        setTransactionsData([]);
        setTemporary([]);
      })

  }, [querystate])

  const clearQuery = () => {
    const { from, to, patientid } = querystate;
    if (from == "" && to == "" && patientid == "") return;
    setQueryState(initValues)
  };

  useEffect(() => { runQuery() }, [runQuery])

  const updatePage = (value) => { updatePagination(value, setQueryState, querystate) }

  const render = () => {
    if (isloading) return <Loader />
    else return (
      <div>
        <TableDisplay
          filtering={true}
          showpage={false}
          column={columns}
          data={transactionData}
        />
        <div className="d-flex justify-content-center">
          <Pagination page={querystate.page} updateFunction={updatePage} load={setLoadPage} />
        </div>
      </div>
    )
  }

  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage/>}>
        <div >
          <Navbar
            handleChange={handleChange}
            query={querystate}
            clearQuery={clearQuery}
            select={handleDropdownSelect}
            updateBill={updateBill}
            selectedBilling={selectedBilling}
          />
          <h4 className="mx-2">Transactions</h4>
          {render()}
        </div>
      </SettingsLayout>
    </>
  );
}
