import React, { use, useEffect, useState } from 'react'
import { Accordion, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { customerRepresentative, scientistPermission, pageAccess, phelobotomy, administrator } from '../../../components/Auth/Roles/permissions';
import PagesAccessView from '../../../components/Auth/Roles/PagesAccessView';
export default function PermissionsOfUsers() {
  const permissions = useRouter().query.permissions;
  // state for customer permission
  const [clientPermissions, setClientPermissions] = useState({});
  const [user, setUser] = useState({ name: '', role: '' });
  const [previous, setPrevious] = useState(false);

  // get user permission data
  const getUserPermissions = async function () {
    const response = await customFetch(`user/permissions?permissions=${permissions}`);
    // we will set the permission to the state using the response or the default permission
    //  Using the function to determine to use the default permission or the response permission
    const backendPageAccess = function (default_pageAccess) {
      const { permissions } = response;
      if (permissions) {
        const keysPresent = Object.keys(permissions);
        // check if the keys are present in the default page access
        if (keysPresent.length > 0) {
          setPrevious(true);
          setClientPermissions(permissions)
        } else {
          const { role } = user;
          if (role == 'phelobotomist') {
            setClientPermissions(phelobotomy)
          } else if (role == 'customer service representative') {
            setClientPermissions(customerRepresentative)
          } else if (role == 'scientist') {
            setClientPermissions(scientistPermission)
          } else {
            setClientPermissions(administrator)
          }
        }
      }
    }

    setUser({ name: response?.username, role: response?.role })

    backendPageAccess(clientPermissions)
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




  // handle checkbox Changes 

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


  const handleSubmitPermission = async (ev, target) => {
    ev.preventDefault();
    //  we will submit the permission to the server
    const response = await customPost(`user/permissions?id=${permissions}`, 'PUT', target);
    if (response.statusCode === 200) {
      alert(response.message)
    }
  }



  return (
    <>
      <div className="card m-2" style={{ borderRadius: "10px" }}>
        <div className="card-header p-3 bg-secondary text-white">
          <h6 className="text-capitalize">
            permissions of {user?.name} a {user?.role}
          </h6>
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
              <Accordion defaultActiveKey={1} >
                <Accordion.Item>
                  <Accordion.Header>
                    {user.role}
                  </Accordion.Header>
                  <Accordion.Body>
                    <PagesAccessView
                      data={clientPermissions}
                      changeEvent={setClientPermissions}
                      handler={handleChange}
                      target={clientPermissions}
                      pageAcesshandler={handlePageAccess}
                      role={user.role}
                    />
                    <div>
                      <button className='btn btn-success'
                        onClick={(ev) => handleSubmitPermission(ev, clientPermissions)}>
                        update permissions
                      </button>
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