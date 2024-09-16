import { Error } from "@mui/icons-material";
import { useContext, useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { currencyFormatter, customFetch } from "../../Auth/customFetch";
import { BillingContext } from "./BillingContext";

export default function PreviousBilledTestRecords({ billingid }) {
    const { billingdata, updateBilling } = useContext(BillingContext);
    const [isLoading, setLoading] = useState(true);
    const [previousTest, setPreviousTest] = useState([]);

    const getPreviousBileTest = async function () {
        try {
            if (billingid) {
                setLoading(true)
                let { result } = await customFetch(`testpanel/list/update?billingid=${billingid}`);
                if (result && Array.isArray(result) && result.length > 0) {
                    result = result.map((item) => { return { ...item, isPrevious: true } })
                    setPreviousTest(result)
                    updateBilling({ ...billingdata, previousRecords: result })
                }
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getPreviousBileTest();
    }, [billingid]);

    const canRefund = (item) => {
        return item && typeof item === "object" && item.processing && item.processing == "false";
    }

    if (isLoading && billingid) return <div>Loading Previous Billed Test .....</div>;
    if (previousTest.length === 0 && billingid) return <div className="text-capitalize"><Error color="error" /> No previous records found </div>


    return (
        <div>
            <h5>Previous Records</h5>
            <Table className="billing-cart-table table">
                <thead>
                    <tr>
                        <th style={{ width: '40%' }}>test</th>
                        <th style={{ width: '10%' }}>quantity</th>
                        <th style={{ width: '10%' }}>price</th>
                        <th style={{ width: '10%' }}>date</th>
                        <th style={{ width: '15%' }}>time </th>
                        <th style={{ width: '15%' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {previousTest.map((item, index) => {
                        return (<tr  >
                            <td>{item.name}</td>
                            <td>1</td>
                            <td>{currencyFormatter.format(item.price)}</td>
                            {/* to be changed to billing date instead of the ascension date */}
                            <td>{new Date(item.billedon).toLocaleDateString()}</td>
                            <td>{new Date(item.billedon).toLocaleTimeString()}</td>
                            <td>
                                {canRefund(item) && <button className="btn text-capitalize btn-danger btn-sm p-1">refund</button>
                                }
                            </td>
                        </tr>)
                    })}
                </tbody>
            </Table>
        </div>
    )
}