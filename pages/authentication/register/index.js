import React, { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList';
import { Add } from '@mui/icons-material';
import { handleResponse, validateFormData,customFetch, customPost} from '../../../components/Auth/customFetch';

export default function Authentication_index_page() {
  const [register, setRegister] = useState({
    name: '',
    email: '',
    password: '',
    cpassword: '',
    role: '',
  });

  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister({ ...register, [name]: value });
  }

  const handleSubmit = async (e) => {
    const { name, email, password, cpassword, role } = register;

    if (password !== cpassword) {
      alert('password does not match');
      return;
    }
    else {
      await validateFormData({ name, email, password, role }, true, [], 'logins', handleResponse);
      setRefresh(true);
    }
  }

  const handleDelete = async (id) => {
  //  show a confimation message before deleting
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (confirm) {
      const response = await customPost(`logins`, 'DELETE',{id});
      const { statusCode, message, result } = response;
      if (statusCode === 200) {
        alert(message);
        setRefresh(true);
      }
    }
  }


  const editUser = async (id) => {
    const response = await customFetch(`logins/${id}`);
    const { statusCode, message, result } = response;
    if (statusCode === 200) {
      setRegister(result);
    }
  }


  const getUsers = async () => {
    const response = await customFetch('logins');
    const { statusCode, message, result } = response;
    if (statusCode === 200) {
      setUser(result);
    }
  }

  // get users on page load
  useEffect(() => {
    getUsers();
  }, []);


  // get users on refresh
  useEffect(() => {
    getUsers();
    setTimeout(() => {
      setRefresh(false);
    },1000);
  }, [refresh]);

  return (
    <>
      <div className='container-fluid'>
        <div>
          <div className="card mt-2 p-0" style={{ borderRadius: "5px" }}>
            <div className="card-header bg-secondary text-white d-flex justify-content-between">
              <h6 className="text-capitalize mt-2">add new user</h6>
              <Add sx={{ cursor: 'pointer' }} />

            </div>
            <div className="card-body p-2">
              <form autoCapitalize='on' autoComplete='off' accessKey='E'>
                <div className="row d-flex">
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="name">username</label>
                      <input

                        type="text"
                        className="form-control" required
                        id="name"
                        onChange={handleChange}
                        value={register.name}
                        name='name'
                        placeholder="name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="email">email</label>
                      <input
                        type="email"
                        name='email'
                        onChange={handleChange}
                        value={register.email}
                        className="form-control" required
                        id="email"
                        placeholder="email"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="password">password</label>
                      <input
                        type="password"
                        onChange={handleChange}
                        value={register.password}
                        name='password'
                        className="form-control" required
                        id="password"
                        placeholder="password"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="cpassword">confirm password</label>
                      <input
                        type="password"
                        className="form-control" required
                        id="cpassword"
                        onChange={handleChange}
                        value={register.cpassword}
                        name='cpassword'
                        placeholder="confirm password"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="role">role</label>
                      <select className="form-control"
                        onChange={handleChange}
                        value={register.role}
                        name='role' required id="role">
                        <option value=''>select role</option>
                        <option value='admin'>admin</option>
                        <option value='customer service representative'>customer service representative</option>
                        <option value='scientist'>scientist</option>
                        <option value='manager'>manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12 mt-2 mt-4">
                    <div className="form-group">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSubmit}
                        style={{ borderRadius: "5px" }}
                      >
                        add user
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <UserList users={user} handleDelete={handleDelete} editUser = {editUser} />
    </>
  );
}




