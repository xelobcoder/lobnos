import React from 'react';
import { useState, useContext } from 'react';
import AuthContext from '../../components/Auth/useAuthentification';
import { customPost } from '../../components/Auth/customFetch';



export default function LoginCredentials() {
  const { setAuthentication } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ message: '', status: '' });


  const handleSubmit = async (e) => {
    e.preventDefault();
    // send the username and password to the server
    // if the server responds with a 200 status code
    try {
      const response = await customPost('authenticate','POST',{username,password})

      const { status, statusCode, message } = response;

      if (statusCode === 200) {
        setMessage({
          message: 'Login successful',
          status: 'success'
        });
        // decrpt information fsuing jwt
        // set information in local storage for the user
        localStorage.setItem('user', response?.user);
        setAuthentication(response?.user)
        console.log(response)
      }
      else {
        setMessage({
          message,
          status: 'error'
        })
      }

    }
    catch (error) {
      console.log(error)
    }

  }

  return (
    <>
      <div id='wrapper-login'>
        {/*create a login form with custom inline css styles  */}

        <form id='login-form'>
          <div>
            <div className={
              message.status === '' ? message.status : message.status === 'success' ? 'text-success' : 'text-danger'
            }>
              {message.message}
            </div>
            <label htmlFor="username">Username</label>

            <input type="text" name="username"
              onChange={(e) => { setUsername(e.target.value) }}
              value={username} required id="username" />

            <label htmlFor="password">Password</label>
            <input type="password" required
              onChange={(e) => { setPassword(e.target.value) }}
              name="password" value={password} id="password" />

            <button type="button"
              onClick={(e) => handleSubmit(e)}
            >
              Login
            </button>
          </div>
        </form>

      </div>
    </>
  )
}

