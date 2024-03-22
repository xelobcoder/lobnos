import { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList'
import { activateInstitutionUser, getInstitutionUsers, customPost, updatePagination } from '../../../components/Auth/customFetch'
import Loader from '../../../components/accessories/Loader';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';

export default function ApplicationUsersPage() {
  const [users, setUser] = useState([]);
  const [advanced, setAdvanced] = useState(false);
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



  const renderAdvancedForm = () => {
    if (advanced == true) {
      return (
        <div>
          <form autoComplete='off' className='d-flex mb-1'>
            <div className='form-row col-2'>
              <select className="custom-select" name="role" id="role">
                <option value="">select role</option>
                <option value="admin">admin</option>
                <option value="customer service representative">
                  customer service representative
                </option>
                <option value="scientist">scientist</option>
                <option value="manager">manager</option>
                <option value="clinician">clinician</option>
                <option value="phelobotomist">phelobotomist</option>
                <option value="sonographer">sonographer</option>
              </select>
            </div>
            <div className='form-row col-3 mx-2'>
              <input className='custom-input' type='text' placeholder='username' />
            </div>
            <div className='form-row col-3 mx-2'>
              <input className='custom-input' type='text' placeholder='user email' />
            </div>
            <div className='form-row col-2 mx-2'>
              <input className='custom-input' type='text' placeholder='user contact' />
            </div>
            <div>
              <button type='button' className='btn btn-sm btn-secondary' style={{ marginTop: '1px' }}>
                filter user
              </button>
              <button type='button' style={{ marginTop: '1px' }} onClick={(ev) => { setAdvanced(false) }} className='btn btn-danger btn-sm mx-2'>
                close
              </button>
            </div>
          </form>
        </div>
      )
    }
  }

  const renderer = () => {
    if (isloading) return <Loader />
    else {
      return (
        <div className='container-fluid'>
          <div className='d-flex justify-content-between'>
            <h4>Employee List</h4>
            {!advanced &&
              <button onClick={(ev) => { setAdvanced(true) }} className='btn btn-secondary btn-sm'>
                Advanced filtering
              </button>}
          </div>
          {/* advanced filtering form start here  */}
          {renderAdvancedForm()}
          {/* advanced filtering form ends here */}
          <UserList
            users={users}
            handleDelete={handleDelete}
            activateUser={activateInstitutionUser}
            updatePage={updatePage}
            load={setLoad}
            showfiltering={advanced}
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
