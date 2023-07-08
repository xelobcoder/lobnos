import React from 'react'
import { Accordion, Button } from 'react-bootstrap';
export default function PermissionsOfUsers() {
  return (
    <>
      <div className='card m-2' style={{borderRadius:'10px'}}>
        <div className='card-header p-3 bg-secondary text-white'>
          <h6 className='text-capitalize'>permissions of Tiifu Hamza</h6>
        </div>
        <div className='card-body'>
          <div className="row p-3">
            <h4>Permissions</h4>
            <div className='alert alert-info m-1 col-11' style={{ fontSize: '14px' }}>
              Default permissions are <strong>based on the role</strong>, however changes can be made to suit administration purposes
            </div>
          </div>
          <div className="row p-3">
            <div className="col-12">
              <Accordion defaultActiveKey="0">
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Permissions [sales service representative]</Accordion.Header>
                  <Accordion.Body>
                    <div className="row">
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Register client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> View client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Edit client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Delete client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Print result
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> activate client
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Permissions [scientist]</Accordion.Header>
                  <Accordion.Body>
                    <div className="row">
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> View client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Edit client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> Delete client
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> register client
                      </div>
                    </div>
                    <div className="row">
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> enter results
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> view results
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> edit results
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> delete results
                      </div>
                      <div className='col-12'>
                        <input type='checkbox' className='form-check-input' /> print results
                      </div>
                    </div>
                    <div className="row">
                      <div className='col-3'>
                        <button className='btn btn-primary'>update </button>
                      </div>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                  <Accordion.Header> [administrator]</Accordion.Header>
                  <Accordion.Body>
                    <div className="alert alert-info m-2 col-11" style={{ fontSize: '14px' }}>
                      <strong>Manager</strong> has all the permissions of a <strong>scientist</strong> and <strong>sales service representative as well as financial information access except editing and inputing client result</strong>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
