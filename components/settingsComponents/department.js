import { useEffect, useState } from 'react';
import { useRouter,useSearchParams } from 'next/navigation';
import { FormLabel } from 'react-bootstrap';
import { customFetch, customPost } from '../../components/Auth/customFetch';
import {ToastContainer,toast} from 'react-toastify';
import { RiBuilding2Line, RiUserLine } from '@remixicon/react';

export default function Add_department() {
  const searchParams = useSearchParams();
  const [department, setDepartment] = useState({department: '',departmentManager: '',employeeid: ""})
  const [employeeList, setEmployeeList] = useState([])

  const handleDepartmentChange = (event) => {
    setDepartment({ ...department, [event.target.name]: event.target.value })
  }

  const handleEmployeeChange = (event) => {
    const { value } = event.target
    const employee = employeeList.find((employee) => employee.employeeid == value);
    if (!employee) return;
    const { username } = employee;
    setDepartment({ ...department, departmentManager: username, employeeid: value })
  }

  const [tab, setTab] = useState('submit');
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
        }
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
    const { status, statusCode, result } = response;
    if (statusCode === 200 && status == 'success') {
      setEmployeeList(result)
    } else {
      setEmployeeList([])
    }
  }

  useEffect(() => {
    getEmployees();
  }, [])

  const id = searchParams.get('id');
  const employeeid = searchParams.get('employeeid');
  const urltab = searchParams.get('tab');
  const departmantName = searchParams.get('department');
  const departmentManager = searchParams.get('departmentManager');

  useEffect(() => {
    if (urltab === 'edit') {
      setTab('update');
      setDepartment({department: departmantName,departmentManager: departmentManager,employeeid: employeeid})
    }
  }, [id, employeeid, departmentManager,urltab,departmantName])

  return (
    <>
      <div className="card  border-0">
        <div className="card-header modal-color bg-gradient p-3">
          <h5 className="mb-0 fw-semibold">Add Department</h5>
        </div>
        <div className="card-body p-4">
          <form>
            <div className="row g-4">
              <div className="col-md-5">
                <div className="form-group">
                  <FormLabel className="text-secondary small mb-2">Department Name</FormLabel>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <RiBuilding2Line className="text-primary" />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      id="department"
                      name="department"
                      value={department.department}
                      onChange={handleDepartmentChange}
                      placeholder="Enter department name"
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="form-group">
                  <FormLabel className="text-secondary small mb-2">Department Manager</FormLabel>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <RiUserLine className="text-primary" />
                    </span>
                    <select
                      className="form-select border-start-0 ps-0"
                      id="departmentManager"
                      name="departmentManager"
                      value={department.employeeid}
                      onChange={handleEmployeeChange}
                    >
                      <option value="">Select Department Manager</option>
                      {employeeList.map((employee) => (
                        <option key={employee.employeeid} value={employee.employeeid}>
                          {employee?.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="col-md-2">
                <div className="form-group h-100 d-flex align-items-end">
                  <button 
                    className="btn btn-primary w-100 text-capitalize" 
                    onClick={handleSubmit}
                  >
                    {tab === 'submit' ? 'Add Department' : 'Update Department'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
