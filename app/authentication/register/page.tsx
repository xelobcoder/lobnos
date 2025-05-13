"use client";
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { handleResponse, validateFormData, customFetch, getBranches } from '../../../components/Auth/customFetch';
import Loader from '../../../components/accessories/Loader';
import { useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { z } from 'zod';

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
    
                await validateFormData(
                    data,
                    false,
                    ["name", "email", "password", "cpassword", "role", "mobile", "pin"],
                    employeeid ? 'logins/update' : 'logins',
                    handleResponse,
                    false
                );
    
                toast.success(employeeid ? 'Employee updated successfully!' : 'Employee registered successfully!');
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
                .then((data: { statusCode: number; message: string; result: Array<{ role: string; username: string; email: string; }> }) => {
                    const { statusCode, message, result } = data;
                    if (statusCode === 200 && message === 'success' && result.length > 0) {
                        const { role, username, email } = result[0];
                        setRegister(prev => ({ ...prev, name: username, email, role }));
                    }
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [employeeid]);

    useEffect(() => { getBranches(setBranches, undefined, undefined) }, []);

    if (isLoading) return <Loader w={100} h={100} />;

    return (
        <div>
            <section className="mx-2">
                <form
                    className=""
                    autoCapitalize="on"
                    autoComplete="off"
                    accessKey="E"
                    onSubmit={handleSubmit}
                >
                    <h5 className="text-capitalize">{employeeid ? 'Update Employee Information' : 'New Employee Registration'}</h5>
                    <hr />
                    <div className="row">
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="name">Username</label>
                            <input
                                type="text"
                                name="name"
                                value={register.name}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Name"
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="email">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={register.email}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Email"
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="mobile">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobile"
                                value={register.mobile}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Mobile Number"
                                required
                                minLength={10}
                                maxLength={10}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="altMobile">Alternative Contact Number</label>
                            <input
                                type="tel"
                                name="altMobile"
                                value={register.altMobile}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Alternative Contact Number"
                                minLength={10}
                                maxLength={10}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="dob">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                value={register.dob}
                                onChange={handleChange}
                                className="custom-input"
                                required
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="password">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={register.password}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Password"
                                required
                                minLength={6}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="cpassword">Confirm Password</label>
                            <input
                                type="password"
                                name="cpassword"
                                value={register.cpassword}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Confirm Password"
                                required
                                minLength={6}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="role">Role</label>
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
                            <label className="pls-label mb-2 mt-2">Assign to Branch</label>
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
                        <div className="form-row grid-reg mt-3">
                            <label className="pls-label mt-1 mb-1" htmlFor="pin">PIN Code</label>
                            <input
                                type="password"
                                name="pin"
                                value={register.pin}
                                onChange={handleChange}
                                className="custom-input"
                                placeholder="Enter 4-digit PIN"
                                required
                                minLength={4}
                                maxLength={4}
                                autoComplete="off"
                            />
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
        </div>
    );
}