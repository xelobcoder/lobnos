'use client'
import React, { use } from 'react';
import TransactionsViewOnly from '../../../../../components/petientsComponent/patientportal/TransactionsViewOnly'
import PatientChartView from '../../../../../components/petientsComponent/patientportal/PatientChartView';
import { useSearchParams } from 'next/navigation';
import { plsDecryption } from '../../../../../lib/encryption';
import PatientPortalAccessPanel from '../../../../../components/PatientPortal/PatientPortalAccessPanel';

export default function Page(props: { params: Promise<{ patientid: string }> }) {
     const params = use(props.params);
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
