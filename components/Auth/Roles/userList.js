import TableDisplay from '../../../components/accessories/TableDisplay';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Pagination from '../../accessories/pagination';
export default function UserList({ users,load, handleDelete, updatePage, activateUser, updateRefresh }) {
  const navigateTo = useRouter();

  const columns = [
    {
      Header: "username",
      accessor: "username",
      Cell: function ({ row, value }) {
        return (
          <div className='grid-100'>
            <span>{value}</span>
            {row.original.activation === 1 ? (
              <div className="text-success" variant="text">
                {">>"} ( active)
              </div>
            ) : (
              <div className="text-danger" variant="text">
                  {">>"} (inactive)
              </div>
            )}
          </div>
        )
      }
    },
    {
      Header: "email", accessor: "email"
    },
    {
      Header: "Role",
      accessor: "role",
    },
    {
      Header: "permissions",
      Cell: function ({ row }) {
        const { original } = row;
        const { employeeid, username, role } = original;
        return (
          <div>
            <Link className='border-bottom border-2 border-dark'
              href={`/authentication/permissions?employeeid=${employeeid}&&username=${username}&&role=${role}`}>
              update permissions
            </Link>
            <div className='bg-light btn-sm mt-1'>Apply default permissions</div>
          </div>
        );
      },
    },
    {
      Header: "Action",
      Cell: function ({ row }) {
        const { original } = row;
        const { employeeid, activation } = original;
        return (
          <div>
            <button
              className='btn btn-info btn-sm text-capitalize'
              onClick={() => { navigateTo.push(`/authentication/register?employeeid=${employeeid}`) }}
            >
              edit
            </button >
            <button
              className='btn btn-sm btn-danger text-capitalize mx-2 '
              onClick={() => handleDelete(employeeid)}
            >
              delete
            </button >
            <button
              className={`${activation === 1 ? "btn btn-danger" : "btn btn-success"} btn-sm text-capitalize`}
              onClick={() => activateUser(employeeid, activation, updateRefresh)}
            >
              {activation === 1 ? "deactivate" : "  activate"}
            </button >
          </div>
        );
      },
    },
  ];



  return (
    <>
      <div>
        <TableDisplay
          column={columns}
          data={users}
          filtering={true}
          showpage={false} />
        <div className="d-flex justify-content-center">
          <Pagination  load={load} updateFunction={updatePage} />
        </div>
      </div>
    </>
  )
}
