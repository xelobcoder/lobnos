import React from 'react'

interface params {
    categorytrackid: number,
    patientid: number
}
export default async function CategoricalBillingPage({ params }: {
    params: params
}) {
    const { categorytrackid, patientid } = await params
    return (
        <div>
            <h1>{categorytrackid} {patientid}</h1>
        </div>
    )
}
