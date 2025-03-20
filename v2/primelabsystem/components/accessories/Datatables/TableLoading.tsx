import React from 'react';

export default function TableLoading({ span }: { span: number }) {
     return (
          <tbody>
               <tr>
                    <td colSpan={span}>
                         <div className="d-flex flex-column justify-content-center align-items-center p-4">
                              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                                   <span className="visually-hidden">Loading...</span>
                              </div>
                              <span className="mt-3  fw-medium text-muted pls-color">Loading data, please wait...</span>
                         </div>
                    </td>
               </tr>
          </tbody>
     );
}