import { Container } from "react-bootstrap";
import { customFetch } from "../../../components/Auth/customFetch";
import CaseCountAreaChart from "../../../lib/resultanalaysis/MonthCaseCountChart";

export default async function ResultAnalysisTest(context) {
    const queryParams = context.searchParams;
    const { testid, show, duration, expandedTarget } = queryParams;
    let response = [];
    let dayHeaders = [];
    const currentMonth = parseInt(context.searchParams.month ) || new Date().getMonth() + 1;
    let monthCasesShow = duration && duration === "month" && show === "allcaseCount"
    const currentYear = new Date().getFullYear();


    if (monthCasesShow) {
        response = await customFetch(`result/analysis/test/month?employeeid=3&&testid=${testid}&&month=${currentMonth}`);

        if (response && Array.isArray(response) && response.length > 0) {
            dayHeaders = response.map((item, index) => item.day);
        }
    }





    return (
        <Container>
            {monthCasesShow && <div>
                <h5 className="text-center">{currentMonth}/{currentYear}</h5>
                <hr />
                <table className="table ">
                    <thead>
                        <tr>
                            <th>day</th>
                            {dayHeaders.map((item, index) => <th key={index}>{item}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>case count</td>
                            {dayHeaders.map((item, index) => {
                                const _matched = response.find((it, ind) => it['day'] == item);
                                if (_matched) return <td key={index}>{_matched?.caseCount}</td>
                            })}
                        </tr>
                    </tbody>
                </table>
                <hr />
                <h5 className="text-center">Chart</h5>
                <CaseCountAreaChart data={response} />
            </div>}
        </Container>
    )
}