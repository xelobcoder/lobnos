import React from 'react'
import { customFetch } from '../../../../../components/Auth/customFetch';
import Link from 'next/link';
import styles from '../../../../../styles/smsTemplateList.module.css';
import { Button, ButtonGroup } from 'react-bootstrap';

export default async function UnresolvedMessages({ searchParams }: {
     searchParams: { count: number, page: number }
}) {
     const { count=1, page=10 } = await searchParams;
     let data: any[] = [];
     let totalUnsentMessageCount = 0;
     try {
          const response = await customFetch(`sms/scheduled/messages/unsent?page=${page}&&count=${count}`);
          const { result, totalCount } = response;
          if (Array.isArray(result)) {
               data = result;
               totalUnsentMessageCount = totalCount;
          }
     } catch (err) {
          console.error("Error fetching recipients:", err);
     }


     const linksValuePrev = page != 0 ? `/sms/smsmessages/unresolved?page=${parseInt(page.toString()) - 1}&&count=15` : `/sms/smsmessages/unresolved?page=1&&count=15`

     const linksValueNext = page > 0 ? `/sms/smsmessages/unresolved?page=${parseInt(page.toString()) + 1}&&count=15` : `/sms/smsmessages/unresolved?page=1&&count=15`

     return (
          <React.Fragment>
               <h5>Unsent Messages With Scheduled Past</h5>
               <table className={styles.table}>
                    <thead>
                         <tr>
                              <th>Scheduled Date</th>
                              <th>Scheduled Time</th>
                              <th>Frequency</th>
                              <th>Message</th>
                              <th>Use Case</th>
                              <th>Recipients</th>
                         </tr>
                    </thead>
                    <tbody>
                         {data.map((row) => (
                              <tr key={row.messageid}>
                                   <td>{new Date(row.scheduledDate).toLocaleDateString()}</td>
                                   <td>{row.scheduledTime}</td>
                                   <td>{row.frequency}</td>
                                   <td>{row.message}</td>
                                   <td>{row.usecase}</td>
                                   <td>
                                        <Link href={`/sms/smsmessages/recipients/${row.messageid}`}>
                                             View Recipient
                                        </Link>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>
               <div className='d-flex  justify-content-center'>
                    <ButtonGroup>
                         <Link href={linksValuePrev}>
                              <Button size='sm' className='mx-2' variant='secondary'>Prev</Button>
                         </Link>
                         <Link href={linksValueNext}>
                              <Button size='sm' variant='secondary'>Next</Button>
                         </Link>
                    </ButtonGroup>
               </div>
          </React.Fragment>
     )
}

