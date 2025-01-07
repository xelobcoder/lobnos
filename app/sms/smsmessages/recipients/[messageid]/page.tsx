import React from 'react'
import { customFetch } from '../../../../../components/Auth/customFetch';
import RecipientTable from '../../../../../components/sms/RecipientTable';
export default async function RecipientPage({ params }: {
     params: {
          messageid: number
     }
}) {
     const { messageid } = await params;
     let recipients: any[] = []
     try {
          const response = await customFetch(`sms/scheduled/messages/recipient?messageid=${messageid}`);
          if (Array.isArray(response) && response.length > 0) {
               if (response && Array.isArray(recipients)) {
                    recipients = response;
               }
          } else {
               recipients = []
          }
     } catch (err) {
          console.error("Error fetching recipients:", err);

     } finally {

     }
     return (<RecipientTable recipients={recipients} />)
}
