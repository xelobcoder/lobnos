import { DeleteOutlineTwoTone } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useState, useMemo } from 'react';
import AddIcon from '@mui/icons-material/Add';


export default function TestProfileBilling({ test }) {
  const [testportal, setTestPortal] = useState([]);
  const [previousTest, setPreviousTest] = useState(test || []);
  const [workingTest, setWorkingTest] = useState([]);
  // using useMemo get the test data
  useMemo(() => {
    // get the test data
    const getTest = async () => {
      const res = await fetch(`${process.env.BASEURL}/testpanel/list`)
      const data = await res.json()
      if (data.length > 0) {
        setTestPortal(data)

        if (previousTest.length > 0) {
          // get the test data from the database
          const test = previousTest.map((item) => {
            return data.find((i) => i.NAME === item)
          })

          setWorkingTest(test)
        }
      }

    }
    getTest();

  }, [])


  console.log(workingTest)









  return (
    <>
      <div className='add-new-test'>
        <input className='custom-input' type='text' placeholder='Search Test' />
        <button className='custom-button'>
          <AddIcon />
          Add Test
        </button>
      </div>
      <div className='billing-personal-info'>
        {/* create a table */}
        <table id='custom-table'>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Test Price</th>
              <th>action</th>
            </tr>
          </thead>
          <tbody>
            {/* map through the test data */}
            {
              workingTest.length > 0 && workingTest.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.NAME}</td>
                    <td>{item.PRICE}</td>
                    <td>
                      <DeleteOutlineTwoTone color='error' />
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    </>
  )
}
