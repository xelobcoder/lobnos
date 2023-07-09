import React, { useEffect, useState } from 'react'
import { Accordion, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { customFetch } from '../../../components/Auth/customFetch';
import { customerRepresentative, scientistPermission, pageAccess } from '../../../components/Auth/Roles/permissions';
export default function PermissionsOfUsers() {
  const permissions = useRouter().query.permissions;
  // state for customer permission
  const [customer, setCustomer] = useState(customerRepresentative)
  // state for scientist permission
  const [scientist, setScientist] = useState(scientistPermission);
  // user permision
  const [user, setUser] = useState(null);
  // get user permission data
  const getUserPermissions = async function () {
    const response = await customFetch(`user/permissions?permissions=${permissions}`);
    if (response['role'] = 'customer service representative') {
      setCustomer({ ...response,pageAccess});
      // set name of person who permission is being set to permission
      setUser(response?.name)
    }

    if (response['role'] = 'scientist') {
      setScientist({ ...response,pageAccess });
      // set name of person who permission is being set to permission
      setUser(response?.name)
    }
  }


  useEffect(() => {
    if (permissions != null) {
      try {
        getUserPermissions();
      } catch (err) {
        console.log(err)
      }
    }
  }, [permissions])


  // handle checkbox Chnages 

  const handleChange = (ev, target, setTarget) => {
    const { name, checked } = ev.target;
    setTarget({ ...target, [name]: checked });
  }

  const handlePageAccess = (ev, target, setTarget) => {
    const { name, checked } = ev.target;
    setTarget({
      ...target, pageAccess: {
        ...target.pageAccess,
        [name]: checked
      }
    });
  }

  return (
    <>
      <div className="card m-2" style={{ borderRadius: "10px" }}>
        <div className="card-header p-3 bg-secondary text-white">
          <h6 className="text-capitalize">permissions of {user}</h6>
        </div>
        <div className="card-body">
          <div className="row p-4">
            <h4>Permissions</h4>
            <div
              className="alert alert-info m-1 col-11"
              style={{ fontSize: "14px" }}
            >
              Default permissions are <strong>based on the role</strong>,
              however changes can be made to suit administration purposes
            </div>
          </div>
          <div className="row p-3">
            <div className="col-12">
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>
                    Permissions [sales service representative]
                  </Accordion.Header>
                  <Accordion.Body>
                    <div className="row">
                      <div className="col-12">
                        <input
                          type="checkbox"
                          name="registerv"
                          className="form-check-input"
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          value={customer.registerv}
                          checked={customer.registerv}
                        />{" "}
                        Register client
                      </div>
                      <div className="col-12">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          value={customer.viewv}
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          name="viewv"
                          checked={customer.viewv}
                        />{" "}
                        View client
                      </div>
                      <div className="col-12">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          value={customer.editv}
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          name="editv"
                          checked={customer.editv}
                        />{" "}
                        Edit client
                      </div>
                      <div className="col-12">
                        <input
                          type="checkbox"
                          value={customer.deletev}
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          name="deletev"
                          checked={customer.deletev}
                          className="form-check-input"
                        />{" "}
                        Delete client
                      </div>
                      <div className="col-12">
                        <input
                          type="checkbox"
                          value={customer.printv}
                          name="printv"
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          checked={customer.printv}
                          className="form-check-input"
                        />{" "}
                        Print result
                      </div>
                      <div className="col-12">
                        <input
                          type="checkbox"
                          value={customer.activatev}
                          onChange={(ev) => handleChange(ev, customer, setCustomer)}
                          name="activatev"
                          checked={customer.activatev}
                          className="form-check-input"
                        />{" "}
                        activate client
                      </div>
                      <div className='row'>
                        <h5 className='mt-3 text-lead text-danger'>Page Access</h5>
                        {Object.entries(pageAccess).map((item, index) => {
                          const [keys, value] = item;
                          return (
                            <div className='col-12' key={index}>
                              <input
                                type="checkbox"
                                value={customer.pageAccess.keys}
                                onChange={(ev) => handlePageAccess(ev, customer, setCustomer)}
                                id={keys}
                                name={keys}
                                checked={customer.pageAccess.keys}
                                className="form-check-input"
                              />
                              {" "}
                              <label htmlFor={pageAccess.keys}>
                                {keys}
                              </label>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div className='row'>
                      <div className='col-md-12'>
                        <button className='btn btn-outline-success mt-2'>
                          update permissions
                        </button>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Permissions [scientist]</Accordion.Header>
                  <Accordion.Body>
                    <div className="row">
                      <div className="col-12">
                        <input type="checkbox"
                           name ='viewv'
                            onChange={(ev) => handleChange(ev, scientist, setScientist)}
                            checked={scientist.viewv}
                          className="form-check-input" />
                        View client
                      </div>
                      <div className="col-12">
                        <input type="checkbox" 
                        name ='editv'
                        onChange={(ev) => handleChange(ev, scientist, setScientist)}
                        checked={scientist.editv}
                        className="form-check-input" />
                        Edit client
                      </div>
                      <div className="col-12">
                        <input type="checkbox" 
                        name ='deletev'
                        onChange={(ev) => handleChange(ev, scientist, setScientist)}
                        checked={scientist.deletev}
                        className="form-check-input" />
                        Delete client
                      </div>
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        register client
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        enter results
                      </div>
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        view results
                      </div>
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        edit results
                      </div>
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        delete results
                      </div>
                      <div className="col-12">
                        <input type="checkbox" className="form-check-input" />
                        print results
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-3">
                        <button className="btn btn-primary">update </button>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header> [administrator]</Accordion.Header>
                  <Accordion.Body>
                    <div
                      className="alert alert-info m-2 col-11"
                      style={{ fontSize: "14px" }}
                    >
                      <strong>Manager</strong> has all the permissions of a{" "}
                      <strong>scientist</strong> and{" "}
                      <strong>
                        sales service representative as well as financial
                        information access except editing and inputing client
                        result
                      </strong>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
