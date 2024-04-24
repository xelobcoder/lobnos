import { useRef, useEffect } from 'react';
import { useState, useContext } from 'react';
import AuthContext from '../../components/Auth/useAuthentification';
import MultipleUserLogin from '../../components/Auth/multipleLogins/multipleLogins';
import { useRouter } from 'next/navigation';



export default function LoginCredentials() {
  const { updateAuthentication } = useContext(AuthContext);
  const loginRef = useRef();
  const navigate = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ message: '', status: '' });
  const [multiple, setMultiple] = useState(false);


  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const navigator = window.navigator;
      const browserInformation = {
        userAgent: navigator.userAgentData.brands[1].brand,
        platform: navigator.platform,
        device: navigator.userAgentData.mobile ? 'mobile' : 'computer',
        connectionType: navigator.connection.effectiveType,
        deviceMemory: navigator.deviceMemory
      };

      const authenticateUser = await fetch(`/api/login`, {
        headers: {
          'content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ email, password, browserInformation })
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
      } else if (status == "error") {
        setMessage(response?.message);
      } else if (status == "multipleLogins") {
        navigate.push(`/authentication/multiplelogins?email=${email}`)
      } else {
        console.log(status)
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


  const gotToPrevious = (ev) => {
    setMultiple(false);
  }

  return (
    <>
      <div id='loginWrapper' ref={loginRef} >
        {multiple &&
          <MultipleUserLogin email={email} gotToPrevious={gotToPrevious} />
        }
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

