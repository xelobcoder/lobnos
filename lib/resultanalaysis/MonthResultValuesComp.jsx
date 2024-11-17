"use client"
import TableDisplay from '../../components/accessories/TableDisplay'
const MonthResultValuesComponent = ({ data }) => {
    const columns = [
        { Header: 'date', accessor: 'created_on', Cell: ({ value }) => new Date(value).toLocaleDateString() },
        { Header: 'field', accessor: 'field', isMenu:true },
        { Header: 'value', accessor: 'value' },
        { Header: 'resultby', accessor: 'username' },
    ]
    return (
        <div>
            <TableDisplay filtering={true} exporters={false} column={columns} data={data} />
        </div>
    )
}
export default MonthResultValuesComponent;
