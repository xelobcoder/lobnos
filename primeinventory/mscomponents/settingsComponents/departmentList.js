import { useState } from 'react';
import TableDisplay from '../accessories/TableDisplay';

export default function DepartmentList({ data, handleDelete, handleEdit }) {
  // get all departments
  const [departments, setDepartments] = useState(data || []);

  const columns = [
    {
      Header: "Department",
      accessor: "department",
    },
    {
      Header: "Department Manager",
      accessor: "departmentManager",
    },
    {
      Header: "Action",
      accessor: "action",
      Cell: ({ row }) => (
        <div className="d-flex">
          <button onClick={() => {
              handleEdit(row.original);
          }} className='btn btn-primary btn-sm'>
            Edit
          </button>
          <button
            onClick={() => {
              handleDelete(row.original.id);
            }}
            className='btn btn-danger btn-sm mx-2'>
            Delete
          </button>
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
