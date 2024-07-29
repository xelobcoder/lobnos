import { Col, Container, Row } from "react-bootstrap";
import Loader from "../../components/accessories/Loader";
import Link from "next/link";

export default async function AppointmentAppRouter() {
     const response = await fetch('http://localhost:5000/api/v1/operation/pendingcases/all?status=pending&&count=10&&page=1&&employeeid=3');
     const data = await response.json();
     const result  = data?.result;
     if (!result) return <Loader />

     return (
          <Container>
               <Row>
                    <Col className="p-2">
                         <h5>Pending laboratory test</h5>
                         <hr />
                         <table className="table ttable table-responsive table-borderless table-striped text-sm">
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
                                   {result.map((item,index) => (
                                        <tr key={index} className="table-danger">
                                             <td className="text-sm">{item.fullname}</td>
                                             <td className="text-sm">{item.age}</td>
                                             <td className="text-sm">{new Date(item.billing_date).toLocaleDateString()}</td>
                                             <td className="text-sm">{item.department}</td>
                                             <td className="text-sm">{item.name}</td>
                                             <td className="text-sm">{item.organization}</td>
                                             <td className="text-sm">{item.clinicianName}</td>
                                             <td className="text-sm">
                                                  <Link href={'http://localhost:3000/operations/laboratory/patientarchives/transactions?ptid=dn0vvARuUrABAIYL85sBS9uxyqqQzSCBvpblrhVHtKIQbXZHwO202471132&&csvid=TzsRAEBEx2TKss2CDonbO5B1uOPYu2IUQgmyw2vdoS5RnKzP1CSQV5l2ccpKhB8obe9lVO346098'}>
                                                       <button className=" btn btn-primary ">enter result</button>
                                                  </Link>
                                             </td>
                                        </tr>
                                   ))}
                              </tbody>
                         </table>
                    </Col>
               </Row>
          </Container>
     );
}

