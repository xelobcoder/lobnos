'use client'
import React from 'react';
import dynamic from 'next/dynamic';
import TableDisplay from '../../../accessories/TableDisplay';
import Pagination from '../../../accessories/pagination';
import { currencyFormatter, customFetch } from '../../../../Lib/fetcher';
import { GeneralLosessSummaryType, QuarterlyDataBarChart, QuarterlyDataType } from '../../../interfaces/departmentInterface';


const BarChartQuarterView = dynamic(() => import('./BarChartQuarterView'), {
    ssr: false,
    loading: () => <div>Loading chart...</div>
});
const WastagesQuarterlyChartPieChart = dynamic(() => import('./PiechartQuarterly'), {
    ssr: false,
    loading: () => <div>Loading pie chart...</div>
});

export default function WastageChartGrouper({ quarterlyData, active, wastedDataProductList, departmentid, generalSummary }: { quarterlyData: QuarterlyDataBarChart[], active: number, departmentid: number, generalSummary: GeneralLosessSummaryType, wastedDataProductList: QuarterlyDataType }) {


    const columns = [
        { Header: "name", accessor: "name" },
        { Header: "brand", accessor: "brand" },
        { Header: "batchnumber", accessor: "batchnumber" },
        {
            Header: "receivedOn",
            accessor: "receiveddate",
            Cell: ({ row }: { row: { original: QuarterlyDataType } }) => (
                <div>{row.original.receiveddate ? new Date(row.original.receiveddate).toLocaleDateString() : "---"}</div>
            ),
        },
        {
            Header: "expirydate",
            accessor: "expirydate",
            Cell: ({ row }: { row: { original: QuarterlyDataType } }) => (
                <div>{new Date(row.original.expirydate || "").toLocaleDateString()}</div>
            ),
        },
        {
            Header: "Consume on",
            accessor: "debitdate",
            Cell: ({ row }: { row: { original: QuarterlyDataType } }) => (
                <div>{new Date(row.original.debitdate || "").toLocaleDateString()}</div>
            ),
        },
        { Header: "pricing method", accessor: "pricing" },
        { Header: "price", accessor: "price" },
        { Header: "expired qty", accessor: "debitqty" },
        {
            Header: "Amount",
            accessor: "debitAmount",
            Cell: ({ value }: { value: number }) => currencyFormatter.format(value),
        },
    ];




    return (
        <div className='container-fluid' >
            <section className="row">
                <div className="col-12 col-md-4 mb-4">
                    <WastagesQuarterlyChartPieChart pd={generalSummary} />
                </div>
                <div className="col-12 col-md-8">
                    <BarChartQuarterView quarterlyData={quarterlyData} quarter={active} />
                </div>
            </section>
            <div>
                <TableDisplay filtering={true}
                    serverSideFiltering={false}
                    handleSeverSideProcessing={null}
                    column={columns} data={wastedDataProductList} />
                <div className="d-flex justify-content-center mt-3">
                </div>
            </div>
        </div>
    );
}
