import React, { useState, useEffect } from 'react'
import { Add } from '@mui/icons-material';
import { handleResponse, validateFormData, customFetch } from '../../../components/Auth/customFetch';
import { useRouter } from 'next/router';
import SettingsLayout from '../../../components/settingsComponents/SettingsLayout';
import AuthenticationSidebar from '../../../components/settingsComponents/AuthenticationSidebar';

export default function Authentication_index_page() {
  const employeeid = useRouter().query.employeeid;
  const defaultData = { name: '', email: '', password: '', cpassword: '', role: '' }
  const [register, setRegister] = useState(defaultData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister({ ...register, [name]: value });
  }

  const handleSubmit = async (e) => {
    const { name, email, password, cpassword, role } = register
    if (name && email && password && cpassword && role) {
      if (password !== cpassword) {
        alert('password does not match');
        return;
      } else {
        await validateFormData(employeeid ? { ...register, employeeid } : register
          , true, [], employeeid ? 'logins/update' : 'logins', handleResponse);
      }
    } else alert('Fill in all field')
  }



  useEffect(() => {
    if (employeeid) {
      customFetch(`logins/user?id=${employeeid}`)
        .then((data) => {
          const { statusCode, message, result } = data;
          if (statusCode == 200 && message == 'success' && result.length > 0) {
            const { role, username, email, employeeid } = result[0]
            setRegister({ name: username, email, role })
          }
        })
        .catch((err) => console.log(err))
    }
  }, [employeeid])


  return (
    <>
      <SettingsLayout sidebar={<AuthenticationSidebar />}>
        <div className="container-fluid">
          <div>
            <div className="card mt-2 p-0" style={{ borderRadius: "5px" }}>
              <div className="card-header bg-secondary text-white d-flex justify-content-between">
                <h6 className="text-capitalize mt-2">
                  {employeeid ? 'update user information' : 'add new user'}
                </h6>
                <Add sx={{ cursor: "pointer" }} />
              </div>
              <div className="card-body p-2">
                <form autoCapitalize="on" autoComplete="off" accessKey="E">
                  <div className="row">
                    <div className="">
                      <div className="form-group">
                        <label style={{ fontSize: "14px" }} htmlFor="name">
                          username
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          id="name"
                          onChange={handleChange}
                          value={register.name}
                          name="name"
                          placeholder="name"
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="form-group">
                        <label style={{ fontSize: "14px" }} htmlFor="email">
                          email
                        </label>
                        <input
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={register.email}
                          className="form-control"
                          required
                          id="email"
                          placeholder="email"
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="form-group">
                        <label style={{ fontSize: "14px" }} htmlFor="password">
                          password
                        </label>
                        <input
                          type="password"
                          onChange={handleChange}
                          value={register.password}
                          name="password"
                          className="form-control"
                          required
                          id="password"
                          placeholder="password"
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="form-group">
                        <label style={{ fontSize: "14px" }} htmlFor="cpassword">
                          confirm password
                        </label>
                        <input
                          type="password"
                          className="form-control"
                          required
                          id="cpassword"
                          onChange={handleChange}
                          value={register.cpassword}
                          name="cpassword"
                          placeholder="confirm password"
                        />
                      </div>
                    </div>
                    <div className="">
                      <div className="form-group">
                        <label style={{ fontSize: "14px" }} htmlFor="role">
                          role
                        </label>
                        <select
                          className="form-control"
                          onChange={handleChange}
                          value={register.role}
                          name="role"
                          required
                          id="role"
                        >
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
                    </div>
                    <div className=" mt-2 mt-4">
                      <div className="form-group">
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={handleSubmit}
                          style={{ borderRadius: "5px" }}
                        >
                          save information
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </SettingsLayout>
    </>
  );
}




