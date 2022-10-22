import React, { useState, useMemo, useEffect, useRef } from 'react'
import SortList from '../../components/Auth/Roles/sort'
import USERS from '../../components/Auth/Roles/user'
import UserList from '../../components/Auth/Roles/userList';
import { useRouter } from 'next/router';

export default function Authentication_index_page() {
 const [componentview, setComponentView] = useState({
  user: false,
  edit: true,
  list: true
 })



 const router = useRouter();
 const userid = router.query.users;
 const pageRef = useRef(null);





 return (
  <div ref={pageRef}>
   <div className='container-fluid'>
    {(componentview.user && !userid) && <USERS button='save changes' heading='snap user' />}
    {(componentview.edit && userid) && <USERS button='update information' heading='edit user' />}
    {(componentview.list && !userid) && <UserList />}
   </div>
  </div>
 )
}
