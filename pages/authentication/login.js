import { useRef, useEffect } from 'react';
import { useState, useContext } from 'react';
import AuthContext from '../../components/Auth/useAuthentification';



export default function LoginCredentials() {
  const { updateAuthentication } = useContext(AuthContext);
  const loginRef = useRef();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ message: '', status: '' });


  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const authenticateUser = await fetch(`/api/login`, {
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      const response = await authenticateUser.json();
      const { status, data } = response;
      if (status == true) {
        updateAuthentication(data);
        if (data.hasOwnProperty('permissions')) {
          let permissions = data.permissions;
          if (permissions && typeof permissions === 'object') {
            permissions = JSON.parse(data?.permissions);
          }
          updateAuthentication({ ...data, permissions });
        if (window.history.length > 0) {
          window.history.back();
        } else {
          window.location.href = '/';
        }
        }
      } else {
        setMessage(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }


  useEffect(() => {
    if (loginRef.current) {
      const isUserLoggedIn = async function () {
        const verify = await fetch('/api/isauthenticated');
        const response = await verify.json();
        if (response.status == "loggedIn") window.location.href = '/';
      }
      isUserLoggedIn();
    }
  }, [])




  return (
    <>
      <div id='loginWrapper' ref={loginRef} >
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
              <form autoComplete='off' autoCapitalize='off' autoCorrect='off' autoSave='off' >
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
              </form>
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

