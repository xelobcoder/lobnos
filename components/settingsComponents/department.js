import { useEffect, useState } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { FormLabel } from 'react-bootstrap';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import {ToastContainer,toast} from 'react-toastify';

export default function Add_department() {
  const searchParams = useSearchParams();
  const [department, setDepartment] = useState({department: '',departmentManager: '',employeeid: ""})

  const [employeeList, setEmployeeList] = useState([])

  const handleDepartmentChange = (event) => {
    setDepartment({ ...department, [event.target.name]: event.target.value })
  }

  const handleEmployeeChange = (event) => {
    const { value } = event.target
    // find from employee list
    const employee = employeeList.find((employee) => employee.employeeid == value);
    if (!employee) return;
    const { username } = employee;
    setDepartment({ ...department, departmentManager: username, employeeid: value })
  }


  const [tab, setTab] = useState('submit');
  // use router to relaod and also to look rdit in url for editing a pacticcular department
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendtoServer = async () => {
      const response = await customPost('departments', tab === 'submit' ? "POST" : "PUT", tab === 'submit' ? department : { ...department, id:searchParams.get('id')});
      const { status, message } = response;

      if (status === "success") {
        toast.success(message, { autoClose: '1000' })
        setDepartment({department: "",departmentManager: "",employeeid: 0});
        if (searchParams.get("tab") === 'edit') {
          setTab('submit');
          router.push('/settings/department');
          setTimeout(() => {

          }, 500)
        } else {        }
      } else {
        toast.error(message, { autoClose: '1000' })
      }
    }

    if (Object.values(department).includes("")) {
      toast.info('please fill all the fields', { autoClose: '1000' });
    } else {
      sendtoServer();
    }
  };


  const getEmployees = async () => {
    const response = await customFetch('logins');
    const { message, statusCode, result } = response;
    statusCode === 200  && message == 'Success' ? setEmployeeList(result) : setEmployeeList([]);
  }


  useEffect(() => {
    getEmployees();
  }, [])



  // monitor for edit tab in the url
  const id = searchParams.get('id');
  const employeeid = searchParams.get('employeeid');
  const urltab = searchParams.get('tab');
  const departmantName = searchParams.get('department');
  const departmentManager = searchParams.get('departmentManager');

  useEffect(() => {
    if (urltab === 'edit') {
      setTab('update');
      // fetch department from server
      setDepartment({department: departmantName,departmentManager: departmentManager,employeeid: employeeid})
    }
  }, [id, employeeid, departmentManager,urltab,departmantName])

  return (
    <>
      <ToastContainer/>
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
                  className="custom-select"
                  id="departmentManager"
                  name="departmentManager"
                  value={department.departmentManager}
                  onChange={(e) => handleEmployeeChange(e)}
                >
                  <option value={department.departmentManager}>{department.departmentManager || 'Select Department Manager'}</option>
                  {employeeList.map((employee, index) => (
                    <option key={index} value={employee.employeeid}>
                      {employee?.username}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="card-footer">
            <button className='btn btn-primary btn-sm' onClick={handleSubmit} >
              {tab}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
