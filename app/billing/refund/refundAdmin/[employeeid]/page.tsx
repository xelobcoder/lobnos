import React from 'react'
import RefundAdmin from '../../../../../components/Billing/Refund/RefundAdmin';
import { customFetch } from '../../../../../components/Auth/customFetch';
import { Dangerous } from '@mui/icons-material';

export default async function RefundAdminPage({ params ,searchParams}: {
    params: { employeeid: number },
    searchParams?: {
       status: string,
    }
}) {
    let result: any = []
    const { employeeid} = await params
    const status = await searchParams?.status ||  'pending'

    try {
        const response = await customFetch(
            `billing/refund/details/status?status=${status}&&employeeid=${employeeid}&&page=1&&count=10`
        );
        if (response && Array.isArray(response?.result)) {
            result = response?.result || [];
        }
    } catch (err) {
        return <div className='alert alert-danger pls-color col-3'>
            <Dangerous color='error' sx={{ width: '100px', height: '100px' }} />
            Error Loading Refund Data</div>
    }


    return (
        <div style={{width:'100%', overflowX:"auto"}}>
            <RefundAdmin initData={result} employeeid={employeeid} currentStatus={status|| 'pending'} />
        </div>
    )
}
