"use client"
import { useEffect, useState } from "react"
import { customFetch } from "../../../components/Auth/customFetch";
import Loader from '../../../components/accessories/Loader';
import TableDisplay from "../../../components/accessories/TableDisplay";
import PrimeTable from "../../../components/accessories/Datatables/PrimeTable";


export default function PriceListCheck() {
     const [testlist, setTestList] = useState('');
     const [loading, setLoading] = useState(true);
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
          {Header:'testid', accessor: "testid"},
          { Header: 'name', accessor: 'name' },
          { Header: 'price', accessor: 'discountedValue' }
     ]

     if (loading) return <Loader />
     return (
          <PrimeTable
               filtering={true}
               handleSeverSideProcessing={null}
               serverSideFiltering={false}
               column={columns}
               data={testlist}
          />
     )
}