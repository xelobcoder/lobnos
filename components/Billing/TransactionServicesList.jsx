import { Table } from 'react-bootstrap';
import { currencyFormatter } from '../Auth/customFetch';

export default function TransactionServicesList({ previousTransactions = [], handleTransactionCheckboxChange, selectedTransactions ,employeeid}) {
    return (
        <Table className="table table-sm pls-color" striped bordered hover responsive>
            <thead>
                <tr>
                    <th>Select</th>
                    <th>Service Name</th>
                    <th>Date Added</th>
                    <th>Cost</th>
                    <th>Discount</th>
                    <th>Amount Incurred Due Tax</th>
                    <th>Night Adjustment</th>
                    <th>Night Adjustment Mode</th>
                    <th>Night Adjustment Value</th>
                    <th>Total Cost</th>
                    <th>Total Payable</th>
                    <th>Tax Value</th>
                    <th>Tax Included</th>
                    <th>Outsourced</th>
                    <th>Outsource ID</th>
                    <th>Insurance</th>
                    <th>Claim Code</th>
                    <th>Package Used</th>
                    <th>Package ID</th>
                    <th>Refund Status</th>
                    <th>Amount Refunded</th>
                    <th>Outsourcing Organization</th>
                    <th>Witnesses</th>
                </tr>
            </thead>
            <tbody>
                {previousTransactions.map((transaction) => (
                    <tr key={transaction.serviceid}>
                        <td>
                            <input
                                disabled={transaction.witnesses && Array.isArray(transaction.witnesses) && transaction.witnesses.length > 0 && transaction.witnesses.some( (item) => item.employeeid == employeeid)}
                                type="checkbox"
                                checked={selectedTransactions.includes(transaction.serviceid)}
                                onChange={() => handleTransactionCheckboxChange(transaction.serviceid, transaction)}
                            />
                        </td>
                        <td>{transaction.name}</td>
                        <td>{new Date(transaction.serviceAddedOn).toLocaleDateString()}</td>
                        <td>{currencyFormatter.format(transaction.cost)}</td>
                        <td>{currencyFormatter.format(transaction.discount)}</td>
                        <td>{currencyFormatter.format(transaction.amountIncurredDueTax)}</td>
                        <td>{transaction.hasNightAdjustment ? "Yes" : "No"}</td>
                        <td>{transaction.nightAdjustmentMode}</td>
                        <td>{transaction.hasNightAdjustment ? currencyFormatter.format(transaction.nightAdjustmentValue) : "None"}</td>
                        <td>{currencyFormatter.format(transaction.totalcost)}</td>
                        <td>{currencyFormatter.format(transaction.totalpayable)}</td>
                        <td>{currencyFormatter.format(transaction.taxValue)}</td>
                        <td>{transaction.taxIncluded ? "Yes" : "No"}</td>
                        <td>{transaction.isoutsourced ? "Yes" : "No"}</td>
                        <td>{transaction.outsourceid ?? "None"}</td>
                        <td>{transaction.isNHIS ? "NHIS" : transaction.isPHIS ? "PHIS" : "None"}</td>
                        <td>{transaction.claimCode ?? "None"}</td>
                        <td>{transaction.isPackageUsed ? "Yes" : "No"}</td>
                        <td>{transaction.packageid ?? "None"}</td>
                        <td>{transaction.isRefundInitiated ? (transaction.isRefundCompleted ? "Completed" : "Pending") : "Not Initiated"}</td>
                        <td>{currencyFormatter.format(transaction.amountRefunded)}</td>
                        <td>{transaction.outsourcingOrganization ?? "None"}</td>
                        <td>
                            {transaction.witnesses && transaction.witnesses.length > 0 ? (
                                <ul>
                                    {transaction.witnesses.map((witness, index) => (
                                        <li key={index}>{witness.username}</li>
                                    ))}
                                </ul>
                            ) : (
                                "None"
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
