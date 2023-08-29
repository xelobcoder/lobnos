import React, { useState, useEffect } from 'react'
import MiniCard from '../../components/operations/miniCard'
import { Bloodtype } from '@mui/icons-material';
import { customFetch, getDepartment } from '../../components/Auth/customFetch';
import SECOND_NO_DATA from '../../components/accessories/secondNodata';

export default function OperationsOverview({ colorIndex }) {
  const [summary, setSummary] = useState([]);
  const [noDeptTest, setNoDeptTest] = useState(false);
  const [department, setDepartments] = useState([]);
  const [totalcount, setTotalCount] = useState(0)

  const getOperationsOverview = async function () {
    const overview = await customFetch('operations/overview');
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
      <h3 className='d-flex justify-content-center text-capitalize mt-2 text-danger'>cases count awaiting result entry by department  for today {new Date().toISOString().slice(0, 10)}</h3>
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
