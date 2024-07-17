import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";
import CardRack from '../../../components/accessories/CardRacks';
import { customFetch, currencyFormatter } from '../../../components/Auth/customFetch';
import { useContext, useEffect, useState } from "react";
import Loader from '../../../components/accessories/Loader';
import { toast, ToastContainer } from "react-toastify";
import Payment_Extra from "../../../components/Billing/BilledClientsView";
import AuthContext from "../../../components/Auth/useAuthentification";
import Authorization from "../../../components/accessories/authorization";

const _default = {
        registeredClient: 0,
        billedClients: 0,
        dayExpenseSum: 0,
        salesAmount: 0,
        totalCases: 0,
        discount: 0,
        totalAmountReceived: 0,
}

export default function DailSalesViewCustomerRepresentative() {
        const [summary, setSummary] = useState(_default);
        const { auth } = useContext(AuthContext);
        const [loading, setLoading] = useState(false);
        const [active, setActive] = useState(0)
        const { branchid, role, employeeid } = auth;

        useEffect(() => {
                if (branchid) {
                        setLoading(true);
                        customFetch(`summary/daily?branchid=${branchid}`)
                                .then((data) => {
                                        if (Object.keys(_default).length > 0) {
                                                setSummary(data);
                                        } else {
                                                setSummary(_default);
                                        }
                                })
                                .catch((err) => {
                                        setSummary(_default);
                                        toast.error("Something wrong occured", { autoClose: 3000, position: "bottom-right" })
                                })
                                .finally(() => setLoading(false))
                }
        }, [branchid])



        const displaySummary = () => {
                if (loading) return <Loader />
                else {

                        return (
                                <>
                                        <section className="grid grid-5 ui">
                                                <CardRack onClick={(ev) => { setActive(1) }} activestate={active == 1} header={<h6 >Registered Client</h6>} body={<h5 className="d-flex justify-content-center mt-2">{summary.registeredClient}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(2) }} activestate={active == 2} header={<h6 >Billed  Client</h6>} body={<h5 className="d-flex justify-content-center mt-2">{summary.billedClients}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(3) }} activestate={active == 3} header={<h6 >Total sales</h6>} body={<h5 className="d-flex justify-content-center mt-2">{currencyFormatter.format(summary.salesAmount)}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(4) }} activestate={active == 4} header={<h6 >Amount Paid</h6>} body={<h5 className="d-flex justify-content-center mt-2">{currencyFormatter.format(summary.totalAmountReceived)}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(5) }} activestate={active == 5} header={<h6 >Discount</h6>} body={<h5 className="d-flex justify-content-center mt-2">{currencyFormatter.format(summary.discount)}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(6) }} activestate={active == 6} header={<h6 >Pending Debts</h6>} body={<h5 className="d-flex justify-content-center mt-2 text-danger">{currencyFormatter.format(summary.salesAmount - summary.totalAmountReceived)}</h5>} />
                                                <CardRack onClick={(ev) => { setActive(7) }} activestate={active == 7} header={<h6 >Expense Incured</h6>} body={<h5 className="d-flex justify-content-center mt-2 text-danger">{currencyFormatter.format(summary?.dayExpenseSum > 0 ? summary?.dayExpenseSum : 0)}</h5>} />
                                        </section>
                                        {/* <section className="grid grid-5">
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        <div className="list-group-item border-4 border border-bottom-0 mb-2 border-top-0  border-primary border-left-0 p-3 mx-2 bg-white text-capitalize">
                                                registered Client : {summary.registeredClient}
                                        </div>
                                        </section> */}
                                </>
                        )
                }
        }



        const authoriteView = () => {
                if (auth && role) {
                        if (['manager', 'admin', 'customer service representative'.trim()].includes(role)) {
                                return (
                                        <>
                                                <ToastContainer theme="colored" />
                                                {displaySummary()}
                                                <Payment_Extra />
                                        </>
                                )
                        } else {
                                return <Authorization />
                        }
                } else {
                        return <Loader />
                }
        }



        return (
                <FrontDeskLayout>
                        {authoriteView()}
                </FrontDeskLayout>
        )
}