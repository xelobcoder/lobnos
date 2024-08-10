import { Col, Container, Row } from "react-bootstrap";
import Loader from "../../components/accessories/Loader";
import Link from "next/link";
import { MarkChatRead } from "@mui/icons-material";
import { customFetch } from "../../components/Auth/customFetch";

export default async function AppointmentAppRouter() {
     const response = await customFetch('operation/pendingcases/all?status=pending&&count=10&&page=1&&employeeid=3');
     const result = response?.result;
     if (result) {
          result[4]['ready'] = 'true'
          result[2]['ready'] = 'true'
          result[8]['ready'] = 'true'
     }
     console.log(result)
     if (!result) return <Loader />

     return (
          <Col className="m-2" >
               <h5>Pending laboratory test</h5>
               <hr />
               <table className="table table-responsive table-borderless table-striped text-sm">
                    <thead className="table-light text-sm">
                         <tr>
                              <th>Full Name</th>
                              <th>Age</th>
                              <th>Date</th>
                              <th>Department</th>
                              <th>Name</th>
                              <th>Organization</th>
                              <th>Clinician Name</th>
                              <th>action</th>
                         </tr>
                    </thead>
                    <tbody>
                         {result.map((item, index) => (
                              <tr key={index} className={item.ready === 'true' ? "table-success" : "table-danger"} >
                                   <td className="text-sm">{item.fullname}</td>
                                   <td className="text-sm">{item.age}</td>
                                   <td className="text-sm">{new Date(item.billing_date).toLocaleDateString()}</td>
                                   <td className="text-sm">{item.department}</td>
                                   <td className="text-sm">{item.name}</td>
                                   <td className="text-sm">{item.organization}</td>
                                   <td className="text-sm">{item.clinicianName}</td>
                                   <td className="text-sm">
                                        <Link href={'/operations/laboratory/patientarchives/transactions?ptid=dn0vvARuUrABAIYL85sBS9uxyqqQzSCBvpblrhVHtKIQbXZHwO202471132&&csvid=TzsRAEBEx2TKss2CDonbO5B1uOPYu2IUQgmyw2vdoS5RnKzP1CSQV5l2ccpKhB8obe9lVO346098'}>
                                             <button className=" btn btn-primary ">
                                                  <MarkChatRead />
                                                  enter result</button>
                                        </Link>
                                   </td>
                              </tr>
                         ))}
                    </tbody>
               </table>
          </Col>
     );
}

