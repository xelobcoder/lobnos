import React from 'react';
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../../components/Auth/useAuthentification';
import { validateFormData } from '../../components/Auth/customFetch';



export default function LoginCredentials() {
  const { updateAuthentication } = useContext(AuthContext);
  const navigate = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ message: '', status: '' });
  const handleSubmit = async (e) => {
    e.preventDefault();
    const responseHandler = function (data) {
      const { status, message, statusCode, user, token } = data;
      if (statusCode == 200 && status == 'success') {
        setMessage({ message, status })
        if (token) {
          cookieStore.set({
            name: 'X-AUTH-PRIME-LAB-SYSTEMS',
            value: token,
            path: '/',
            domain: process.env.DOMAIN,
            secure: true,
            sameSite: 'strict',
            expires: new Date(Date.now() + 60 * 60 * 1000),
          });
        }
        if (user.hasOwnProperty('permissions')) {
          let permissions = user.permissions;
          if (permissions && typeof permissions === 'object') {
            permissions = JSON.parse(user?.permissions);
          }
          const { username, role, email, employeeid } = user;
          updateAuthentication({ username, role, email, permissions,employeeid });
        }
        navigate.push('/')
      } else {
        setMessage({ message, status })
      }
    }
    await validateFormData({ email, password }, true, [], 'authenticate', responseHandler)
  }




  return (
    <>
      <div id='loginWrapper' >
        <div className='d-flex justify-content-center' >
          <div className="card br-5 mt-5" style={{ width: '500px' }}>
            <div className="card-header">Please login here</div>
            <div className="card-body">
              <div
                className={
                  message.status === ""
                    ? message.status
                    : message.status === "success"
                      ? "text-success"
                      : "text-danger"
                }
              >
                {message.message}
              </div>
              <label htmlFor="email">Email</label>

              <input
                type="email"
                name="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
                className='form-control'
                value={email}
                required
                id="email"
              />

              <label htmlFor="password">Password</label>
              <input
                type="password"
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                className='form-control'
                name="password"
                value={password}
                id="password"
              />
            </div>
            <div className="card-footer">
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => handleSubmit(e)}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

