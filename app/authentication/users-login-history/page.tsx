'use client'
import React, { useEffect, useState } from 'react'
import ApplicationUserLoginHx from '../../../components/settingsComponents/ApllicationUserLoginHx'
import { customFetch } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';

export default function page() {
     const [employeesList, setusers] = useState<any[]>([]);
     const [history, sethistory] = useState<any[]>([]);
     const [selectedEmployee, setSelectedEmployee] = useState(null);
     const [loading, setLoading] = useState(false);
     const { user } = useApplication();
     const employeeid = user?.employeeid;


     const getHistory = async () => {
          try {
               const response = await customFetch(`security/users/getlogin/history?page=1&count=10&&employeeid=${employeeid}&&interestedid=${selectedEmployee}`);
               if (response && Array.isArray(response)) {
                    sethistory(response)
               } else {
                    sethistory([]);
               }
          } catch (error) {
               console.error('Error fetching user login history:', error);
               sethistory([]);
          }
     }

     useEffect(() => {
          const getUsers = async () => {
               try {
                    const response = await customFetch('logins')
                    if (response?.status == "success" && response?.result && Array.isArray(response?.result)) {
                         setusers(response?.result)
                    } else {
                         setusers([]);
                    }
               } catch (error) {
                    console.error('Error fetching user login history:', error);
                    setusers([]);
               }
          };
          const fetchAll = async () => {
               try {
                    setLoading(true);
                    await getUsers();
                    await getHistory();
                    setLoading(false);
               } catch (error) {
                    console.error('Error fetching data:', error);
                    setLoading(false);
               }
          }


          fetchAll();
     }, []);



     useEffect(() => {
          if (selectedEmployee) {
               getHistory();
          }
     }, [selectedEmployee])

     const handleEmployeeChange = (e) => {
          setSelectedEmployee(e.target.value);
     }



     return (
          <div>
               <select onChange={handleEmployeeChange} className="mb-3 col-5">
                    <option value="">Select Employee</option>
                    {employeesList.map((employee) => (
                         <option key={employee.employeeid} value={employee.employeeid}>
                              {employee.username}
                         </option>
                    ))}
               </select>
               {loading ? (
                    <div>Loading...</div>
               ) : (
                    <ApplicationUserLoginHx history={history} employeeid={employeeid} />
               )}
          </div>
     )
}
