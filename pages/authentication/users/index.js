import { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList'
import { activateInstitutionUser, getInstitutionUsers, customPost, updatePagination } from '../../../components/Auth/customFetch'
import Loader from '../../../components/accessories/Loader';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';

export default function ApplicationUsersPage() {
  const [users, setUser] = useState([]);
  const [isloading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [pagequery, setPageQuery] = useState({ count: 10, page: 1, load: false });

  useEffect(() => {
    getInstitutionUsers(setUser, `logins?count=${pagequery.count}&&page=${pagequery.page}`, setLoading);
  }, [pagequery]);


  const updatePage = (value) => {
    if (value === pagequery.page) return;
    updatePagination(value, setPageQuery, pagequery)
  }


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


  const renderer = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div className='container-fluid'>
          <h4>Employee List</h4>
          <UserList
            users={users}
            handleDelete={handleDelete}
            activateUser={activateInstitutionUser}
            updatePage={updatePage}
            load={setLoad}
            updateRefresh={setUser} />
      </div>
      )
    }
  }
  return (
    <AuthenticationLayout>
      {renderer()}
    </AuthenticationLayout>
  )
}
