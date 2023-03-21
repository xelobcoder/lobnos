import EditLocationAltSharpIcon from '@mui/icons-material/EditLocationAltSharp';
import AutoDeleteSharpIcon from '@mui/icons-material/AutoDeleteSharp';
import React from 'react';
import TableDisplay from '../accessories/TableDisplay';
import TableIsLoading from '../accessories/TableIsLoading';

export default function DepartmentList({ data, handleDelete, handleEdit }) {
  // get all departments
  console.log(data);
  const [departments, setDepartments] = React.useState(data || []);



  const columns = [
    {
      Header: "id",
      accessor: "id",
    },
    {
      Header: "Department",
      accessor: "department",
    },
    {
      Header: "Department Manager",
      accessor: "departmentManager",
    },
    {
      Header: "Employee Id",
      accessor: "employeeid",
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="d-flex">
          <EditLocationAltSharpIcon
            fontSize="medium"
            variant="contained"
            onClick={() => {
              handleEdit(row.original.id);
            }}
            color="primary"
          />
          <AutoDeleteSharpIcon
            fontSize="medium"
            onClick={() => {
              handleDelete(row.original.id);
            }}
            variant="contained"
            color="error"
          />
        </div>
      ),
    },
  ];



  return (
    <div>
      < TableDisplay column={columns} data={data} />
    </div>
  )
}
