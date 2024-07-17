import { useEffect, useState, } from 'react';
import { useRouter } from 'next/navigation';
import { handleActivation } from '../../components/Auth/registerclient';
import { customFetch, generateRandomTextAndNumbers, parseDate } from '../../components/Auth/customFetch';
import FrontDeskLayout from '../../components/Layout/FrontDeskLayout';
import Loader from '../../components/accessories/Loader';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TableDisplay from '../../components/accessories/TableDisplay';
import { ToastContainer, toast } from 'react-toastify';
import { Dropdown } from 'react-bootstrap';



export default function Activator() {
  const [loading, setLoading] = useState(false);
  const [tempStore, setStore] = useState([]);
  const [filter, setFilter] = useState({ patientId: '', fullname: '', mobile: '', to: '', from: '' })
  const router = useRouter();


  const advancedSearchButton = async function () {
    let urlquery = `customers?`
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


  const callActivation = async (stat, ptid, toast, cb) => {
    const status = await handleActivation(stat, ptid, toast, cb);
    if (status == true) {
      const prev = [...tempStore];
      const matchedIndex = prev.findIndex((item, index) => item.patientid == ptid);
      if (matchedIndex >= 0) {
        const desiredStatus = stat == 'TRUE' ? 'FALSE' : 'TRUE'
        prev[matchedIndex]['activation_status'] = desiredStatus;
      }
      setStore(prev);
    }
  }


  const gotoPrevTrans = (item) => {
    let { patientid } = item;
    if (patientid) {
      patientid = `${generateRandomTextAndNumbers(50)}${patientid}`;
    }
    window.open(`operations/laboratory/patientarchives/transactions?ptid=${patientid}`)
  }






  const columns = [
    { Header: 'patientid', accessor: 'patientid' },
    { Header: 'fullname', accessor: 'fullname', Cell: ({ value }) => <div className='text-capitalize'>{value}</div> },
    { Header: 'registered on', accessor: 'date', Cell: ({ value }) => { return <span>{parseDate(value)}</span> } },
    { Header: "dob", accessor: "dob", Cell: ({ value }) => parseDate(value) },
    {
      Header: "age", accessor: "age", Cell: ({ row, value }) => {
        return <span>{value} {row.original.agetype}</span>
      }
    },
    { Header: "gender", accessor: "gender" },
    { Header: 'contact', accessor: 'contact' },
    {
      Header: 'activation status', accessor: 'activation_status', Cell: ({ value }) => {
        return <div className={`btn btn-sm border-2 p-1 ${value === "TRUE" ? "border-success" : "border-danger"}`}>
          {value === "TRUE" ? "active" : "inactive"}
        </div>
      }
    },
    {
      Header: 'more', accessor: '', Cell: ({ value, row }) => {
        const item = row.original;
        return (
          <Dropdown  >
            <Dropdown.Toggle variant="light" id="archives-dropdown">
              <MoreVertIcon />
            </Dropdown.Toggle>
            <Dropdown.Menu className="m-0 p-0 bg-white">
              <Dropdown.Item className='text-capitalize' onClick={(ev) => {
                callActivation(
                  item.activation_status,
                  item.patientid,
                  toast,
                );
              }} >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M7 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C14.7405 2 17.1131 3.5748 18.2624 5.86882L16.4731 6.76344C15.6522 5.12486 13.9575 4 12 4C9.23858 4 7 6.23858 7 9V10ZM5 12V20H19V12H5ZM10 15H14V17H10V15Z"></path></svg> activate client
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' onClick={(ev) => {
                callActivation(
                  item.activation_status,
                  item.patientid,
                  toast,
                );
              }} >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 10H20C20.5523 10 21 10.4477 21 11V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V11C3 10.4477 3.44772 10 4 10H5V9C5 5.13401 8.13401 2 12 2C15.866 2 19 5.13401 19 9V10ZM5 12V20H19V12H5ZM11 14H13V18H11V14ZM17 10V9C17 6.23858 14.7614 4 12 4C9.23858 4 7 6.23858 7 9V10H17Z"></path></svg>deactivate client
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' onClick={(e) => {
                router.push(`/patients/update?patientid=${item.patientid}`)
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18.5858 17L16.7574 15.1716L18.1716 13.7574L22.4142 18L18.1716 22.2426L16.7574 20.8284L18.5858 19H15V17H18.5858Z"></path></svg> update records
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' onClick={(e) => {
                handleBilling(item);
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3.00488 3.00275H21.0049C21.5572 3.00275 22.0049 3.45046 22.0049 4.00275V20.0027C22.0049 20.555 21.5572 21.0027 21.0049 21.0027H3.00488C2.4526 21.0027 2.00488 20.555 2.00488 20.0027V4.00275C2.00488 3.45046 2.4526 3.00275 3.00488 3.00275ZM4.00488 5.00275V19.0027H20.0049V5.00275H4.00488ZM8.50488 14.0027H14.0049C14.281 14.0027 14.5049 13.7789 14.5049 13.5027C14.5049 13.2266 14.281 13.0027 14.0049 13.0027H10.0049C8.62417 13.0027 7.50488 11.8835 7.50488 10.5027C7.50488 9.12203 8.62417 8.00275 10.0049 8.00275H11.0049V6.00275H13.0049V8.00275H15.5049V10.0027H10.0049C9.72874 10.0027 9.50488 10.2266 9.50488 10.5027C9.50488 10.7789 9.72874 11.0027 10.0049 11.0027H14.0049C15.3856 11.0027 16.5049 12.122 16.5049 13.5027C16.5049 14.8835 15.3856 16.0027 14.0049 16.0027H13.0049V18.0027H11.0049V16.0027H8.50488V14.0027Z"></path></svg> bill client
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' onClick={(ev) => { window.open(`/appointments/book?patientid=${item.patientid}`) }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 4H7C5.89543 4 5 4.89543 5 6C5 7.10457 5.89543 8 7 8H21V21C21 21.5523 20.5523 22 20 22H7C4.79086 22 3 20.2091 3 18V6C3 3.79086 4.79086 2 7 2H20C20.5523 2 21 2.44772 21 3V4ZM5 18C5 19.1046 5.89543 20 7 20H19V10H7C6.27143 10 5.58835 9.80521 5 9.46487V18ZM20 7H7C6.44772 7 6 6.55228 6 6C6 5.44772 6.44772 5 7 5H20V7Z"></path></svg> book appointment
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM7 10V12H9V10H7ZM11 10V12H13V10H11ZM15 10V12H17V10H15Z"></path></svg> send sms
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M21 3C21.5523 3 22 3.44772 22 4V20.0066C22 20.5552 21.5447 21 21.0082 21H2.9918C2.44405 21 2 20.5551 2 20.0066V19H20V7.3L12 14.5L2 5.5V4C2 3.44772 2.44772 3 3 3H21ZM8 15V17H0V15H8ZM5 10V12H0V10H5ZM19.5659 5H4.43414L12 11.8093L19.5659 5Z"></path></svg> email client
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 3C2.44772 3 2 3.44772 2 4V20C2 20.5523 2.44772 21 3 21H21C21.5523 21 22 20.5523 22 20V4C22 3.44772 21.5523 3 21 3H3ZM8 5V8H4V5H8ZM4 14V10H8V14H4ZM4 16H8V19H4V16ZM10 16H20V19H10V16ZM20 14H10V10H20V14ZM20 5V8H10V5H20Z"></path></svg> transactions
              </Dropdown.Item>
              <Dropdown.Item className='text-capitalize' onClick={(ev) => { gotoPrevTrans(item) }}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4V10C11 10.5523 10.5523 11 10 11H4C3.44772 11 3 10.5523 3 10V4ZM3 14C3 13.4477 3.44772 13 4 13H10C10.5523 13 11 13.4477 11 14V20C11 20.5523 10.5523 21 10 21H4C3.44772 21 3 20.5523 3 20V14ZM13 4C13 3.44772 13.4477 3 14 3H20C20.5523 3 21 3.44772 21 4V10C21 10.5523 20.5523 11 20 11H14C13.4477 11 13 10.5523 13 10V4ZM13 14C13 13.4477 13.4477 13 14 13H20C20.5523 13 21 13.4477 21 14V20C21 20.5523 20.5523 21 20 21H14C13.4477 21 13 20.5523 13 20V14Z"></path></svg> previous tests
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )
      }
    }
  ]


  useEffect(() => {
    customFetch(`customers`)
      .then((data) => {
        if (Array.isArray(data)) {
          setStore(data)
        }
      })
      .catch((err) => { console.log(err) })
  }, [])


  return (
    <FrontDeskLayout>
      <ToastContainer theme='colored' position='top-center' className="text-sm" />
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

