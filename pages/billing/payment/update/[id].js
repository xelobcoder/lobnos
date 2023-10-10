import React from 'react'
import UpdateBilling from '../../../../components/payment/updateBilling'
import { useRouter } from 'next/router'
export default function BillingUpdatelientpaymentHistory() {
  const id = useRouter().query.id;
  return (
    <>
      <h1>{id}</h1>
      <UpdateBilling/> 
    </>
  )
}



export async function getServerSideProps(context) {
  const { id } = context.query;

  return {
    props: { name: 'tiiu' }
  }
}