"use client"
import { useEffect, useState } from "react"
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from '../../../components/accessories/Loader';
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";
import { RiAddBoxFill } from "@remixicon/react";
import { useRouter } from 'next/navigation'

export default function PriceListCheck() {
     const [testlist, setTestList] = useState('');
     const [loading, setLoading] = useState(true);
     const router = useRouter();
     const checkoutLink = `/billing/patientid/checkout/multi?ispricingcheckout=1`

     useEffect(() => {
          customFetch('testpanel/list/bulk/billing')
               .then((response) => {
                    const { statusCode, status, data } = response;
                    if (Array.isArray(data) && data.length > 0) {
                         setTestList(data)
                    }
                    setLoading(false)
               }).catch((err) => {
                    setTestList([])
                    alert('something wrong occured');
                    setLoading(false);
               })

     }, [])

     const columns = [
          { Header: 'testid', accessor: "testid" },
          { Header: 'name', accessor: 'name' },
          { Header: 'price', accessor: 'discountedValue' }
     ]

     if (loading) return <Loader />
     return (
          <div>
               <div className="d-flex justify-content-end">
                    <button onClick={(ev) => { router.push(checkoutLink) }} className="btn btn-primary">
                         <RiAddBoxFill />   checkout pricing
                    </button>
               </div>
               <PrimeTable
                    filtering={true}
                    handleSeverSideProcessing={null}
                    serverSideFiltering={false}
                    column={columns}
                    data={testlist}
               />
          </div>
     )
}