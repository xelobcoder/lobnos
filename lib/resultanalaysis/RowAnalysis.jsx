import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import Link from "next/link";

const ChangeIcon = (data) => {
    const { state, casesCount } = data;
    if (state === 'positive' && casesCount > 0) return <ArrowUpwardIcon />;
    if (state === "negative" && casesCount > 0) return <ArrowDownwardIcon />;
    return null;
};

export default function ResultAnalysisRow({ item, months, index }) {

    return (
        <tr key={index}>
            <td>{item.testid}</td>
            <td>{item.testname}</td>
            {months.map((month, monthIndex) => {
                const data = item.data[monthIndex];
                return (
                    <td key={month} className="data-cell">
                        <Link href={`/resultanalysis/test?testid=${item.testid}&&show=allcaseCount&&month=${monthIndex+1}&&duration=month&&expandTarget=${item.testid}`}>
                            <div className="data-item d-flex justify-content-between text-sm">
                                <span>{data ? data.casesCount : 0}</span>
                                <span className={data.state === "positive" ? "text-success" : "text-danger"}>
                                    {ChangeIcon(data)}
                                    {data && data.casesCount != 0 ? data.change : ''}
                                </span>
                            </div></Link>

                    </td>
                );
            })}
        </tr>
    )
}