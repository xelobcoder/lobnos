import AuthenticationLayout from "../../components/Layout/AuthenticationLayout";


export default function ApplicationLoginHistory() {
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
