import { useState, } from 'react'
import { useRouter } from 'next/navigation'
import { customPost } from '../../components/Auth/customFetch'
import Cookies from 'js-cookie'

export default function LoginCredentials() {
  const navigate = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState({ message: '', status: '' })


  const handleSubmit = async (e) => {
    try {
      e.preventDefault()
      const navigator = window.navigator
      const browserInformation = {
        userAgent: navigator.userAgentData.brands[1].brand,
        platform: navigator.platform,
        device: navigator.userAgentData.mobile ? 'mobile' : 'computer',
        connectionType: navigator.connection.effectiveType,
        deviceMemory: navigator.deviceMemory,
      }

      const response = await customPost(`authenticate`, 'POST', {
        email,
        password,
        browserInformation,
      })
      const { status, token, message, statusCode } = response
      if (status == 'success') {
        Cookies.set('X-AUTH-PRIME-LAB-SYSTEM', token)
        window.location.href = '/'
        // if (window.history.length > 0 ) {
        //   window.history.back()
        // } else {
        //   window.location.href = '/'
        // }
      } else if (status == 'error') {
        setMessage(response?.message)
      } else if (status == 'multipleLogins') {
        console.log(response)
        navigate.push(`/authentication/multiplelogins?email=${email}`)
      } else {
        console.log(status)
      }
    } catch (err) {
      console.log(err)
    }
  }


  return (
    <>
      <div id='loginWrapper'>
        <div className="d-flex justify-content-center">
          <div className="card br-5 mt-5" style={{ width: '500px' }}>
            <div className="card-header">Please login here</div>
            <div className="card-body">
              <div
                className={
                  message.status === ''
                    ? message.status
                    : message.status === 'success'
                    ? 'text-success'
                    : 'text-danger'
                }
              >
                {message.message}
              </div>
              <form
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                autoSave="off"
              >
                <label htmlFor="email">Email</label>

                <input
                  type="email"
                  name="email"
                  onChange={(e) => {
                    setEmail(e.target.value)
                  }}
                  className="form-control"
                  value={email}
                  required
                  id="email"
                />

                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  required
                  onChange={(e) => {
                    setPassword(e.target.value)
                  }}
                  className="form-control"
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
  )
}


