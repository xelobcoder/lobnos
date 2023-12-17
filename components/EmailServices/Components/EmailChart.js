import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const EmailLogsBarChart = ({ data }) => {
  return (
    <div className='mx-2'>
       <ResponsiveContainer  width="100%"  height={500} style={{backgroundColor:'white'}}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" stackId="a" fill="#0d6efd" />
        <Bar dataKey="failed" stackId="a" fill="#d63384" />
        <Bar dataKey="success" stackId="a" fill="#198754" />
      </BarChart>
    </ResponsiveContainer>
   </div>
  );
};

export default EmailLogsBarChart;
