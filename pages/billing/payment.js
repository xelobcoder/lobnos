import React from 'react'
import Navbar from '../../components/payment/Navbar'
import AccountSummary from '../../components/payment/AccountSummary'
import Transactions from '../../components/payment/Transactions'

export default function Payment_Extra() {
  const dummyTransactions = [
    {
      id: 1,
      date: '2023-05-28',
      billingId: 'B001',
      type: 'Purchase',
      payable: '$100',
      paid: '$50',
      balance: '$50',
      outstanding: '$0',
    },
    {
      id: 2,
      date: '2023-05-27',
      billingId: 'B002',
      type: 'Payment',
      payable: '$0',
      paid: '$50',
      balance: '$0',
      outstanding: '$0',
    },
    {
      id: 2,
      date: '2023-05-27',
      billingId: 'B002',
      type: 'Payment',
      payable: '$0',
      paid: '$50',
      balance: '$0',
      outstanding: '$0',
    },
    {
      id: 2,
      date: '2023-05-27',
      billingId: 'B002',
      type: 'Payment',
      payable: '$0',
      paid: '$50',
      balance: '$0',
      outstanding: '$0',
    },
    {
      id: 2,
      date: '2023-05-27',
      billingId: 'B002',
      type: 'Payment',
      payable: '$0',
      paid: '$50',
      balance: '$0',
      outstanding: '$0',
    },
    {
      id: 2,
      date: '2023-05-27',
      billingId: 'B002',
      type: 'Payment',
      payable: '$0',
      paid: '$50',
      balance: '$0',
      outstanding: '$0',
    },
  ];


  return (
    <div style={{ backgroundColor: 'whitesmoke', height: '100vh' }}>
      <Navbar />
      <div style={{ display: 'grid', gridTemplateColumns: '20% auto', gridGap: '20px', margin: '10px 4%' }}>
        <AccountSummary />
        <Transactions transactions={dummyTransactions} />
      </div>
    </div>
  )
}
