import { useState } from 'react';
import { RiEditLine, RiDeleteBinLine } from '@remixicon/react';

export default function DepartmentList({ data, handleDelete, handleEdit }) {
  const [departments, setDepartments] = useState(data || []);

  return (
    <div className="table-responsive  rounded">
      <table className="table table-hover align-middle small">
        <thead className="bg-light">
          <tr>
            <th className="px-4 py-3 fs-6">Department</th>
            <th className="px-4 py-3 fs-6">Department Manager</th>
            <th className="px-4 py-3 fs-6 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="fs-6">
          {data?.map((row) => (
            <tr key={row.id}>
              <td className="px-4">{row.department}</td>
              <td className="px-4">{row.departmentManager}</td>
              <td>
                <div className="d-flex justify-content-center gap-2">
                  <button 
                    onClick={() => handleEdit(row)} 
                    className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 small"
                  >
                    <RiEditLine size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 small"
                  >
                    <RiDeleteBinLine size={14} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
