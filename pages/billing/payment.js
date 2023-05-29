import React, { useState, useEffect } from 'react'
import Navbar from '../../components/payment/Navbar'
import AccountSummary from '../../components/payment/AccountSummary'
import Transactions from '../../components/payment/Transactions';
import TableDisplay from '../../components/accessories/TableDisplay';
import { useRouter } from 'next/router';
import { customFetch } from '../../components/Auth/customFetch';


export default function Payment_Extra() {
  const [querystate, setQueryState] = useState({ date: '', month: '', patientid: '' })

  const [transactionData, setTransactionsData] = useState([])


  const columns = [
    {
      Header: 'Date',
      accessor: 'date',
    },
    {
      Header: 'Billing ID',
      accessor: 'billingid',
    },
    {
      Header: 'Discount',
      accessor: 'discount',
    },
    {
      Header: 'Outstanding',
      accessor: 'outstanding',
    },
    {
      Header: 'Paid Amount',
      accessor: 'paid_amount',
    },
    {
      Header: 'Patient ID',
      accessor: 'patientid',
    },
    {
      Header: 'Payable',
      accessor: 'payable',
    },
  ]

  const router = useRouter();

  const handleChange = (event, direct) => {
    setQueryState({ ...querystate, [direct]: event.target.value })
  }

  const handleDropdownSelect = (eventKey) => {
    setQueryState({ ...querystate, month: eventKey })
    console.log(querystate)
  };


  const runQuery = async () => {
    let response = await customFetch(`billing/payment/info/client?date=${querystate.date}&&month=${querystate.month}&&patientid=${querystate.patientid}`)

    const { status, statusCode, result } = response;

    if (status == 'success' && statusCode == 200) {
      setTransactionsData(result)
      console.log(response)
    }
  }




  return (
    <>
      <div style={{ backgroundColor: 'whitesmoke', height: '90vh', overflowY: 'hidden' }}>
        <Navbar handleChange={handleChange} query={querystate} runquery={runQuery}
          select={handleDropdownSelect} />
        <div style={{ display: 'grid', gridTemplateColumns: '20% auto', gridGap: '20px', margin: '10px 10px' }}>
          <AccountSummary />
          <TableDisplay styling={'transactionTable'} filtering={false} column={columns} data={transactionData} />
          {/* <Transactions transactions={dummyTransactions} /> */}
        </div>
      </div>
    </>
  )
}
