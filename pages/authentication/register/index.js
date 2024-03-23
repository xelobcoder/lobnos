import { useState, useEffect } from 'react'
import { Add } from '@mui/icons-material';
import { handleResponse, validateFormData, customFetch, getBranches } from '../../../components/Auth/customFetch';
import { useRouter } from 'next/router';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';
import Loader from '../../../components/accessories/Loader';

export default function Authentication_index_page() {
  const employeeid = useRouter().query.employeeid;
  const defaultData = { name: '', email: '', password: '', cpassword: '', role: '', branch: '' }
  const [register, setRegister] = useState(defaultData);
  const [isloading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRegister({ ...register, [name]: value });
  }

  const handleSubmit = async (e) => {
    const { name, email, password, cpassword, role } = register
    if (name && email && password && cpassword && role) {
      if (password !== cpassword) {
        alert('password does not match');
        return;
      } else {
        await validateFormData(employeeid ? { ...register, employeeid } : register
          , true, [], employeeid ? 'logins/update' : 'logins', handleResponse);
      }
    } else alert('Fill in all field')
  }



  useEffect(() => {
    if (employeeid) {
      customFetch(`logins/user?id=${employeeid}`)
        .then((data) => {
          const { statusCode, message, result } = data;
          if (statusCode == 200 && message == 'success' && result.length > 0) {
            const { role, username, email, employeeid } = result[0]
            setRegister({ name: username, email, role })
          }
        })
        .catch((err) => console.log(err))
    }
  }, [employeeid])


  useEffect(() => { getBranches(setBranches, false, false) }, [])



  const renderingView = () => {
    if (isloading) return <Loader />
    else {
      return (
        <section className='mx-2'>
          <form className='border border-1 border-secondary-subtle p-2 bg-white px-3' autoCapitalize="on" autoComplete="off" accessKey="E">
            <h5> {employeeid ? 'update user information' : 'New User Registration '} </h5>
            <hr />
                  <div className="row">
                    <div className="">
                <div className="form-row grid-reg mt-3">
                  <label className='mt-1 mb-1' style={{ fontSize: "14px" }} htmlFor="name">
                          username
                        </label>
                        <input
                          type="text"
                    className="custom-input"
                          required
                          id="name"
                          onChange={handleChange}
                          value={register.name}
                          name="name"
                          placeholder="name"
                        />
                      </div>
                    </div>
                    <div className="">
                <div className="form-row grid-reg mt-3">
                  <label className='mt-1 mb-1' style={{ fontSize: "14px" }} htmlFor="email">
                          email
                        </label>
                        <input
                          type="email"
                          name="email"
                          onChange={handleChange}
                          value={register.email}
                    className="custom-input"
                          required
                          id="email"
                          placeholder="email"
                        />
                      </div>
                    </div>
                    <div className="">
                <div className="form-row grid-reg mt-3">
                  <label className='mt-1 mb-1' style={{ fontSize: "14px" }} htmlFor="password">
                          password
                        </label>
                        <input
                          type="password"
                          onChange={handleChange}
                          value={register.password}
                          name="password"
                    className="custom-input"
                          required
                          id="password"
                          placeholder="password"
                        />
                      </div>
                    </div>
                    <div className="">
                <div className="form-row grid-reg mt-3">
                  <label className='mt-1 mb-1' style={{ fontSize: "14px" }} htmlFor="cpassword">
                          confirm password
                        </label>
                        <input
                          type="password"
                    className="custom-input"
                          required
                          id="cpassword"
                          onChange={handleChange}
                          value={register.cpassword}
                          name="cpassword"
                          placeholder="confirm password"
                        />
                      </div>
                    </div>
                    <div className="">
                <div className="form-row grid-reg mt-3 ">
                  <label className='mt-1 mb-1' style={{ fontSize: "14px" }} htmlFor="role">
                          role
                        </label>
                        <select
                    className="custom-select"
                          onChange={handleChange}
                          value={register.role}
                          name="role"
                          required
                          id="role"
                        >
                          <option value="">select role</option>
                          <option value="admin">admin</option>
                          <option value="customer service representative">
                            customer service representative
                          </option>
                          <option value="scientist">scientist</option>
                          <option value="manager">manager</option>
                          <option value="clinician">clinician</option>
                          <option value="phelobotomist">phelobotomist</option>
                          <option value="sonographer">sonographer</option>
                        </select>
                      </div>
              </div>
              <div>
                <div className='form-row grid-reg mt-3 '>
                  <label className='mb-2 mt-2'> assign to branch</label>
                  <select value={register.branch} name={'branch'} onChange={(ev) => { handleChange(ev) }} className='custom-select'>
                    <option>assign user to a branch here</option>
                    {branches.length > 0 &&
                      branches.map((item, index) => <option value={item.branchid} key={index}>{item.name}</option>)}
                  </select>
                </div>
              </div>
                    <div className=" mt-2 mt-4">
                      <div className="form-group">
                        <button
                          type="button"
                    className="btn btn-primary btn-sm"
                          onClick={handleSubmit}
                          style={{ borderRadius: "5px" }}
                        >
                          save information
                        </button>
                      </div>
                    </div>
                  </div>
          </form>
        </section>
      )
    }
  }


  return (
    <AuthenticationLayout>
      {renderingView()}
    </AuthenticationLayout>
  );
}




