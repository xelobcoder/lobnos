import { useState, useCallback, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList'
import { activateInstitutionUser, getInstitutionUsers, customPost, updatePagination, handleChangeWithState } from '../../../components/Auth/customFetch'
import Loader from '../../../components/accessories/Loader';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';


export default function ApplicationUsersPage() {
  const [users, setUser] = useState([]);
  const [advanced, setAdvanced] = useState(false);
  const [isloading, setLoading] = useState(true);
  const [load, setLoad] = useState(false);
  const [filters, setFiltering] = useState({ name: '', role: '', email: "", contact: '' });
  const [pagequery, setPageQuery] = useState({ count: 10, page: 1, load: false });


  const getUsersData = useCallback(
    async () => {
      getInstitutionUsers(setUser, `logins?count=${pagequery.count}&&page=${pagequery.page}&&name=${filters.name}&&email=${filters.email}&&role=${filters.role}&&contact=${filters.contact}`, setLoading)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagequery])


  useEffect(() => {
    getUsersData();
  }, [getUsersData]);


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



  const updateFilering = (ev) => {
    const { name } = ev.target;
    handleChangeWithState(ev, name, setFiltering, filters);
  }


  const initFilteringUsers = (ev) => {
    ev.preventDefault();
    const { name, email, role, contact } = filters;
    if (Object.values(filters).some((item, index) => { return item.toString().length > 0 })) {
      let endpoint = `logins?count=${pagequery.count}&&page=${pagequery.page}&&name=${name}&&email=${email}&&role=${role}&&contact=${contact}`;
      getInstitutionUsers(setUser, endpoint, setLoading);
    }
  }


  const renderAdvancedForm = () => {
    if (advanced == true) {
      return (
        <div>
          <form autoComplete='off' className='d-flex mb-1'>
            <div className='form-row col-2'>
              <select value={filters.role} onChange={(ev) => { updateFilering(ev) }} className="custom-select" name="role" id="role">
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
              <input value={filters.name} onChange={(ev) => { updateFilering(ev) }} name='name' className='custom-input' type='text' placeholder='username' />
            </div>
            <div className='form-row col-3 mx-2'>
              <input value={filters.email} onChange={(ev) => { updateFilering(ev) }} name='email' className='custom-input' type='text' placeholder='user email' />
            </div>
            <div className='form-row col-2 mx-2'>
              <input value={filters.contact} onChange={(ev) => { updateFilering(ev) }} name='contact' className='custom-input' type='text' placeholder='user contact' />
            </div>
            <div>
              <button onClick={(ev) => { initFilteringUsers(ev) }} type='button' className='btn btn-sm btn-secondary' style={{ marginTop: '1px' }}>
                filter user
              </button>
              <button type='button' style={{ marginTop: '1px' }} onClick={(ev) => { setAdvanced(false);getUsersData() }} className='btn btn-danger btn-sm mx-2'>
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
            page={pagequery.page}
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


