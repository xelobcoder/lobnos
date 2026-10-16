'use client'
import React, { useEffect, useState } from 'react'
import ApplicationUserLoginHx from '../../../components/settingsComponents/ApllicationUserLoginHx'
import { customFetch } from '../../../components/Auth/customFetch';
import { useApplication } from '../../../components/Auth/useApplicationContext';
import Loader from '../../../components/isLoading';
import { toast } from 'react-toastify';

export default function UserPage() {
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
               toast.error('Failed to load login history', { position: 'top-right', autoClose: 2000 });
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
          <div className="container-fluid p-4">
               <select onChange={handleEmployeeChange} className="form-select form-select-sm mb-3 w-auto">
                    <option value="">Select Employee</option>
                    {employeesList.map((employee) => (
                         <option key={employee.employeeid} value={employee.employeeid}>
                              {employee.username}
                         </option>
                    ))}
               </select>
               {loading ? (
                    <Loader />
               ) : (
                    <ApplicationUserLoginHx history={history} employeeid={employeeid} onChanged={getHistory} />
               )}
          </div>
     )
}
