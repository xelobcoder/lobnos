import React, { useState, useEffect } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useRouter } from 'next/router';
import Add_department from '../../components/settingsComponents/department';
import DepartmentList from '../../components/settingsComponents/departmentList';
import { customPost, getDepartment } from '../../components/Auth/customFetch';
import MainSettingsLayoutView from '../../components/settingsComponents/MainSettingsLayoutView';

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
    <MainSettingsLayoutView>
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
          <DepartmentList data={department} handleDelete={handleDelete} handleEdit={handleEdit} />
        </Tab>
        <Tab eventKey="" title="" disabled></Tab>
      </Tabs>
    </MainSettingsLayoutView>
  );
}


