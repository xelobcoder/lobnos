import React from 'react';
import { Table } from 'react-bootstrap';

interface RefundWitness {
     witness: string;
     name: string;
     message: string;
     employeeid: number | string;
}

interface CompletedRefund {
     refundid: number;
     serviceCategory: string;
     witnesses: RefundWitness[];
     cost: number;
     amountIncurredDueTax: number;
     billedby: string;
}

interface CompletedRefundViewEmployeeProps {
     data: CompletedRefund[];
}

export default function CompletedRefundViewEmployee({ data }: CompletedRefundViewEmployeeProps) {
     return (
          <div>
               <h4>Completed Refunds</h4>
               <Table striped bordered hover>
                    <thead>
                         <tr>
                              <th>Refund ID</th>
                              <th>Service Category</th>
                              <th>Witnesses</th>
                              <th>Cost</th>
                              <th>Amount Due to Tax</th>
                              <th>Billed By</th>
                         </tr>
                    </thead>
                    <tbody>
                         {data.map((refund) => (
                              <tr key={refund.refundid}>
                                   <td>{refund.refundid}</td>
                                   <td>{refund.serviceCategory}</td>
                                   <td>
                                        <ul>
                                             {refund.witnesses.map((witness, index) => (
                                                  <li key={index}>
                                                       {witness.witness}: {witness.name || "Not Found"} - {witness.message || "No Message"}
                                                  </li>
                                             ))}
                                        </ul>
                                   </td>
                                   <td>{refund.cost}</td>
                                   <td>{refund.amountIncurredDueTax}</td>
                                   <td>{refund.billedby}</td>
                              </tr>
                         ))}
                    </tbody>
               </Table>
          </div>
     );
}
