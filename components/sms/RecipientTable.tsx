import React from "react";
import { Alert } from "react-bootstrap";
import styles from "../../styles/SmsTemplateList.module.css";


interface Recipient {
     mobile: string;
     message: string;
     name: string;
}

interface RecipientTableProps {
     recipients: any[]
}

const RecipientTable: React.FC<RecipientTableProps> = ({ recipients = [] }) => {

     if (recipients.length === 0) {
          return (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                    <Alert variant="info">No recipients found for this message.</Alert>
               </div>
          );
     }

     return (
          <div>
               <h4 className="p-3 bg-secondary-subtle">Message Recipients</h4>
               <table className={styles.table}>
                    <thead>
                         <tr>
                              <th>Name</th>
                              <th>Mobile</th>
                              <th>Message</th>
                              <th>status</th>
                              <th>Action</th>
                         </tr>
                    </thead>
                    <tbody>
                         {recipients.map((recipient, index) => (
                              <tr key={index}>
                                   <td>{recipient.name}</td>
                                   <td>{recipient.mobile}</td>
                                   <td>
                                        <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                                             {recipient.message}
                                        </pre>
                                   </td>
                                   <td></td>
                                   <td>
                                        <button className="btn btn-primary btn-sm">
                                             Resend
                                        </button>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </div>
     );
};

export default RecipientTable;
