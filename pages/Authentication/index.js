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

  const [editData, setData] = useState([])

  const router = useRouter();
  const userid = router.query.users;
  const pageRef = useRef(null);

  useMemo(() => {
    if (userid != null) {
      const userdata = function async () {
        const pulluser_information = async function () {
          let url = await fetch(`/api/roles?userid=${userid}`)
          let response = await url.json();
          return response;
        }
        pulluser_information().then( (data) => {console.log(data)}).catch ( (err)=>console.log(err))
      }
      componentview.edit == true ? userdata() : null
    }
  }, [userid])



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
