import { PieChart, Pie, Tooltip, Cell, Label, Legend } from "recharts"
export default function WastagesQuarterlyChartPieChart({ pd }) {
  const data = [
    { name: "First Quarter", value: pd?.firstQ },
    { name: "Second Quarter", value: pd?.secondQ },
    { name: "Third Quarter", value: pd?.thirdQ },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"]

  return (
    <PieChart width={400} height={400}>
      <Pie data={data} cx={200} cy={200} innerRadius={60} outerRadius={80} fill="#8884d8" dataKey="value">
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        <Label value="Wastage" position="center" />
      </Pie>
      <Tooltip />
      <Legend align="center" verticalAlign="bottom" />
    </PieChart>
  )
}
