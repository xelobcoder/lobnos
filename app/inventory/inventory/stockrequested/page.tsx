import React from 'react'
import { customFetch } from '../../../Lib/fetcher'
import CardRacks from '../../../components/accessories/CardRack';
import Link from 'next/link';

export default async function InventoryStoreDispatchMainViewPage() {
    let summary: any[] = []
    const summaryFetchResponse = await customFetch(`departments/requisitions/summary`);

    const { result } = summaryFetchResponse;
    if (result && Array.isArray(result) && result.length > 0) {
        summary = result;
    }
    console.log(summary)


    return (
        <div>
            <h4 className='text-primary text-decoration-underline text-capitalize'>Approved Requisition Pending Dispatch or serving.</h4>
            <div className='d-flex '>
                {summary.map((item, index) => {
                    return (
                        <div className='col-4 mx-1' key={index}>
                            <CardRacks header={<h4 className='d-flex justify-content-center'>{item.department}</h4>} body={<Link href={`/inventory/stockrequested/${item.departmentid}`}>
                                <h1 className='d-flex  justify-content-center text-decoration-none text-dark'>  {item.pending} stks</h1></Link>} />
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
