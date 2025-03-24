import { useState, useEffect, useCallback } from "react";
import Navbar from "../payment/Navbar";
import TableDisplay from "../accessories/TableDisplay";
import { currencyFormatter, customFetch, updatePagination } from "../Auth/customFetch";
import { useRouter } from "next/router";
import Loader from '../accessories/Loader';
import Pagination from '../accessories/pagination';
import { Dropdown } from "react-bootstrap";
import MoreVertIcon from "@mui/icons-material/MoreVert";

export default function Payment_Extra() {
  const initValues = { from: '', to: "", month: "", patientid: "", count: 10, page: 1 }
  const [querystate, setQueryState] = useState(initValues);
  const [loadPage, setLoadPage] = useState(false);
  const [isloading, setLoading] = useState(true);
  const [selectedBilling, setBilling] = useState(null);
  const [transactionData, setTransactionsData] = useState([]);
  const router = useRouter();


  const columns = [
    {
      Header: "Date", accessor: "date",
      Cell: ({ value }) => <span style={{ width: '90px !important' }}>{new Date(value).toLocaleDateString()}</span>
    },
    {
      Header: 'Fullname', accessor: 'fullname'
    },
    {
      Header: "Patient ID", accessor: "patientid",
      Cell: ({ value, row }) => (
        <div onClick={(e) => setQueryState({ ...querystate, patientid: value })}>
          {value}
        </div>
      ),
    },
    {
      Header: "Bill Id", accessor: "billingid"
    },
    {
      Header: "Amt Payable",
      accessor: "payable",
      Cell: ({ value, row }) => {
        return (
          <div>
            {currencyFormatter.format(value)}
          </div>
        )
      },
    },
    {
      Header: "Amount paid",
      accessor: "paid",
      Cell: ({ value, row }) => {
        return (
          <div>
            {currencyFormatter.format(row.original.paid)}
          </div>
        )
      },
    },
    {
      Header: "outstanding",
      accessor: "outstanding",
      Cell: ({ value, row }) => {
        return (
          <div>
            <span className={`${row.original.outstanding > 0 ? 'text-danger' : 'text-primary'}`}>{currencyFormatter.format(row.original.outstanding)}</span>
          </div>
        )
      },
    },
    {
      Header: "Actions", accessor: "", Cell: ({ row }) => {
        const outstanding_bill = row.original?.outstanding;
        return (
          <Dropdown>
            <Dropdown.Toggle variant="light" id="archives-dropdown">
              <MoreVertIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu className="m-0 p-0 bg-white">
              <Dropdown.Item
                className="text-primary text-capitalize"
                onClick={(ev) => {
                  router.push(`/billing/patientid?billingid=${row.original.billingid}&&patientid=${row.original.patientid}`);
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M5 18.89H6.41421L15.7279 9.57627L14.3137 8.16206L5 17.4758V18.89ZM21 20.89H3V16.6473L16.435 3.21231C16.8256 2.82179 17.4587 2.82179 17.8492 3.21231L20.6777 6.04074C21.0682 6.43126 21.0682 7.06443 20.6777 7.45495L9.24264 18.89H21V20.89ZM15.7279 6.74785L17.1421 8.16206L18.5563 6.74785L17.1421 5.33363L15.7279 6.74785Z"></path>
                </svg>
                <span className="mx-2 mt-1"> Update Transaction </span>
              </Dropdown.Item>
              <Dropdown.Item
                onClick={(ev) => {
                  router.push(`/billing/payment/invoice/receipt?billingid=${row.original.billingid}`);
                }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M3 6H21V18H3V6ZM2 4C1.44772 4 1 4.44772 1 5V19C1 19.5523 1.44772 20 2 20H22C22.5523 20 23 19.5523 23 19V5C23 4.44772 22.5523 4 22 4H2ZM13 8H19V10H13V8ZM18 12H13V14H18V12ZM10.5 10C10.5 11.3807 9.38071 12.5 8 12.5C6.61929 12.5 5.5 11.3807 5.5 10C5.5 8.61929 6.61929 7.5 8 7.5C9.38071 7.5 10.5 8.61929 10.5 10ZM8 13.5C6.067 13.5 4.5 15.067 4.5 17H11.5C11.5 15.067 9.933 13.5 8 13.5Z"></path>
                </svg>
                <span className="mx-2 mt-1"> print Receipt </span>
              </Dropdown.Item>
              {outstanding_bill > 0 && (
                <Dropdown.Item>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M7 4V2H17V4H22V6H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V6H2V4H7ZM6 6V20H18V6H6ZM9 9H11V17H9V9ZM13 9H15V17H13V9Z"></path>
                  </svg>

                  <span
                    className="mx-2 mt-1"
                    onClick={(ev) => {
                      router.push(`/billing/payment/update/${row.original.patientid}`);
                    }}>
                    {" "}
                    settle Bill
                  </span>
                </Dropdown.Item>
              )}
              <Dropdown.Item>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                  <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM8 9V11H16V9H8ZM8 13V15H16V13H8Z"></path>
                </svg>{" "}
                <span className="mx-2 mt-1">Generate invoice</span>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        );
      }
    },
    // {
    //   Header: "Action",
    //   accessor: "",
    //   Cell: ({ row }) => {
    //     const outstanding_bill = row.original?.outstanding;
    //     return (
    //       <div className="d-flex">
    //         <button className="btn btn-primary btn-sm mx-1" onClick={(ev) => { router.push(`/billing/updatebilling?billingid=${row.original.billingid}&&patientid=${row.original.patientid}`) }}>
    //           update bill
    //         </button>
    //         <button className="btn btn-warning btn-sm mx-1"
    //           onClick={(ev) => { router.push(`/billing/payment/invoice/receipt?billingid=${row.original.billingid}`) }}>
    //           receipt
    //         </button>
    //         <button className="mx-1 btn-info btn-sm btn">
    //           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM8 9V11H16V9H8ZM8 13V15H16V13H8Z"></path></svg> invoice
    //         </button>
    //         {outstanding_bill > 0 ?
    //           <button
    //             onClick={(ev) => { router.push(`/billing/payment/update/${row.original.patientid}`) }}
    //             className="btn btn-danger btn-sm" style={{ marginRight: '5px' }}> {" "}settle</button>
    //           :
    //           <button
    //             onClick={(ev) => { router.push(`/billing/payment/update/${row.original.patientid}`) }}
    //             className="btn btn-success btn-sm" >
    //             settled
    //           </button>
    //         }
    //       </div>
    //     )
    //   }
    // }
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
    let searchFrom = null;
    let searchTo = null;

    const hasQueryKeys = Object.keys(router.query).length;
    if (hasQueryKeys > 0) {
      searchFrom = router.query.from;
      searchTo = router.query.to;
    } else {
      searchFrom = from; searchTo = to;
    }

    if (hasQueryKeys < 0 && searchFrom == "") return;
    setLoading(true);
    customFetch(`billing/payment/info/client?from=${searchFrom}&&to=${searchTo}&&patientid=${patientid}&&count=${count}&&page=${page}`)
      .then((data) => {
        const { status, statusCode, result } = data;
        if (status == "success" && statusCode == 200) {
          setTransactionsData(result);
        }
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
        setTransactionsData([]);
      })

  }, [querystate, router.query])

  const clearQuery = () => {
    const { from, to, patientid } = querystate;
    if (Object.keys(router.query).length > 0) {
      router.replace(router.pathname);
    }
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
          styling={"ttable table"}
          data={transactionData}
        />
        <div className="d-flex justify-content-center">
          <Pagination
            page={querystate.page}
            updateFunction={updatePage}
            load={setLoadPage} />
        </div>
      </div>
    )
  }

  return (
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
  );
}
