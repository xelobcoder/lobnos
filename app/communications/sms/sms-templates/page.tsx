import React from 'react';
import { customFetch } from '../../../../components/Auth/customFetch';
import Link from 'next/link';
import styles from '../../../../styles/smsTemplateList.module.css';

interface Placeholder {
     value: string;
     field: string;
}

interface SmsTemplate {
     tempateid: number;
     templateName: string;
     placeholders: Placeholder[];
     smscontent: string;
     createdby: number;
     createdon: string;
}

interface SmsTemplatesResponse {
     templates: SmsTemplate[];
     pagination: {
          currentPage: number;
          totalCount: number;
          totalPages: number;
     };
}

const fetchTemplates = async (count: number, page: number) => {
     try {
          const response = await customFetch(`sms/sms-templates/all?count=${count}&&page=${page}`);
          return response;
     } catch (error) {
          console.error("Error fetching templates:", error);
          throw new Error("An error occurred while fetching templates.");
     }
};

export default async function SmsTemplateList({ searchParams }: { searchParams: { count: number, page: number } }) {
     const { count, page } = searchParams;
     let templates: SmsTemplate[] = [];
     let errorMessage: string | null = null;
     let pagination = {
          currentPage: 1,
          totalCount: 0,
          totalPages: 1
     };

     try {
          const response = await fetchTemplates(count, page);
          templates = response?.templates || [];
          pagination = response?.pagination || pagination;
     } catch (error) {
          errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
     }

     if (errorMessage) {
          return <div className={styles.noData}>{errorMessage}</div>;
     }

     if (templates.length === 0) {
          return <div className={styles.noData}>No data found</div>;
     }

     return (
          <div className={`${styles.container} container-fluid`}>
               <div className="d-flex justify-content-between">
                    <h3 className={styles.header}>SMS Templates</h3>
                    <button className="btn btn-primary btn-sm text-white">
                         <Link className="text-white text-decoration-none" href={'/sms/create-sms-templates'}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                                   <path fill="none" d="M0 0h24v24H0z"></path>
                                   <path d="M11 11V5H13V11H19V13H13V19H11V13H5V11H11Z"></path>
                              </svg> Add New Template
                         </Link>
                    </button>
               </div>
               <div className={`${styles.tableWrapper} table-responsive`} >
                    <table className={styles.table}>
                         <thead>
                              <tr>
                                   <th>#</th>
                                   <th>Template Name</th>
                                   <th>SMS Content</th>
                                   <th>Created On</th>
                              </tr>
                         </thead>
                         <tbody>
                              {templates.map((template) => (
                                   <tr key={template.tempateid}>
                                        <td><input type="checkbox" className={styles.checkbox} /></td>
                                        <td>{template.templateName}</td>
                                        <td>{template.smscontent}</td>
                                        <td>{new Date(template.createdon).toLocaleString()}</td>
                                   </tr>
                              ))}
                         </tbody>
                         <tfoot>
                              <tr>
                                   <td colSpan={3}> <span>Total Templates: {pagination.totalCount}</span></td>
                                   <td>
                                        <div className={styles.pagination}>
                                             {pagination.currentPage > 1 && (
                                                  <Link className={styles.paginationBtn} href={`/sms/sms-templates?page=${pagination.currentPage - 1 === 0 ? pagination.currentPage : pagination.currentPage - 1}&&count=10`}>
                                                       Prev
                                                  </Link>
                                             )}
                                             {pagination.currentPage < pagination.totalPages && (
                                                  <Link className={styles.paginationBtn} href={`/sms/sms-templates?page=${pagination.currentPage + 1}&&count=10`}>
                                                       Next
                                                  </Link>
                                             )}
                                        </div>
                                   </td>
                              </tr>
                         </tfoot>
                    </table>
               </div>
          </div>
     );
}
