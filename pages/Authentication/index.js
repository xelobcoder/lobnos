import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import SortList from '../../components/Auth/Roles/sort'
import USERS from '../../components/Auth/Roles/user'
import UserList from '../../components/Auth/Roles/userList';
import { useRouter } from 'next/router';
import Header from '../../components/header';
import SidebarFrontPage from '../../components/frontpagesidebar';
import { Box, Button, Container } from '@mui/material';

export default function Authentication_index_page() {
 const [componentview, setComponentView] = useState({
  user: true,
  edit: true,
  list: false
 })

 const [buttontext, setButtontext] = useState('view user list')



 const router = useRouter();
 const userid = router.query.users;
 const pageRef = useRef(null);
 // changes view of button
 const changeRef = useRef(null)




 useEffect(() => {

  const viewHandler = function () {
   componentview.user ? setButtontext('view user list') : componentview.edit ? setButtontext('back') : setButtontext('add new user')

   if (componentview.list && componentview.user) {
    setButtontext('');
    changeRef.current.disabled = 'true'
   }


  }

  viewHandler();
 }, [componentview.user, componentview.list, componentview.edit])


 // click handler for button

 const buttonHandler = function () {
  componentview.user ?
   setComponentView({ user: false, list: true, edit: false }) :
   setComponentView({ user: true, list: false, edit: false })

 }


 // a callback function to move back to role page in edit mode 

 const callup = useCallback(
  () => {
   setComponentView({ edit: true, user: false, list: false })
   changeRef.current.addEventListener('click', function (e) {
    router.push('http://localhost:3000/Authentication')
   })
  },
  [],
 )


 return (
  <>
   <div ref={pageRef} >
    <div className='container' style={{ display: 'flex', justifyContent: 'end', marginTop: '20px' }}>
     <Button ref={changeRef} variant='text' color='primary' onClick={(e) => buttonHandler(e)} sx={{ fontWeight: '400',marginRight:'25px' }}>{buttontext}</Button>
    </div>
    <div className='container'>
     {(componentview.user && !userid) && <USERS button='save changes' heading='snap user' />}
     {(componentview.edit && userid) && <USERS button='update information' heading='edit user' />}
     {(componentview.list && !userid) && <UserList editcall={callup} />}
    </div>
   </div>
  </>
 )
}




