import React, { useState, useEffect } from 'react'
import MiniCard from '../../components/operations/miniCard'
import { Bloodtype } from '@mui/icons-material';
import { customFetch, getDepartment } from '../../components/Auth/customFetch';
import SECOND_NO_DATA from '../../components/accessories/secondNodata';
import { Button } from '@mui/material';
import { useRouter } from 'next/router';

export default function OperationsOverview({ colorIndex }) {
  const [summary, setSummary] = useState([]);
  const [noDeptTest, setNoDeptTest] = useState(false);
  const [department, setDepartments] = useState([]);
  const [totalcount, setTotalCount] = useState(0)


  const navigate = useRouter();

  const getOperationsOverview = async function () {
    const overview = await customFetch('operations/overview?stage=unentered');
    const { status, statusCode, result } = overview;
    if (statusCode == 200 && status == 'success') {
      const departments = department.map((item, index) => {
        return { department: item.department, id: item.id };
      })

      if (department.length == 0) {
        setNoDeptTest(true)
      } else {
        setSummary(departments.map((item, index) => {
          const count = result.filter((e, i) => { { return e.department == item.department; } });
          return { department: item.department, count: count.length, id: item.id }
        }))
        setTotalCount(result.length)
      }
    }
  }


  useEffect(() => {
    getDepartment(setDepartments)
    if (department.length > 0) {
      getOperationsOverview()
    }
  }, [department.length])




  return (
    <>
      <div className='d-flex justify-content-between m-3'>
        <h3 className='d-flex justify-content-center text-capitalize  text-danger'>cases count awaiting result entry by department  for today {new Date().toISOString().slice(0, 10)}</h3>
        <Button variant='contained' color='success' onClick={(e) => navigate.push('/operations/enteredresult')}>view entered result</Button>
      </div>
      <hr />
      {
        noDeptTest ? <div className='mt-3'> <SECOND_NO_DATA message={'No test added to departments'} /> </div> : (
          <div className='minicard-wrapper' >
            <MiniCard
              number={totalcount}
              colorIndex={0}
              text={'all department'}
              color={"green"}
              link={`/operations/departments/all`}
              icon={<Bloodtype sx={{ height: "50%", width: "50%" }} />}
            />
            {summary.map((item, index) => {
              return (
                <MiniCard
                  key={index}
                  number={item.count}
                  colorIndex={1 + index}
                  text={item.department}
                  color={"green"}
                  link={`/operations/departments/${item.id}`}
                  icon={<Bloodtype sx={{ height: "50%", width: "50%" }} />}
                />
              )
            })}
          </div>
        )
      }
    </>
  );
}
