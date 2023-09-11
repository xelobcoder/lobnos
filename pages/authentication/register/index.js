import React, { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList';
import { Add } from '@mui/icons-material';
import { handleResponse, validateFormData, customFetch, customPost } from '../../../components/Auth/customFetch';

export default function Authentication_index_page() {
  const defaultData = {
    name: '',
    email: '',
    password: '',
    cpassword: '',
    role: '',
  }
  const [register, setRegister] = useState(defaultData);

  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState([]);
  const [editing, setEditing] = useState(false);

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
      await validateFormData(register, true, [], editing == true ? 'logins/update' : 'logins', handleResponse);
      setRefresh(true);
    }
  }

  const handleDelete = async (id) => {
    //  show a confimation message before deleting
    const confirm = window.confirm('Are you sure you want to delete this user?');
    if (confirm) {
      const response = await customPost(`logins`, 'DELETE', { id });
      const { statusCode, message, result } = response;
      if (statusCode === 200) {
        alert(message);
        setRefresh(true);
      }
    }
  }


  const activateUser = async (id, previousStatus) => {
    let currentv;
    if (previousStatus == 0) {
      currentv = 1;
    }

    if (previousStatus == 1) {
      currentv = 0;
    }
    //  show a confimation message before deleting
    const confirm = window.confirm('Are you sure you want to activate this user?');
    if (confirm) {
      const response = await customPost(`user/authentication/activate`, 'PUT', { id, currentv });
      const { statusCode, message, result } = response;
      console.log(response)
      if (statusCode === 200) {
        alert(message);
        setRefresh(true);
      }
    }
  }

  const editUser = async (id) => {
    const response = await customFetch(`logins/?id=${id}`);
    const { statusCode, message, result } = response;
    if (statusCode === 200) {
      // converting keys to lowercase
      const editData = result[0];
      const keys = Object.keys(editData);
      const lowerCaseKeys = keys.map(key => key.toLowerCase());
      const newObject = {};
      lowerCaseKeys.forEach((key, index) => {
        newObject[key] = editData[keys[index]];
        // if key = username, we want to change it to name
        if (key === 'username') {
          newObject['name'] = editData[keys[index]];
          delete newObject['username'];
          // add cpassword
        }
        newObject['cpassword'] = ''
      }
      );
      setEditing(true)
      setRegister(newObject);
      // we want scroll to the top of the page
      window.scrollTo(0, 0)
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
    }, 1000);
  }, [refresh]);

  return (
    <>
      <div className='container-fluid'>
        <div>
          <div className="card mt-2 p-0" style={{ borderRadius: "5px" }}>
            <div className="card-header bg-secondary text-white d-flex justify-content-between">
              <h6 className="text-capitalize mt-2">add new user</h6>
              <Add sx={{ cursor: 'pointer' }} />
              {editing == true ? <button className='btn btn-sm btn-danger' onClick={() => { setEditing(false); setRegister(defaultData) }}>cancel edit</button> : null
              }
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
                        <option value='clinician'>clinician</option>
                        <option value='phelobotomist'>phelobotomist</option>
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
      <UserList users={user} activateUser={activateUser} handleDelete={handleDelete} editUser={editUser} />
    </>
  );
}




