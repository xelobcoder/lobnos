import React from 'react';
import { useState, useContext } from 'react';
import { useRouter } from 'next/router';
import AuthContext from '../../components/Auth/useAuthentification';
import { customPost, validateFormData } from '../../components/Auth/customFetch';



export default function LoginCredentials() {
  const { updateAuthentication } = useContext(AuthContext);
  const navigate = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ message: '', status: '' });


  const handleSubmit = async (e) => {
    e.preventDefault();
    // send the email and password to the server
    // if the server responds with a 200 status code;
    const responseHandler = function (data) {
      const { status, message, statusCode, user ,token} = data;
      if (statusCode == 200 && status == 'success') {
        setMessage({ message, status });
        const transformed = JSON.stringify(user);
        // remove previous if exist 
        localStorage.removeItem('user');
        // add new info
        localStorage.setItem('user', transformed);
        updateAuthentication(transformed);
        navigate.back()
      } else {
        setMessage({ message, status })
      }
    }
    await validateFormData({ email, password }, true, [], 'authenticate', responseHandler)
  }



  return (
    <>
      <div className='d-flex justify-content-center mt-5'>
        <div className="card br-5" style={{ width: '500px', marginTop: '50px' }}>
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
              className="btn btn-danger"
              onClick={(e) => handleSubmit(e)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

