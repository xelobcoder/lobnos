'use client'
import React from 'react'
import TransactionsViewOnly from '../../../../../components/petientsComponent/patientportal/TransactionsViewOnly'
import PatientChartView from '../../../../../components/petientsComponent/patientportal/PatientChartView';
import { useSearchParams } from 'next/navigation';
import { plsDecryption } from '../../../../../lib/encryption';
import PatientPortalAccessPanel from '../../../../../components/PatientPortal/PatientPortalAccessPanel';

export default function Page({ params }: { params: { patientid: string } }) {
     const patientid = params.patientid;
     const pidNumber = patientid ? parseInt(plsDecryption(patientid).toString()) : null;
     return (
          <div>
               {pidNumber && <PatientChartView patientid={pidNumber} />}
               {pidNumber && <PatientPortalAccessPanel patientid={pidNumber} />}
               {pidNumber && <TransactionsViewOnly patientid={pidNumber} />}
          </div>
     )
}
