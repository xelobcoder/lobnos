"use client";
import React, { useEffect, useState } from "react";
import { Table, Spinner, Pagination } from "react-bootstrap";
import styles from '../../../styles/SmsTemplateList.module.css'
import { customFetch } from "../../../components/Auth/customFetch";
import Link from "next/link";


interface Message {
     messageid: string;
     frequency: string;
     message: string;
     usecase: string;
     scheduledDate: string;
     scheduledTime: string;
}


const MessagesTable: React.FC = () => {
     const [data, setData] = useState<{ messages: any[], totalCount: number }>({ messages: [], totalCount: 0 });
     const [isLoading, setIsLoading] = useState<boolean>(true);
     const [currentPage, setCurrentPage] = useState<number>(1);
     const rowsPerPage = 10;

     useEffect(() => {
          const fetchMessages = async () => {
               setIsLoading(true);
               try {
                    const response = await customFetch(`sms/scheduled/messages?count=${rowsPerPage}&&page=${currentPage}`);
                    const { messages, totalCount } = response;
                    if (messages && Array.isArray(messages) && messages.length > 0) {
                         setData({ messages, totalCount });
                    } else {
                         setData({ ...data, messages: [] })
                    }
               } catch (error) {
                    console.error("Error fetching messages:", error);
               } finally {
                    setIsLoading(false);
               }
          };

          fetchMessages();
     }, [currentPage]);

     const totalPages = Math.ceil(data.totalCount / rowsPerPage);

     const handlePageChange = (newPage: number) => {
          if (newPage > 0 && newPage <= totalPages) {
               setCurrentPage(newPage);
          }
     };


     if (isLoading) {
          return (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <Spinner animation="border" role="status">
                         <span className="visually-hidden">Loading...</span>
                    </Spinner>
               </div>
          )
     }

     return (
          <div>
               <h4 className="p-3 bg-secondary-subtle">Scheduled Messages</h4>
               <table className={styles.table}>
                    <thead>
                         <tr>
                              <th>Frequency</th>
                              <th>Message</th>
                              <th>Use Case</th>
                              <th>Scheduled Date</th>
                              <th>Scheduled Time</th>
                              <th>Recipients</th>
                         </tr>
                    </thead>
                    <tbody>
                         {data.messages.map((row) => (
                              <tr key={row.messageid}>
                                   <td>{row.frequency}</td>
                                   <td>{row.message}</td>
                                   <td>{row.usecase}</td>
                                   <td>{new Date(row.scheduledDate).toLocaleDateString()}</td>
                                   <td>{row.scheduledTime}</td>
                                   <td>
                                        <Link href={`/sms/smsmessages/recipients/${row.messageid}`}>
                                             View Recipient
                                        </Link>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>
               <div className="d-flex justify-content-center mt-3">
                    <Pagination>
                         <Pagination.Prev
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                         />
                         {[...Array(totalPages)].map((_, idx) => (
                              <Pagination.Item
                                   key={idx + 1}
                                   active={currentPage === idx + 1}
                                   onClick={() => handlePageChange(idx + 1)}
                              >
                                   {idx + 1}
                              </Pagination.Item>
                         ))}
                         <Pagination.Next
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                         />
                    </Pagination>
               </div>
          </div >
     );
};

export default MessagesTable;
