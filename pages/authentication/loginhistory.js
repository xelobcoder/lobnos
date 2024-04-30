import AuthenticationLayout from "../../components/Layout/AuthenticationLayout";
import TableDisplay from '../../components/accessories/TableDisplay';
import { customFetch, updatePagination } from '../../components/Auth/customFetch';
import { useEffect, useState } from "react";
import Pagination from '../../components/accessories/pagination';
import Loader from "../../components/accessories/Loader";

export default function ApplicationLoginHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, count: 10 });
  const [load, setLoad] = useState(false);

  useEffect(() => {
    setLoading(true);
    customFetch(`security/users/getlogin/history?page=${filters.page}&&count=${filters.count}`)
      .then((data) => {
        Array.isArray(data) && setHistory(data);
      })
      .catch((err) => { setHistory([]) })
      .finally(() => { setLoading(false) })
  }, [filters])


  const formatDate = (value) => {
    return `${new Date(value).toLocaleDateString()} ${new Date(value).toLocaleTimeString()}`
  }


  const paginationUpdateFunction = (value) => {
    updatePagination(value, setFilters, filters);
  }

  const columns = [
    { Header: "employee", accessor: 'username' },
    { Header: "loginTime", accessor: 'loginTime', Cell: ({ value }) => { return formatDate(value) } },
    { Header: "logoutTime", accessor: "logoutTime", Cell: ({ value }) => { return formatDate(value) } },
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
