import React, { useState, useEffect } from 'react'
import Navbar from '../../components/payment/Navbar'
import AccountSummary from '../../components/payment/AccountSummary'
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch } from '../../components/Auth/customFetch';
import UpdateBilling from '../../components/payment/updateBilling';


export default function Payment_Extra() {
  const [querystate, setQueryState] = useState({ date: '', month: '', patientid: '' })
  const [selectedBilling, setBilling] = useState(null);
  const [temporary, setTemporary] = useState([])
  const [transactionData, setTransactionsData] = useState([])
  const [updatingBill, setUpdatingBill] = useState({ update: false, billid: null, filteringData: {} })

  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
      Cell: ({ value }) => <span>{value.slice(0, 10)}</span>
    },
    {
      Header: 'Patient ID',
      accessor: 'patientid',
      Cell: ({ value }) => <div onClick={(e) => setQueryState({ ...querystate, patientid: value })}>
        {value}
      </div>
    },
    {
      Header: 'Billing ID',
      accessor: 'billingid',
    },
    {
      Header: 'Amount Due',
      accessor: 'payable',
      Cell: ({ value }) => <span> {value}</span>
    },
    {
      Header: 'Paid Amount',
      accessor: 'paid_amount',
    },
    {
      Header: 'Outstanding',
      accessor: 'outstanding',
      Cell: ({ value, row }) => (
        <div
          style={{
            backgroundColor: value > 0 ? 'red' : 'none',
            color: value > 0 ? 'white' : 'black'
          }}
          {...row.getRowProps()}
          className={value > 0 ? 'red-border-row' : ''}
        >
          {value}
        </div>
      )
    },
  ]


  const handleChange = (event, direct) => {
    setQueryState({ ...querystate, [direct]: event.target.value })
  }

  const handleDropdownSelect = (eventKey) => {
    setQueryState({ ...querystate, month: eventKey })
  };

  const filterData = function (value) {
    const filteredBill = transactionData.filter((item, index) => {
      return item.billingid == value;
    })
    return filteredBill;
  }

  const updateBill = (event) => {
    if (selectedBilling != null) {
      // we filter data from the transaction data
      const data_to_update = filterData(selectedBilling)

      if (data_to_update.length > 0) {
        setUpdatingBill({
          update: true, billid: selectedBilling, filteringData: {
            ...data_to_update[0],
            pay: 0,
            paymentMode: ''
          }
        })
      } else {
        alert('BillingID not found')
      }
    }
  }

  const setBill = (event) => {
    const { value } = event.target;
    setBilling(value)

    if (selectedBilling == null) { return; }

    const filteredBill = filterData(value)

    if (filteredBill.length > 0 && selectedBilling != null) {
      setTransactionsData(filteredBill)
    } else {
      setTransactionsData(temporary)
    }
  }



  const runQuery = async () => {
    let response = await customFetch(`billing/payment/info/client?date=${querystate.date}&&month=${querystate.month}&&patientid=${querystate.patientid}`)

    const { status, statusCode, result } = response;

    if (status == 'success' && statusCode == 200) {
      setTransactionsData(result)
      setTemporary(result)
    }
  }




  return (
    <>
      <div
        style={{
          backgroundColor: "whitesmoke",
          height: "90vh",
          overflowY: "hidden",
        }}
      >
        <Navbar
          handleChange={handleChange}
          query={querystate}
          runquery={runQuery}
          select={handleDropdownSelect}
          updateBill={updateBill}
          setBill={setBill}
          selectedBilling={selectedBilling}
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `${updatingBill.update ? '20% auto' : '100%'}`,
            gridGap: "20px",
            margin: "10px 10px",
          }}
        >
          {updatingBill.update && <AccountSummary data={updatingBill.filteringData} />}
          {updatingBill.update ?
            <UpdateBilling data={updatingBill.filteringData} /> :
            <TableDisplay
              styling={"transactionTable"}
              filtering={false}
              column={columns}
              data={transactionData}
            />}
        </div>
      </div>
    </>
  );
}



