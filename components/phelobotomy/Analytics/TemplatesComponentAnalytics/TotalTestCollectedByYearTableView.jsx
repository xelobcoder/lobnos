import { useEffect, useState } from "react";
import { DirectFetchResponse } from "../Lib";
import style from '../../../../styles/SmsTemplateList.module.css'

export default function TotalTestCollectedByYearTableView() {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        DirectFetchResponse(setData, 'ascension/analytics/getTotalTestByYears', setIsLoading);
    }, [])

    if (isLoading) return <div>Please Wait!!!. Loading Data.........</div>

    return (
        <>
            <h5 className="fw-bold br-5  bg-secondary-subtle p-3 mb-0 mt-2">Test Count By Year</h5><div className={style.tablewrapper}>
            <table className={style.table}>
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
                        </tr>;
                    })}
                </tbody>
            </table>
        </div></>
    )
}
