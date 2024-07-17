import AuthenticationLayout from "../../components/Layout/AuthenticationLayout";
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, updatePagination } from '../../components/Auth/customFetch';
import { useContext, useEffect, useState } from "react";
import Pagination from '../../components/accessories/pagination';
import Loader from "../../components/accessories/Loader";
import AuthContext from "../../components/Auth/useAuthentification";
import { useSearchParams } from "next/navigation";

export default function ApplicationLoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, count: 10 });
  const [load, setLoad] = useState(false);
  const employeeid = useSearchParams().get("userid");
  const { auth } = useContext(AuthContext);


  
  useEffect(() => {
    setLoading(true);
    customFetch(`security/users/getlogin/history?page=${filters.page}&&count=${filters.count}&&employeeid=${employeeid}`)
      .then((data) => {
        Array.isArray(data) && setHistory(data);
      })
      .catch((err) => { setHistory([]) })
      .finally(() => { setLoading(false) })
  }, [filters, employeeid])


  const formatDate = (value) => {
    return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`
  }


  const paginationUpdateFunction = (value) => {
    updatePagination(value, setFilters, filters);
  }

  const columns = [
    { Header: "employee", accessor: 'username' },
    { Header: "loginTime", accessor: 'loginTime', Cell: ({ value }) => { return formatDate(value) } },
    {
      Header: "logged out", accessor: "actualLogout", Cell: ({ value }) => {
        return value == 0 || value == null ? '' : formatDate(value)
      }
    },
    { Header: "system timeout", accessor: 'logoutTime', Cell: ({ value }) => { return formatDate(value) } },
    {
      Header: 'status', accessor: '', Cell: ({ row }) => {
        if (row.original.loggedout == 0) return <span className="bg-success br-5 text-white p-1">loggedIn
        </span>
        else return <span className="bg-danger br-5 text-white p-1">LoggedOut</span>;
      }
    },
    {
      Header: 'Device', accessor: "", Cell: ({ row }) => {
        const { browserInformation } = row.original;
        return <span>{JSON.parse(browserInformation)?.userAgent}</span>
      }
    }, {
      Header: 'action', accessor: '', Cell: () => {
        return <button
          disabled={auth?.role != "admin" && auth?.role != "manager"}
          className="btn btn-danger btn-sm">sign out user</button>
      }
    }
  ]


  const renderingView = () => {
    if (loading) return <Loader />
    else {
      return (
        <div className='mt-2'>
          <TableDisplay column={columns} data={history} showpage={false} filtering={true} />
          <div className="d-flex justify-content-center">
            <Pagination
              load={setLoad}
              page={filters.page}
              updateFunction={paginationUpdateFunction}
              count={filters.count} />
        </div>
        </div>
      )
    }
  }
  return (
    <AuthenticationLayout>
      {renderingView()}
    </AuthenticationLayout>
  )
}
