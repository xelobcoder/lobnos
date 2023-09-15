import React,{useState,useContext,useEffect} from 'react'
import { PatientContext } from '../../pages/patients'
import { customFetch } from '../Auth/customFetch';
import { Menu } from '@mui/icons-material';
import TableTrPatient from './TableTrPatient';

export default function TestsTable() {
  const { initials, updateInitials } = useContext(PatientContext);
  const { selected, selectedValue } = initials;
  const data = initials.selectedBillingidTest;
  const [menu,setMenu] = useState(false)

  const testStatus = async function (id) {
    const response = await customFetch(`testpanel/list/update?billingid=${id}`)
    const { statusCode, result } = response;
    statusCode === 200 ? updateInitials({ ...initials, selectedBillingidTest: result }) : updateInitials({ ...initials, selectedBillingidTest: [] })
  }

  useEffect(() => {
    if (selected == true && selectedValue) {
      testStatus(selectedValue);
    }
  }, [selected, selectedValue])



  return (
    <>
      {
        (selected && selectedValue) && (
          <div className='bg-white p-2'>
            <h5 className='text-warning text-capitalize'>Transaction test records</h5>
            <table className='table'>
              <thead className='table-secondary text-capitalize br-7'>
                <tr>
                  <th>#</th>
                  <th>billing id</th>
                  <th>test name</th>
                  <th>collected</th>
                  <th>processed</th>
                  <th>result ready</th>
                  <th>result approved</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {
                  data.length > 0 && (
                    data.map((item, index) => {
                      return (
                        <TableTrPatient key={index} index={index} item={item}/>
                      )
                    })
                  )
                }
              </tbody>
            </table>
          </div>
        )
      }
    </>
  )
}
