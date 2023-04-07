import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { useRouter } from 'next/router';
import Add_department from '../../components/settingsComponents/department';
import DepartmentList from '../../components/settingsComponents/departmentList';
import { Suspense } from 'react';

export default function Department({ departments }) {
  const [key, setKey] = useState('department_list');
  const [department, setDepartments] = useState(departments || []);


  // delete department

  // edit department
  const router = useRouter();

  const handleDelete = (id) => {
    const deleteDepartment = async () => {
      let response = await fetch(`http://localhost:5000/api/v1/departments`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
      })
      let result = await response.json();
      return result
    }
    deleteDepartment()
      .then((result) => {
        const { status, message } = result
        if (status === 'success') {
          alert(message)
          setDepartments(department.filter((item) => item.id !== id))
        }
        else {
          alert(message)
        }
      })
      .catch((err) => {
        console.log(err)
      })
  }


  const handleEdit = (id) => {
    setKey('add_department');
    router.push(`/settings/department?tab=edit&&id=${id}`)
  }
  return (
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
  );
}



// get server side props

export async function getServerSideProps(context) {
  const departments = await fetch('http://localhost:5000/api/v1/departments')
  const departmentsData = await departments.json();

  const { data, status, message } = departmentsData;

  if (status === 'success') {
    return {
      props: {
        departments: data
      }
    }
  }
}
