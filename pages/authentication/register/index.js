import React, { useState, useEffect } from 'react'
import UserList from '../../../components/Auth/Roles/userList';
import { Accordion } from 'react-bootstrap';

export default function Authentication_index_page() {

  return (
    <>
      <div className='container-fluid'>
        <div>
          <div className="card mt-2 p-0" style={{ borderRadius: "5px" }}>
            <div className="card-header bg-secondary text-white">
              <h6 className="text-capitalize mt-2">add new user</h6>
            </div>
            <div className="card-body p-2">
              <form autoCapitalize='on' autoComplete='off' accessKey='E'>
                <div className="row d-flex">
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="name">name</label>
                      <input

                        type="text"
                        className="form-control" required
                        id="name"
                        placeholder="name"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="email">email</label>
                      <input
                        type="email"
                        className="form-control" required
                        id="email"
                        placeholder="email"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="password">password</label>
                      <input
                        type="password"
                        className="form-control" required
                        id="password"
                        placeholder="password"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="cpassword">confirm password</label>
                      <input
                        type="password"
                        className="form-control" required
                        id="password"
                        placeholder="confirm password"
                      />
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12">
                    <div className="form-group">
                      <label style={{ fontSize: '14px' }} htmlFor="role">role</label>
                      <select className="form-control" required id="role">
                        <option value=''>select role</option>
                        <option value='admin'>admin</option>
                        <option value='customer service representative'>customer service representative</option>
                        <option value='scientist'>scientist</option>
                        <option value='manager'>manager</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-6 col-xl-3 col-lg-3 col-sm-12 mt-2 mt-4">
                    <div className="form-group">
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ borderRadius: "5px" }}
                      >
                        add user
                      </button>
                    </div>
                  </div>
                </div>
              </form>
              <hr />
              <div className="row p-2">
                <h4>Permissions</h4>
                <div className='alert alert-info m-2 col-11' style={{ fontSize: '14px' }}>
                  Default permissions are <strong>based on the role</strong>, however changes can be made to suit administration purposes
                </div>
              </div>
              <div className="row">
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
        </div>
      </div>
      <UserList />
    </>
  );
}




