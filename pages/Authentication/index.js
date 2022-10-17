import React from 'react'
import SortList from '../../components/Auth/Roles/sort'
import USERS from '../../components/Auth/Roles/user'
import UserList from '../../components/Auth/Roles/userList'

export default function Authentication_index_page() {

  return (
    <div>
      <div className='container-fluid'>
        {/* <USERS/> */}
        <UserList/>
      </div>
    </div>
  )
}
