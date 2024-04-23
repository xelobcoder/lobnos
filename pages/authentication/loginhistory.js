import AuthenticationLayout from "../../components/Layout/AuthenticationLayout";
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch } from '../../components/Auth/customFetch';
import { useEffect } from "react";

export default function ApplicationLoginHistory() {

    useEffect(() => {
        customFetch("users/logins/history")
            .then((data) => { console.log(data) })
            .catch((err) => { console.log(err) })
    }, [])

  return (
    <AuthenticationLayout>
      <div className='mt-2'>
          <h3 className='text-primary'>Login History</h3>
          <table className='table' id='custom-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>employeeid</th>
                <th>Fullname</th>
              </tr>
            </thead>
          </table>
        </div>
    </AuthenticationLayout>
  )
}
