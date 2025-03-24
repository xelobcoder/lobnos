import { PieChart, Pie, Tooltip, Cell, Label, Legend, ResponsiveContainer } from "recharts";
import { currencyFormatter } from "../../../../Lib/fetcher";


export default function WastagesQuarterlyChartPieChart({ pd }) {
    const data = [
        { name: "First Quarter", value: pd?.firstQ },
        { name: "Second Quarter", value: pd?.secondQ },
        { name: "Third Quarter", value: pd?.thirdQ },
    ];

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

    return (
        <ResponsiveContainer width="100%" height={300} className={'bg-white'} >
            <h4 className=" text-decoration-underline text-uppercase">Quarterly Wastages Monetary Values</h4>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    <Label value="Wastage" position="center" />
                </Pie>
                <Tooltip
                    formatter={(value) => currencyFormatter.format(value)}
                />
                <Legend align="center" verticalAlign="bottom" />
            </PieChart>
        </ResponsiveContainer>
    );
}
