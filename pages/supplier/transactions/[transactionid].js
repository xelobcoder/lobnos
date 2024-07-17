import { useEffect, useState } from "react";
import SupplierLayout from "../../../components/inventory/SupplierLayout";
import { customFetch } from "../../../components/Auth/customFetch";
import { useRouter } from "next/router";
import TableDisplay from "../../../components/accessories/TableDisplay";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'; // Ensure you have this icon from Material-UI

export default function ViewTransactionsDetailPage() {
          const transactionid = useRouter().query.transactionid;
          const [data, setData] = useState([]);
          const [hoveredRow, setHoveredRow] = useState(null);

          useEffect(() => {
                    if (transactionid) {
                              customFetch(`orders?orderTransactionid=${transactionid}`)
                                        .then((data) => {
                                                  const { result } = data;
                                                  Array.isArray(result.products) && setData(result.products);
                                        })
                                        .catch((err) => {
                                                  console.log(err);
                                        });
                    }
          }, [transactionid]);

          const importantColumns = [
                    {
                              Header: 'Transaction ID',
                              accessor: 'orderTransactionid'
                    },
                    {
                              Header: 'Stock',
                              accessor: 'name'
                    },
                    {
                              Header: 'Supplier Name',
                              accessor: 'suppliername'
                    },
                    {
                              Header: 'Purchase Unit',
                              accessor: 'purchaseunit'
                    },
                    {
                              Header: 'Date',
                              accessor: 'date',
                              Cell: ({ value }) => value ? new Date(value).toLocaleString() : ''
                    },
                    {
                              Header: 'Quantity',
                              accessor: 'quantity'
                    },
                    {
                              Header: 'Status',
                              accessor: 'received',
                              Cell: ({ value }) => <button className={`btn btn-sm ${value === "TRUE" ? "btn-success" : "btn-warning"}`}>{value === 'TRUE' ? 'Received' : 'Pending'}</button>
                    },
                    {
                              Header: 'Total Amount',
                              accessor: 'totalamount'
                    },
                    {
                              Header: 'Details',
                              accessor: 'details',
                              Cell: ({ row }) => (
                                        <div
                                                  style={{ cursor: 'pointer' }}
                                                  onClick={() => setHoveredRow(row.id)}
                                                  onMouseLeave={() => setHoveredRow(null)}
                                        >
                                                  <button className="btn  btn-primary btn-sm"><MoreHorizIcon /></button>
                                                  {hoveredRow === row.id && (
                                                            <div style={{
                                                                      position: 'absolute',
                                                                      left: '80%',
                                                                      right: "0",
                                                                      top: "0",
                                                            
                                                                      backgroundColor: 'white', padding: '10px', border: '1px solid #ccc', zIndex: 999
                                                            }}>
                                                                      <div><strong>Quantity Received:</strong> {row.original.quantityReceived}</div>
                                                                      <div><strong>Batch Number:</strong> {row.original.batchnumber}</div>
                                                                      <div><strong>Balance:</strong> {row.original.balance}</div>
                                                                      <div><strong>Expiry:</strong> {row.original.expirydate ? new Date(row.original.expirydate).toLocaleString() : ''}</div>
                                                                      <div><strong>Received Date:</strong> {row.original.receiveddate ? new Date(row.original.receiveddate).toLocaleString() : ''}</div>
                                                                      <div><strong>Status:</strong> {row.original.status}</div>
                                                                      <div><strong>Price:</strong> {row.original.price}</div>
                                                                      <div><strong>Product Used:</strong> {row.original.productused}</div>
                                                                      <div><strong>Pricing:</strong> {row.original.pricing}</div>
                                                                      <div><strong>Brand:</strong> {row.original.brand}</div>
                                                                      <div><strong>Expired Disposed:</strong> {row.original.expiredDisposed}</div>
                                                                      <div><strong>Disposal Date:</strong> {row.original.disposaldate ? new Date(row.original.disposaldate).toLocaleString() : ''}</div>
                                                                      <div><strong>Requested By:</strong> {row.original.requestedby}</div>
                                                                      <div><strong>Received By:</strong> {row.original.receivedby}</div>
                                                                      <div><strong>Transaction Date:</strong> {row.original.transactiondate ? new Date(row.original.transactiondate).toLocaleString() : ''}</div>
                                                            </div>
                                                  )}
                                        </div>
                              )
                    }
          ];

          return (
                    <SupplierLayout>
                              <h6>Transaction Details</h6>
                              <TableDisplay
                                        column={importantColumns}
                                        data={data}
                              />
                    </SupplierLayout>
          );
}
