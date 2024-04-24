import { useEffect, useState } from "react"
import { customFetch } from "../customFetch";
import Loader from '../../../components/accessories/Loader';

export default function MultipleUserLogin({ email, gotToPrevious }) {
     const [isloading, setLoading] = useState(true);
     const [data, setData] = useState([]);

     const handleDecision = async (value) => {
          if (value == 2) {
               const response = await customFetch(`security/getloggedsessions/update?keyupdate=${parseInt(value)}&&email=${email}`);
               if (response?.status == true) {
                    window.location.href = '/authentication/login';
               }
          }
     };

     useEffect(() => {
          if (email) {
               setLoading(true)
               customFetch(`security/getloggedsessions?email=${email}`)
                    .then((response) => {
                         setData(response);
                    })
                    .catch((err) => {
                         setData([])
                    })
                    .finally(() => {
                         setLoading(false);
                    })
          }
     }, [email]);



     const renderingView = () => {
          if (isloading) return <Loader />
          else {
               return (
                    <div className="list-group bg-white br-5 mt-2">
                         {data.length > 0 && data.map((item, index) => {
                              return (
                                   <li key={index} className="list-group-item ">
                                        <h5 className="mx-3 text-capitalize">{item.browserInformation.device}</h5>
                                        <span>{item.browserInformation.userAgent}</span>
                                        <span className="mx-3">{item.browserInformation.platform}</span>
                                        <span>last login : {new Date(item.loginTime).toLocaleDateString()}{new Date(item.loginTime).toLocaleTimeString()}</span>
                                   </li>
                              )
                         })}
                         <div className='mt-3 d-flex justify-content-end mb-2'>
                              <button type="button" onClick={(ev) => { gotToPrevious() }} className='btn btn-secondary'>continue with previous session</button>
                              <button onClick={(ev) => { handleDecision(2) }} className='btn btn-primary mx-2'>login and close previous session</button>
                         </div>
                    </div>
               )
          }
     }



     return (
          <section>
               <div className='bg-white p-3 br-5 ' >
                    You are already logged in on another computer
                    You are seeing this message because, your account seems to be logged in on another
                    computer, details below. kindly choose how you would like to proceed.
               </div>
               {renderingView()}
          </section>
     )
}