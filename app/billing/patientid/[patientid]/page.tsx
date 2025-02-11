import React from 'react'
import { plsDecryption } from '../../../../lib/encryption'
import { getOustandingBill } from '../../../../lib/billingLib'
import { redirect } from 'next/navigation'

interface params {
    categorytrackid: number,
    patientid: string
}
export default async function PatientBillingPageIndex({ params }: {
    params: params
}) {
    const { patientid } = await params
    const patientIdDecrypted = plsDecryption(patientid);

    if (patientIdDecrypted) {
        const outstandingDebt = await getOustandingBill(patientIdDecrypted);
        
        if (typeof outstandingDebt == "number" && outstandingDebt > 0) {
            redirect(`/billing/patientid/${patientid}/outstanding-debt`)
        }
    }

    return (
        <div>
            {plsDecryption(patientid.toString())}
        </div>
    )
}
