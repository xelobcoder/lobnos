import { useState, useEffect } from 'react';
import { handleResponse, validateFormData, customFetch, getBranches } from '../../../components/Auth/customFetch';
import { useRouter } from 'next/router';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';
import Loader from '../../../components/accessories/Loader';

export default function AuthenticationIndexPage() {
	const router = useRouter();
	const employeeid = router.query.employeeid;

	const defaultData = {
		name: '', email: '', password: '', cpassword: '',
		role: '', branch: '', mobile: '', altMobile: '',
		address: '', dob: '', startDate: '', accessLevel: '',
		department: '', employeeId: ''
	};

	const [register, setRegister] = useState(defaultData);
	const [isLoading, setLoading] = useState(false);
	const [branches, setBranches] = useState([]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setRegister({ ...register, [name]: value });
	};

	const validateForm = () => {
		const { name, email, password, cpassword, role, mobile } = register;
		if (!name || !email || !password || !cpassword || !role || !mobile) {
			alert('Please fill in all required fields');
			return false;
		}
		if (password !== cpassword) {
			alert('Passwords do not match');
			return false;
		}
		return true;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (validateForm()) {
			setLoading(true);
			try {
				await validateFormData(
					employeeid ? { ...register, employeeid } : register,false,
					 ["name","email","password","cpassword","role","mobile"], employeeid ? 'logins/update' : 'logins',
					handleResponse
				);
			} catch (error) {
				console.error('Error submitting form', error);
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		if (employeeid) {
			setLoading(true);
			customFetch(`logins/user?id=${employeeid}`)
				.then((data) => {
					const { statusCode, message, result } = data;
					if (statusCode === 200 && message === 'success' && result.length > 0) {
						const { role, username, email } = result[0];
						setRegister({ name: username, email, role });
					}
					setLoading(false);
				})
				.catch(() => setLoading(false));
		}
	}, [employeeid]);

	useEffect(() => { getBranches(setBranches, false, false) }, []);

	const renderingView = () => {
		if (isLoading) return <Loader />;
		else {
			return (
				<section className="mx-2">
					<form
						className="border border-1 border-secondary-subtle p-2 bg-white px-3"
						autoCapitalize="on"
						autoComplete="off"
						accessKey="E"
						onSubmit={handleSubmit}
					>
						<h5 className="text-capitalize">{employeeid ? 'Update Employee Information' : 'New Employee Registration'}</h5>
						<hr />
						<div className="row">
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="name">Username</label>
								<input
									type="text"
									className="custom-input"
									required
									id="name"
									onChange={handleChange}
									value={register.name}
									name="name"
									placeholder="Name"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="email">Email</label>
								<input
									type="email"
									name="email"
									onChange={handleChange}
									value={register.email}
									className="custom-input"
									required
									id="email"
									placeholder="Email"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="mobile">Mobile Number</label>
								<input
									type="tel"
									maxLength={10}
									minLength={10}
									name="mobile"
									onChange={handleChange}
									value={register.mobile}
									className="custom-input"
									required
									id="mobile"
									placeholder="Mobile Number"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="altMobile">Alternative Contact Number</label>
								<input
									type="tel"
									maxLength={10}
									minLength={10}
									name="altMobile"
									onChange={handleChange}
									value={register.altMobile}
									className="custom-input"
									id="altMobile"
									placeholder="Alternative Contact Number"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="dob">Date of Birth</label>
								<input
									type="date"
									name="dob"
									onChange={handleChange}
									value={register.dob}
									className="custom-input"
									required
									id="dob"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="password">Password</label>
								<input
									type="password"
									onChange={handleChange}
									value={register.password}
									name="password"
									className="custom-input"
									required
									id="password"
									placeholder="Password"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="cpassword">Confirm Password</label>
								<input
									type="password"
									className="custom-input"
									required
									id="cpassword"
									onChange={handleChange}
									value={register.cpassword}
									name="cpassword"
									placeholder="Confirm Password"
								/>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mt-1 mb-1" htmlFor="role">Role</label>
								<select
									className="custom-select"
									onChange={handleChange}
									value={register.role}
									name="role"
									required
									id="role"
								>
									<option value="">Select Role</option>
									<option value="admin">Admin</option>
									<option value="scientist">Scientist</option>
									<option value="customer service representative">Customer Service Representative</option>
									<option value="manager">Manager</option>
									<option value="clinician">Clinician</option>
									<option value="phlebotomist">Phlebotomist</option>
									<option value="sonographer">Sonographer</option>
								</select>
							</div>
							<div className="form-row grid-reg mt-3">
								<label className="mb-2 mt-2">Assign to Branch</label>
								<select
									value={register.branch}
									name="branch"
									onChange={handleChange}
									className="custom-select"
								>
									<option value="">Assign user to a branch here</option>
									{branches.length > 0 &&
										branches.map((item, index) => (
											<option value={item.branchid} key={index}>
												{item.name}
											</option>
										))}
								</select>
							</div>
							<div className="form-group mt-4">
								<button
									type="submit"
									className="btn btn-primary btn-sm"
									style={{ borderRadius: "5px" }}
								>
									Save Information
								</button>
							</div>
						</div>
					</form>
				</section>
			);
		}
	};

	return (
		<AuthenticationLayout>
			{renderingView()}
		</AuthenticationLayout>
	);
}
