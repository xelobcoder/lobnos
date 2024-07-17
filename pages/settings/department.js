import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Add_department from '../../components/settingsComponents/department';
import DepartmentList from '../../components/settingsComponents/departmentList';
import { customPost, getDepartment } from '../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';
import { ToastContainer,toast } from 'react-toastify';

export default function Department() {
  const [key, setKey] = useState('department_list');
  const [department, setDepartments] = useState([]);

  const router = useRouter();

  useEffect(() => {
    getDepartment(setDepartments)
  }, [])

  const handleDelete = (id) => {
    const deleteDepartment = async () => {
      let response = await customPost('departments', 'DELETE', { id })
      const { status, message } = response;
      if (status === 'success') {
        toast.success(message,{autoClose:3000});
        setDepartments(department.filter((item) => item.id !== id))
      }
      else {
        toast.error(message,{autoClose:3000});
      }
    }
    let confirm = window.confirm('Are you sure you want to delete this department?');
    if (!confirm) return;
    deleteDepartment();
  }


  const handleEdit = (details) => {
    const { department, departmentManager, employeeid, id } = details;
    setKey('add_department');
    router.push(`/settings/department?tab=edit&&id=${id}&&employeeid=${employeeid}&&department=${department}&&departmentManager=${departmentManager}`)
  }
  return (
    <MainSettingsLayoutView>
      <ToastContainer />
      <Add_department />
      <DepartmentList data={department} handleDelete={handleDelete} handleEdit={handleEdit} />
    </MainSettingsLayoutView>
  );
}


