import { Container } from "react-bootstrap";
import { customFetch } from "../../../../components/Auth/customFetch";
import MonthResultValuesComponent from "../../../../lib/resultanalaysis/MonthResultValuesComp";

export default async function ResultValuesAnalysisTest(context) {
    const queryParams = context.searchParams;
    const { testid, show, duration, isGroupedByDate = 1 } = queryParams;
    let response = [];
    const currentMonth = parseInt(context.searchParams.month) || new Date().getMonth() + 1;
    let monthResultShow = duration && duration === "month" && show === "resultvalues";
    const currentYear = new Date().getFullYear();


    if (monthResultShow) {
        response = await customFetch(`result/analysis/test/resultvalues?employeeid=3&&testid=${testid}&&month=${currentMonth}&&year=${currentYear}`);
    }


    if (response.length === 0) return <div className="alert alert-warning">No data available</div>
    if (response.length > 0) {
        if (isGroupedByDate == 1) {
            const uniqueDates = new Set(response.map((item) => new Date(item.created_on).toLocaleDateString()));
            console.log(uniqueDates.size);
        }
    }





    return (
        <Container>
            <MonthResultValuesComponent data={response} />
        </Container>
    )
}