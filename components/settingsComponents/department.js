import { Button } from '@mui/material';
import React from 'react';
import { useRouter } from 'next/router';
import { Container, FormLabel } from 'react-bootstrap'
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

  const handleDepartmentChange = (event) => {
    setDepartment({ ...department, [event.target.name]: event.target.value })
  }


  const [tab,setTab] = React.useState('submit');


  // use router to relaod and also to look rdit in url for editing a pacticcular department
  const router = useRouter();

  const handleSubmit = (event) => {
    event.preventDefault();
    const sendtoServer = async () => {
      let response = await fetch("http://localhost:5000/api/v1/departments", {
        method: tab === 'submit' ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: tab === 'submit' ? JSON.stringify(department) : JSON.stringify({ ...department, id: router.query.id }),
      });
      let result = await response.json();
      return result;
    };

    if (Object.values(department).includes("")) {
      alert("fill all fields correctly");
    } else {
      sendtoServer()
        .then((result) => {
          const { status, message } = result;

          if (status === "success") {
            console.log(message);
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
            } else{
              router.reload()
            }
          } else {
            setShowMessage({
              display: true,
              type: "error",
              message: message,
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };


  const employees = ['John Doe', 'Jane Doe', 'John Smith', 'Jane Smith'];




  // monitor for edit tab in the url
  React.useEffect(() => {
   const {tab,id} = router.query;
    if(tab === 'edit'){
      setTab('update');
      // fetch department from server
      const fetchDepartment = async () => {
        let response = await fetch(`http://localhost:5000/api/v1/departments/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        let result = await response.json();
        return result;
      };
      fetchDepartment()
      .then((result) => {
        const { status, message, department } = result;
        if (status === "success") {
          setDepartment(department[0]);
        } else {
          alert(message);
        }
      }
      )
    }
  }, [router.query.tab])

  return (
    <>
      {
        showMessage.display ? (<TopMessage message='Department Added Successfully'
          type={showMessage.type}
          display={showMessage.display}
          messageTimer={
            () => setTimeout(() => {
              setShowMessage({ display: false, type: '', message: '' })
            }, 3000)}
        />
        ) : null
      }
      <Container>
        <div id='addsupplier'>
          <form>
            <div className='form-group'>
              <FormLabel htmlFor='department'>Department</FormLabel>
              <input type='text' className='custom-input' id='department'
                name='department'
                value={department.department}
                onChange={handleDepartmentChange}
                placeholder='Enter Department' />
            </div>
            <div className='form-group'>
              <FormLabel htmlFor='department'>Department Manager</FormLabel>
              <select className='custom-input' id='departmentManager'
                name='departmentManager'
                value={department.departmentManager}
                onChange={handleDepartmentChange}
              >
                <option value=''>Select Department Manager</option>
                {employees.map((employee, index) => (
                  <option key={index} value={employee}>
                    {employee}
                  </option>
                ))}
              </select>
            </div>
            <Button variant='contained'
              onClick={handleSubmit}
              color='primary' type='button' className='mt-4'>
              {tab}
            </Button>
          </form>
        </div>
      </Container>
    </>
  )
}
