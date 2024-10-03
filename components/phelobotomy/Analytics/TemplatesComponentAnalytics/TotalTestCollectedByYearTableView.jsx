import { useEffect, useState } from "react";
import { DirectFetchResponse } from "../Lib";

export default function TotalTestCollectedByYearTableView() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);




    useEffect(() => {
        DirectFetchResponse(setData, 'ascension/analytics/getTotalTestByYears', setIsLoading);
    }, [])

    if (isLoading) return <div>Please Wait!!!. Loading Data.........</div>


    return (
        <div className="card bg-white br-0 p-0 border-0">
            <div className="card-header bg-secondary-subtle  br-0 fw-bold">
                <h5>Test Count By Year</h5>
            </div>
            <div className="card-body p-0">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Year</th>
                            <th>Test Count</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(data) && data.length > 0 && data.map((item, index) => {
                            return <tr key={index}>
                                <td>{item.year}</td>
                                <td>{item.total_tests}</td>
                            </tr>
                        })
                        }
                    </tbody>
                </table>
            </div>
        </div>)
}