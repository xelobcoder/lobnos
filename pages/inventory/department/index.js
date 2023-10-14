import React, { useEffect, useState } from 'react'
import { getDepartment } from '../../../components/Auth/customFetch';
import InventoryLayout from '../../../components/inventory/InventoryLayout';
import { useRouter } from 'next/router';
import { Forward } from '@mui/icons-material';


export default function DepartmentRequisitionHomepage() {
  const [departments, setDepartments] = useState([]);
  const navigate = useRouter();
  useEffect(() => { getDepartment(setDepartments) }, [])

  return (
    <InventoryLayout>
      <div className='container p-3'>
        <h3>Departments</h3>
        {departments.length > 0 && (
          <div className='list-group'>
            {departments.map((item, index) => {
              return (
                <li className="list-group-item d-flex  text-capitalize justify-content-between" key={index} >
                  <span>{item?.department}</span>
                  <span>
                    <button
                      onClick={(ev) => {
                        navigate.push(`/inventory/department/${item.id}`);
                      }}
                      className="btn btn-primary btn-sm" >
                      <Forward />
                      visit
                    </button>
                  </span>
                </li>
              );
            })}
          </div>
        )}
      </div>
    </InventoryLayout>
  )
}
