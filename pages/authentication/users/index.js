import React, { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList'
import { activateInstitutionUser, getInstitutionUsers ,customPost} from '../../../components/Auth/customFetch'
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout';
import AuthenticationSidebar from '../../../components/settingsComponents/AuthenticationSidebar';

export default function ApplicationUsersPage() {
  const [users, setUser] = useState([]);

  useEffect(() => { getInstitutionUsers(setUser) }, []);


  const handleDelete = async (id) => {
    //  show a confimation message before deleting
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (confirm) {
      const response = await customPost(`logins`, 'DELETE', { id });
      const { statusCode, message, result } = response;
      if (statusCode === 200) {
        alert(message);
      }
    }
  }

  return (
    <SettingsLayout sidebar={<AuthenticationSidebar />}>
      <div className='container-fluid'>
        <h2>Employee List</h2>
        <UserList users={users} handleDelete={handleDelete} activateUser={activateInstitutionUser} updateRefresh={setUser} />
      </div>
    </SettingsLayout>
  )
}
