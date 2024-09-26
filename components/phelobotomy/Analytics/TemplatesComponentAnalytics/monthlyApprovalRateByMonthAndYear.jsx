import { useEffect, useState } from "react";
import { DirectFetchResponse } from "../Lib";

export default function MonthlyApprovalRateByMonthAndYear() {
    const [data, setData] = useState([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(true);




    useEffect(() => {
        DirectFetchResponse(setData, `ascension/analytics/monthlyApprovalRate?year=${year}`, setIsLoading);
    }, [])


    const yearHandler = (event) => {
        const { value } = event.target;
        setYear(value);
        const valueLen = value.toString().length
        if (valueLen == 4) {
            DirectFetchResponse(setData, `ascension/analytics/monthlyApprovalRate?year=${value}`, setIsLoading);
        }
    }



    if (isLoading) return <div>Please Wait!!!. Loading Data.........</div>;
    return (
        <div>
            <div className="card border-0">
                <div className="card-header bg-secondary-subtle br-0 bg-light fw-bold d-flex justify-content-between">
                    <div className="mt-2 lead">
                        Monthly Ascension Count With Sample Approval Rates
                    </div>
                    <div>
                        <input value={year} onChange={(ev) => { yearHandler(ev) }} className="custom-input" type="number" />
                    </div>
                </div>
                <div className="card-body">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Month</th>
                                <th>Year</th>
                                <th>Total Test</th>
                                <th>Approval Rate (%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td className="text-capitalize fw-bold">{item.month}</td>
                                    <td>{item.year}</td>
                                    <td>{item.test_count}</td>
                                    <td>{item.monthly_approval_rate}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}