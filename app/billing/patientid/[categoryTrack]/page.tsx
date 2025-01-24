import React from 'react'

interface params {
    categoryTrack: number
}
export default async function CategoricalBillingPage({ params }: {
    params: params
}) {
    const { categoryTrack } = await params
    return (
        <div>
            <h1>{categoryTrack}</h1>
        </div>
    )
}
