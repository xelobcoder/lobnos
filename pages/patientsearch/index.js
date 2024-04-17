import { useState,} from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch } from '../../components/Auth/customFetch';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import Loader from '../../components/accessories/Loader';
import TableDisplay from '../../components/accessories/TableDisplay';

export default function Activator() {
  const [loading, setLoading] = useState(false);
  const [tempStore, setStore] = useState([]);
  const [filter, setFilter] = useState({ patientId: '', fullname: '', mobile: '', to: '', from: '' })
  const router = useRouter();


  const advancedSearchButton = async function () {
    let urlquery = `activation?`
    if (isNaN(filter.mobile) || isNaN(filter.patientId)) {
      return alert('10 digits required as Mobile Number And patientid must be a number');
    }
    for (const [key, value] of Object.entries(filter)) {
      urlquery += `${key}=${value}&&`
    }
    setLoading(true);
    customFetch(urlquery)
      .then((data) => {
        if (Array.isArray(data)) {
          setStore(data || []);
        }
        setLoading(false);
      }).catch((err) => {
        setLoading(false);
      })
  }

  const handleAdvancedQuery = async function (e) {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value })
  }

  const handleBilling = (item) => {
    const { patientid } = item;
    if (patientid) {
      router.push(`/billing/patientid?patientid=${patientid}`);
    } else {
      alert('Patientid not included')
    }
  };





  const renderingView = () => {
    if (loading) return <Loader />
    else {
      if (tempStore.length == 0) {
        return <h6 className='my-2 alert alert-info'>No data Available.Search to continue</h6>
      } else {
        return (
          <section>
            <TableDisplay column={columns} data={tempStore} />
          </section>
        )
      }
    }
  }


  const callActivation = async (a, b, c, d) => {
    const status = await handleActivation(a, b, c, d);
    if (status == 'success') {
      const prev = [...tempStore];
      const matchedIndex = prev.findIndex((item, index) => item.patientid == d);
      if (matchedIndex >= 0) {
        const desiredStatus = c == 'TRUE' ? 'FALSE' : 'TRUE'
        prev[matchedIndex]['activation_status'] = desiredStatus;
      }
      setStore(prev);
    }
  }



  const columns = [
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'fullname', accessor: 'fullname' },
    { Header: 'contact', accessor: 'contact' },
    { Header: 'registration date', accessor: 'date', Cell: ({ value }) => { return <span>{new Date(value).toLocaleDateString()}</span> } },
    {
      Header: 'activation', accessor: 'activation_status', Cell: ({ value }) => {
        return <span className={`border-bottom border-2 ${value == 'TRUE' ? 'border-success' : 'border-danger'}`}>{value == 'TRUE' ? 'activated' : 'deactivated'}</span>
      }
    },
    {
      Header: 'actions', accessor: '', Cell: ({ row, value }) => {
        const item = row.original;
        return (
          <div>
            <button
              className={
                item.activation_status === "TRUE"
                  ? "btn btn-danger btn-sm"
                  : "btn btn-success btn-sm"
              }
              onClick={(e) => {
                callActivation(
                  e,
                  item.id,
                  item.activation_status,
                  item.patientid,
                );
              }}
            >
              {item.activation_status === "FALSE"
                ? "activate"
                : "deactivate"}
            </button>
            <span className='mx-2'>
              {item.activation_status === "TRUE" ? (
                <button className='btn btn-success btn-sm'
                  onClick={(e) => {
                    handleBilling(item);
                  }}
                >
                  bill client
                </button>
              ) : (
                <button className='btn btn-primary btn-sm'
                  onClick={(e) => {
                    router.push(`/patients/update?patientid=${item.patientid}`)
                  }}
                >
                  update
                </button>
              )}
            </span>
          </div>
        )
      }
    }
  ]


  return (
    <FrontDeskLayout>
      <div className='mx-2'>
        <h4>Advanced Patient search</h4>
        <div className='d-flex justify-content-between'>
            <input
              className="custom-input"
              name="patientid"
              onChange={(e) => handleAdvancedQuery(e)}
              placeholder="enter patientid"
              type="number"
              id="patientid"
            />
            <input
            className="custom-input mx-2"
              onChange={(e) => handleAdvancedQuery(e)}
              type="text"
              placeholder="fullname"
              name="fullname"
            />
            <input
            className="custom-input mx-2"
              onChange={(e) => handleAdvancedQuery(e)}
              type="tell"
              maxLength={10}
            minLength={0}
              inputMode="numeric"
              placeholder="mobile number"
              name="mobile"
            />
            <input
            className="custom-input mx-2"
              onChange={(e) => handleAdvancedQuery(e)}
              type="date"
              size="small"
              placeholder="from"
              name="from"
              inputMode="date"
            />
            <input
            className="custom-input mx-2"
              onChange={(e) => handleAdvancedQuery(e)}
              tui
              type="date"
              size="small"
              name="to"
            />
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={(e) => advancedSearchButton(e)}
              variant="contained"
              color="primary"
              size='small'
            >
            search 
          </button>
        </div>
        {renderingView()}
      </div>
    </FrontDeskLayout>
  );
}

