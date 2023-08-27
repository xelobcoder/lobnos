import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useRouter } from 'next/router';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import Add_department from '../../components/settingsComponents/department';
import DepartmentList from '../../components/settingsComponents/departmentList';
import { Suspense } from 'react';
import { useEffect } from 'react';
import { customFetch, customPost,getDepartment } from '../../components/Auth/customFetch';

export default function Department() {
  const [key, setKey] = useState('department_list');
  const [department, setDepartments] = useState([]);


  // delete department

  // edit department
  const router = useRouter();



  useEffect(() => {
    getDepartment(setDepartments)
  }, [])

  const handleDelete = (id) => {
    const deleteDepartment = async () => {
      let response = await customPost('departments', 'DELETE', { id })
      const { status, message } = response;
      if (status === 'success') {
        alert(message)
        setDepartments(department.filter((item) => item.id !== id))
      }
      else {
        alert(message)
      }
    }
  }


  const handleEdit = (details) => {
    const { department, departmentManager, employeeid, id } = details;
    setKey('add_department');
    router.push(`/settings/department?tab=edit&&id=${id}&&employeeid=${employeeid}&&department=${department}&&departmentManager=${departmentManager}`)
  }
  return (
    <SettingsLayout>
      <Tabs
        id="controlled-tab-example"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="add_department" title="Add Department">
          <Add_department />
        </Tab>
        <Tab eventKey="department_list" title="Department list">
          <Suspense fallback={<div>Loading...</div>}>
            <DepartmentList data={department} handleDelete={handleDelete} handleEdit={handleEdit} />
          </Suspense>
        </Tab>
        <Tab eventKey="" title="" disabled></Tab>
      </Tabs>
    </SettingsLayout>
  );
}


