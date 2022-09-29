import Header from "../../components/header";
import React from 'react';
import { useRouter } from 'next/router';

function AccessAuthPhelo() {
 const navigate = useRouter();
 const [data, setData] = React.useState({
  name: "",
  password: "",
 })

 const [loading, setLoading] = React.useState(true)

 const handleChange = (e) => {
  if (data.name && data.password) {
   if (data.name == 'Tiifu' && data.password == 'hamza') {
    setLoading(false)
    navigate.push('/phelobotomy/dashboard')
   }
  }
  else {
   return;
  }
 }

 return (
  <>
   <div className='--login-prism'>
    <div className="error"></div>
    <div className="--login-prism-group">
     <input tabIndex='1' onChange={(e) => setData({ ...data, name: e.target.value })} type='text' required placeholder="username" id="username"  ></input>
     <input tabIndex='2' onChange={(e) => setData({ ...data, password: e.target.value })} type='password' required placeholder="password" id='password' ></input>
     <button onClick={(e) => handleChange(e)} type='button' tabIndex='3' className="">Login</button>
    </div>
   </div>
  </>
 )
}

export default AccessAuthPhelo;





AccessAuthPhelo.getLayout = function (page) {
 return (
  <>
   <Header />
   {page}
  </>
 )
}