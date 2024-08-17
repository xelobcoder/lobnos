import { Container } from "react-bootstrap";
import { customFetch } from "../../../components/Auth/customFetch";
import ResultAnalysisRow from "../../../lib/resultanalaysis/RowAnalysis";

export default async function ResultAnalysisAllTestView() {
    const response = await customFetch(`result/analysis/test/alltest/yearlycount?employeeid=3`);


    const months = [
        "January", "February", "March", "April", "May",
        "June", "July", "August", "September", "October",
        "November", "December"
    ];


    return (
        <Container>
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Test ID</th>
                            <th>test</th>
                            {months.map(month => (
                                <th key={month} className="month-header">{month.split("").slice(0, 3).join("")}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(response) && response.length > 0 && response.map((item, index) => (
                            <ResultAnalysisRow key={index} index={index} months={months} item={item} />
                        ))}
                    </tbody>
                </table>
            </div>
        </Container>
    );
}
