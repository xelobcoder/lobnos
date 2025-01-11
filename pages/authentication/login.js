import { useState, } from 'react'
import { useRouter } from 'next/navigation'
import { customPost } from '../../components/Auth/customFetch'
import Cookies from 'js-cookie'
import { Error } from '@mui/icons-material'

export default function LoginCredentials() {
	const navigate = useRouter()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState({ message: 'please login with valid credentials', status: 'success' })


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

			const response = await customPost(`authenticate`, 'POST', { email, password, browserInformation })
			const { status, token, message, statusCode, sessionExpiryTime } = response
			if (status == 'success') {
				Cookies.set('X-AUTH-PRIME-LAB-SYSTEM', token, { expires: new Date(sessionExpiryTime) })
				// window.location.href = '/'
				// if (window.history.length > 0 ) {
				//   window.history.back()
				// } else {
				//   window.location.href = '/'
				// }
			} else if (status == 'error') {
				setMessage({ status: 'error', message: response?.message })
			} else if (status == 'multipleLogins') {
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
			<div id="login" className='min-vh-100'>
				<div id='top-nav' className='p-3'>
					<h5 className='text-white'>Prime Laboratory system(PLS)</h5>
				</div>
				<div className='row mx-3 d-flex justify-content-center ui'>
					<div>
						<button className='btn m-2 btn-secondary text-capitalize'>patient</button>
						<button className='btn m-2 btn-secondary text-capitalize'>doctor</button>
						<button className='btn m-2 btn-secondary text-capitalize'>staff</button>
					</div>
					<div className='col-xl-4 my-5 bg-white br-5 card p-0' >
						<div className={`${message.status == 'error' ? 'bg-danger' : 'bg-success'} text-white card-header text-dark'`} >
							<div className='m-2  text-capitalize'>
								<Error /> {message.message}
							</div>
						</div>
						<div className='card-body'>
							<h5 className='fw-bold my-2' >Email</h5>
							<input type="email" name="email" onChange={(e) => { setEmail(e.target.value) }}
								className="custom-input"
								value={email}
								required
								id="email"
							/>
							<h5 className='fw-bold my-2'>Password</h5>
							<input type="password" required onChange={(e) => { setPassword(e.target.value) }}
								className="custom-input"
								name="password"
								value={password}
								id="password"
							/>
							<button
								type="button"
								className="btn btn-success p-2 my-2"
								onClick={(e) => handleSubmit(e)}
							>
								submit credentials
							</button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}


