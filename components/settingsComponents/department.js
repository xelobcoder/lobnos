import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FormLabel } from 'react-bootstrap';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import TopMessage from '../accessories/TopMessage';

export default function Add_department() {
  const [showMessage, setShowMessage] = React.useState({
    display: false,
    type: '',
    message: ''
  })
  const [department, setDepartment] = React.useState({
    department: '',
    departmentManager: '',
    employeeid: 3
  })

  const [employeeList, setEmployeeList] = useState([])

  const handleDepartmentChange = (event) => {
    setDepartment({ ...department, [event.target.name]: event.target.value })
  }

  const handleEmployeeChange = (event) => {
    const { value } = event.target
    // find from employee list
    const employee = employeeList.find((employee) => employee.EMPLOYEEID == value);

    if (employee) {
      const {USERNAME} = employee;
      setDepartment({ ...department, departmentManager: USERNAME, employeeid: value })
    }
  }


  const [tab, setTab] = React.useState('submit');


  // use router to relaod and also to look rdit in url for editing a pacticcular department
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendtoServer = async () => {
      const response = await customPost('departments', tab === 'submit' ? "POST" : "PUT", tab === 'submit' ? department : { ...department, id: router.query.id });

      const { status, message } = response;

      if (status === "success") {
        alert(message);
        setDepartment({
          department: "",
          departmentManager: "",
          employeeid: 3,
        });
        if (router.query.tab === 'edit') {
          setTab('submit');
          router.push('/settings/department');
          setTimeout(() => {
            router.reload();
          }, 500)
        } else {
          router.reload()
        }
      } else {
        setShowMessage({
          display: true,
          type: "error",
          message: message,
        });
      }
    }

    if (Object.values(department).includes("")) {
      alert("fill all fields correctly");
    } else {
      sendtoServer();
    }
  };


  const getEmployees = async () => {
    const response = await customFetch('logins');
    const { message, statusCode, result } = response;
    if (message == "success" && statusCode == 200) {
      setEmployeeList(result);
    } else {
      setEmployeeList([]);
    }
  }


  useEffect(() => {
    getEmployees();
  }, [])



  // monitor for edit tab in the url
  useEffect(() => {
    const { tab, id } = router.query;
    if (tab === 'edit') {
      setTab('update');
      // fetch department from server
      const fetchDepartment = async () => {
        let response = await customFetch(`departments/${id}`)
        const { status, message, department } = response;
        if (status === "success") {
          setDepartment(department[0]);
        } else {
          alert(message);
        }
      }
      fetchDepartment();
    }
  }, [router.query.tab])

  return (
    <>
      {showMessage.display ? (
        <TopMessage
          message="Department Added Successfully"
          type={showMessage.type}
          display={showMessage.display}
          messageTimer={() =>
            setTimeout(() => {
              setShowMessage({ display: false, type: "", message: "" });
            }, 3000)
          }
        />
      ) : null}
      <div className="p-2">
        <div className="card br-7">
          <div className="card-header">
            <h4 className="btn btn-danger">Add Department</h4>
          </div>
          <div className="card-body p-4">
            <form>
              <div className="form-group">
                <FormLabel htmlFor="department">Department</FormLabel>
                <input
                  type="text"
                  className="custom-input"
                  id="department"
                  name="department"
                  value={department.department}
                  onChange={handleDepartmentChange}
                  placeholder="Enter Department"
                />
              </div>
              <div className="form-group">
                <FormLabel htmlFor="department">Department Manager</FormLabel>
                <select
                  className="custom-input"
                  id="departmentManager"
                  name="departmentManager"
                  value={department.departmentManager}
                  onChange={(e) => handleEmployeeChange(e)}
                >
                  <option value="">Select Department Manager</option>
                  {employeeList.map((employee, index) => (
                    <option key={index} value={employee.EMPLOYEEID}>
                      {employee?.USERNAME}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="card-footer">
            <Button
              variant="contained"
              onClick={handleSubmit}
              color="primary"
              type="button"
              className="mt-4"
            >
              {tab}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
