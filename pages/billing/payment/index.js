import React, { useState, useEffect } from "react";
import Navbar from "../../../components/payment/Navbar";
import TableDisplay from "../../../components/accessories/TableDisplay";
import { customFetch } from "../../../components/Auth/customFetch";
import { useRouter } from "next/router";
import SettingsLayout from "../../../components/settingsComponents/SettingsLayout";

export default function Payment_Extra() {
  // using this state , we bind to the checkbox and can print, whatsapp or email client receipt 
  const [querystate, setQueryState] = useState({ date: "", month: "", patientid: "" });
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
      Header: '#', accessor: '', Cell: ({ row }) => {
        const billing_id = row.original.billingid;
        return (
          <input type="checkbox" value={billing_id} onChange={(ev) => { setBilling(billing_id) }} checked={selectedBilling === billing_id} />
        )
      }
    },
    { Header: "Date", accessor: "date", Cell: ({ value }) => <span>{value.slice(0, 10)}</span> },
    {
      Header: "Patient ID", accessor: "patientid",
      Cell: ({ value }) => (
        <div onClick={(e) => setQueryState({ ...querystate, patientid: value })}>
          {value}
        </div>
      ),
    },
    { Header: 'Fullname', accessor: 'fullname' },
    {
      Header: "Billing ID",
      accessor: "billingid",
      Cell: ({ value }) => (
        <span onClick={() => setBilling(value)}>{value}</span>
      )
    },
    {
      Header: "Amount Due",
      accessor: "payable",
      Cell: ({ value }) => <span> {value}</span>,
    },
    {
      Header: "Paid Amount",
      accessor: "paid_amount",
    },
    {
      Header: "Outstanding",
      accessor: "outstanding",
      Cell: ({ value, row }) => (
        <div
          className={`${value > 0 ? 'text-danger' : 'text-primary'}`}
          {...row.getRowProps()}>
          {value}
        </div>
      ),
    },
    {
      Header: "Action",
      accessor: "",
      Cell: ({ value, row }) => {
        const outstanding_bill = row.original?.outstanding;
        return (
          <div>
            {outstanding_bill > 0 ? <button className="btn btn-danger btn-sm">settle</button>
              :
              <button className="btn-sm btn btn-success">cleared</button>}
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

  // const filterData = function (value) {
  //   const filteredBill = transactionData.filter((item, index) => {
  //     return item.billingid == value;
  //   });
  //   return filteredBill;
  // };

  const updateBill = (event) => {
    if (querystate.patientid != null && querystate.patientid != '') {
      router.push(`/billing/payment/update/${querystate.patientid}`)
    }
  };

  // const setBill = (event) => { const { value } = event.target; setBilling(value); };

  const runQuery = async () => {
    // get data from backend
    let response = await customFetch(
      `billing/payment/info/client?date=${querystate.date}&&month=${querystate.month}&&patientid=${querystate.patientid}`
    );
    const { status, statusCode, result } = response;
    if (status == "success" && statusCode == 200) {
      setTransactionsData(result);
      setTemporary(result);
    }
  };

  useEffect(() => {
    runQuery()
  }, [])


  return (
    <>
      <SettingsLayout>
        <div >
          <Navbar
            handleChange={handleChange}
            query={querystate}
            runquery={runQuery}
            select={handleDropdownSelect}
            updateBill={updateBill}
            selectedBilling={selectedBilling}
          />
          {(!querystate.date && !querystate.month && !querystate.patientid) && (<h4>Recent Transactions</h4>)}
          <div>
            <TableDisplay
              column={columns}
              data={transactionData}
            />
          </div>
        </div>
      </SettingsLayout>
    </>
  );
}
