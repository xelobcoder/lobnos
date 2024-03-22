import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation';
import { customFetch, customPost } from '../../../components/Auth/customFetch';
import { customerRepresentative, scientistPermission, phelobotomy, administrator } from '../../../components/Auth/Roles/permissions';
import Loader from '../../../components/accessories/Loader';
import PagesAccessView from '../../../components/Auth/Roles/PagesAccessView';
import AuthenticationLayout from '../../../components/Layout/AuthenticationLayout';
export default function PermissionsOfUsers() {
  const userid = useSearchParams().get("employeeid");
  const username = useSearchParams().get("username");
  const role = useSearchParams().get("role");
  // state for customer permission
  const [clientPermissions, setClientPermissions] = useState({});
  const [previous, setPrevious] = useState(false);
  const [isloading, setLoading] = useState(true);


  const updateUserInfo = useCallback(() => {
    if (role == 'phelobotomist') {
      setClientPermissions(phelobotomy)
    } else if (role == 'customer service representative') {
      setClientPermissions(customerRepresentative)
    } else if (role == 'scientist') {
      setClientPermissions(scientistPermission)
    } else {
      setClientPermissions(administrator)
    }
  }, [role]);

  // get user permission data
  const getUserPermissions = useCallback(async function () {
    try {
      if (userid) {
        setLoading(true);
        const response = await customFetch(`user/permissions?permissions=${userid}`);
        const { permissions } = response;
        const keysPresent = Object.keys(permissions);
        if (keysPresent.length = 0) updateUserInfo();
        setPrevious(true);
        setClientPermissions(permissions);
        setLoading(false);
      }
    } catch (err) {
      updateUserInfo();
      setLoading(false);
    }
  }, [userid, updateUserInfo])


  useEffect(() => {
    getUserPermissions();
  }, [getUserPermissions])




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
    const response = await customPost(`user/permissions?id=${parseInt(userid)}`, 'PUT', target);
    if (response.statusCode === 200) {
      alert(response.message)
    }
  }


  const renderer = () => {
    if (isloading) {
      return <Loader />
    } else {
      return (
        <div className='card'>
          <div className='card-header bg-secondary text-white'>
            <h4>
              Permissions of {username} with role of a/an <span className='text-capitalize'>{role}</span>
            </h4>
          </div>
          <div className='card-body'>
            <div
              className="alert alert-secondary bg-opacity-50"
              style={{ fontSize: "14px" }}>
              Default permissions are <strong>based on the role</strong>,
              however changes can be made to suit administrative purposes
            </div>
            <PagesAccessView
              data={clientPermissions}
              changeEvent={setClientPermissions}
              handler={handleChange}
              target={clientPermissions}
              pageAcesshandler={handlePageAccess}
              role={role}
            />
            <div>
              <button className='btn btn-success btn-sm mt-2'
                onClick={(ev) => handleSubmitPermission(ev, clientPermissions)}>
                update permissions
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <AuthenticationLayout>
        {renderer()}
    </AuthenticationLayout>
  );
}