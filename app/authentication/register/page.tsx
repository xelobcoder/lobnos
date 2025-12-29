"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { handleResponse, validateFormData, customFetch, getBranches } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useApplication } from '../../../components/Auth/useApplicationContext';

const schema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Invalid email address'),
	mobile: z.string().regex(/^\d{10}$/, 'Mobile number must be 10 digits'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	cpassword: z.string(),
	role: z.string().min(1, 'Role is required'),
	pin: z.string().regex(/^\d{4}$/, 'PIN must be 4 digits'),
}).refine(data => data.password === data.cpassword, {
	message: 'Passwords do not match',
	path: ['cpassword'],
});

interface RegisterData {
	name: string;
	email: string;
	password: string;
	cpassword: string;
	role: string;
	branch: string;
	mobile: string;
	altMobile: string;
	address: string;
	dob: string;
	startDate: string;
	accessLevel: string;
	department: string;
	employeeId: string;
	pin: string;
}

const defaultData: RegisterData = {
	name: '', email: '', password: '', cpassword: '',
	role: '', branch: '', mobile: '', altMobile: '',
	address: '', dob: '', startDate: '', accessLevel: '',
	department: '', employeeId: '', pin: ''
};

interface Branch {
	branchid: string;
	name: string;
}

export default function AuthenticationIndexPage() {
	const searchParams = useSearchParams();
	const employeeid = searchParams ? searchParams.get('employeeid') : null;
	const [register, setRegister] = useState<RegisterData>(defaultData);
	const [isLoading, setLoading] = useState<boolean>(false);
	const [branches, setBranches] = useState<Branch[]>([]);
	const currentUserEmployeeid = useApplication()?.user?.employeeid;

	const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setRegister(prev => ({ ...prev, [name]: value }));
	};

	const validateForm = (): boolean => {
		try {
			schema.parse(register);
			return true;
		} catch (error) {
			if (error instanceof z.ZodError) {
				toast.error(error.errors[0].message);
			}
			return false;
		}
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (validateForm()) {
			setLoading(true);
			try {
				const data = {
					name: register.name,
					email: register.email,
					mobile: register.mobile,
					password: register.password,
					cpassword: register.cpassword,
					role: register.role,
					branch: register.branch,
					pin: register.pin,
					altMobile: register.altMobile,
					dob: register.dob,
					startDate: register.startDate,
					accessLevel: register.accessLevel,
					department: register.department,
					employeeId: register.employeeId,
					address: register.address,
					employeeid: employeeid || undefined
				};

				validateFormData(
					data,
					false,
					["name", "email", "password", "cpassword", "role", "mobile", "pin"],
					employeeid ? 'logins/update?employeeid=' + currentUserEmployeeid : 'logins',
					(response) => {
						handleResponse(response, toast);
						if (response.status === "success" && !employeeid) {
							setRegister(defaultData);
						}
					},
					false
				);

			} catch (error) {
				console.error('Error submitting form', error);
				toast.error('Failed to submit form. Please try again.');
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		if (employeeid) {
			setLoading(true);
			customFetch(`logins/user?id=${employeeid}`)
				.then((data: { statusCode: number; message: string; result: Array<any> }) => {
					const { statusCode, message, result } = data;
					if (statusCode === 200 && message === 'success' && result.length > 0) {
						const user = result[0];
						setRegister(prev => ({
							...prev,
							name: user.username || '',
							email: user.email || '',
							role: user.role || '',
							branch: user.branch ? String(user.branch) : '',
							mobile: user.mobile || '',
							altMobile: user.alternativeMobile || '',
							dob: user.dob ? user.dob.substring(0, 10) : '',
							startDate: user.date_created ? user.date_created.substring(0, 10) : '',
							pin: user.pin ? String(user.pin) : '',
						}));
					}
					setLoading(false);
				})
				.catch(() => setLoading(false));
		}
	}, [employeeid]);

	useEffect(() => { getBranches(setBranches, undefined, undefined) }, []);

	if (isLoading) return <Loader w={100} h={100} />;

	return (
		<div className="min-vh-100 bg-light">
			<div >
				<div >
					<div >
						<div className="card  border-0">
							<div className="card-header bg-white border-bottom py-4">
								<h4 className="mb-0 text-dark fw-semibold">
									{employeeid ? 'Update Employee Information' : 'New Employee Registration'}
								</h4>
								<p className="text-muted mb-0 mt-2">
									{employeeid ? 'Modify employee details below' : 'Fill in the details to register a new employee'}
								</p>
							</div>
							<div className="card-body p-4">
								<form onSubmit={handleSubmit} className="needs-validation" noValidate>
									<div className="row g-3">
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="name">
												Username <span className="text-danger">*</span>
											</label>
											<input
												type="text"
												name="name"
												id="name"
												value={register.name}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="Enter username"
												required

											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="email">
												Email Address <span className="text-danger">*</span>
											</label>
											<input
												type="email"
												name="email"
												id="email"
												value={register.email}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="Enter email address"
												required
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="mobile">
												Mobile Number <span className="text-danger">*</span>
											</label>
											<input
												type="tel"
												name="mobile"
												id="mobile"
												value={register.mobile}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="10-digit mobile number"
												required
												minLength={10}
												maxLength={10}
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="altMobile">
												Alternative Contact
											</label>
											<input
												type="tel"
												name="altMobile"
												id="altMobile"
												value={register.altMobile}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="Alternative contact number"
												minLength={10}
												maxLength={10}
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="dob">
												Date of Birth <span className="text-danger">*</span>
											</label>
											<input
												type="date"
												name="dob"
												id="dob"
												value={register.dob}
												onChange={handleChange}
												className="form-control border-1 py-2"
												required
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="role">
												Role <span className="text-danger">*</span>
											</label>
											<select
												className="form-select border-1 py-2"
												onChange={handleChange}
												value={register.role}
												name="role"
												id="role"
												required
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
										<div className="col-12">
											<label className="form-label text-dark fw-medium">Assign to Branch</label>
											<select
												value={register.branch}
												name="branch"
												onChange={handleChange}
												className="form-select border-1 py-2"
											>
												<option value="">Select branch assignment</option>
												{branches.length > 0 &&
													branches.map((item, index) => (
														<option value={item.branchid} key={index}>
															{item.name}
														</option>
													))}
											</select>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="password">
												Password <span className="text-danger">*</span>
											</label>
											<input
												type="password"
												name="password"
												id="password"
												value={register.password}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="Minimum 6 characters"
												required
												minLength={6}
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="cpassword">
												Confirm Password <span className="text-danger">*</span>
											</label>
											<input
												type="password"
												name="cpassword"
												id="cpassword"
												value={register.cpassword}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="Re-enter password"
												required
												minLength={6}
												autoComplete="off"
											/>
										</div>
										<div className="col-md-6">
											<label className="form-label text-dark fw-medium" htmlFor="pin">
												PIN Code <span className="text-danger">*</span>
											</label>
											<input
												type="password"
												name="pin"
												id="pin"
												value={register.pin}
												onChange={handleChange}
												className="form-control border-1 py-2"
												placeholder="4-digit PIN"
												required
												minLength={4}
												maxLength={4}
												autoComplete="off"
											/>
										</div>
									</div>
									<div className="d-flex justify-content-end mt-4 pt-3 border-top">
										<button
											type="submit"
											className="btn btn-primary btn-sm px-4 py-2"
											disabled={isLoading}
										>
											{isLoading ? (
												<>
													<span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
													Saving...
												</>
											) : (
												'Save Information'
											)}
										</button>
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}