import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import { ActivationBulk, handleActivation } from '../../components/Auth/registerclient';
import { customFetch } from '../../components/Auth/customFetch';
import SettingsLayout from '../../components/settingsComponents/SettingsLayout';
import SidebarFrontPage from '../../components/frontpagesidebar';

export default function Activator() {
  const [loading, setLoading] = useState(true);
  const [activationData, setActivationData] = useState([]);
  const [tempStore, setStore] = useState([]);
  const [urlquery, seturlQuery] = useState(`activation?`)
  const [advancedSearch, setAdvancedSearch] = useState(false);
  // applying filter to the advanced query search
  const [filter, setFilter] = useState({
    patientId: '', fullname: '', mobile: '', to: '', from: ''
  })



  const router = useRouter();

  const [id, setId] = useState('');

  const handleNameFilter = (e) => {
    const filtered = e.target.value;
    setId(filtered);

    if (activationData.length !== 0) {
      if (filtered.length == 0) {
        setActivationData(tempStore);
      } else {
        const filteredData = activationData.filter((item) => {
          const fullName = new String(item.FULLNAME.toLowerCase())
          const patientId = new String(item.PATIENTID);
          return fullName.match(filtered.toLowerCase()) || patientId.includes(filtered.toLowerCase());
        });
        if (filteredData.length > 0) {
          setActivationData(filteredData);
        }
      }
    } else {
      return
    }
  };


  const advancedSearchButton = async function () {
    let urlquery = `activation?`
    for (const [key, value] of Object.entries(filter)) {
      urlquery += `${key}=${value}&&`
    }
    seturlQuery(urlquery)
  }

  const handleAdvancedQuery = async function (e) {
    setLoading(true);
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value })
    if (value.length > 2) {
      advancedSearchButton();
    }
  }

  const handleBilling = (item) => {
    const { PATIENTID } = item;
    if (PATIENTID) {
      router.push(`/billing/patientid/${PATIENTID}`);
    } else {
      alert('Patientid not included')
    }
  };

  const getInitData = async () => {
    try {
      const data = await customFetch(urlquery);
      setActivationData(data);
      if (!advancedSearch) {
        setStore(data);
      }
    } catch (err) {
      alert('error occured in connecting to server')
    }
  }
  useEffect(() => {
    setLoading(false);
    if (advancedSearch == false) {
      if (activationData.length == 0 && tempStore.length == 0) {
        getInitData()
      } else {
        setActivationData(tempStore)
      }
    } else {
      getInitData()
    }
  }, [urlquery, advancedSearch])


  return (
    <>
      <SettingsLayout sidebar={<SidebarFrontPage />}>
        {!advancedSearch && (
          <div className='not-activation-advanced'>
            <div>
              <input
                placeholder="Enter patientid"
                value={id}
                name="patientid"
                id="patientid"
                className="custom-input"
                onChange={handleNameFilter}
              />
            </div>
            <div>
              <div>
                <button className="btn btn-outline-success  m-2" onClick={(w) => ActivationBulk(w, 'TRUE', getInitData)}>
                  Bulk Activation
                </button>
              </div>
              <div>
                <button className="btn btn-outline-danger m-2" onClick={(e) => ActivationBulk(e, 'FALSE', getInitData)}>
                  Bulk Deactivation
                </button>
              </div>
              <div>
                <button
                  className="btn btn-primary m-2"
                  onClick={() => setAdvancedSearch(!advancedSearch)}
                >
                  advanced
                </button>
              </div>
            </div>
          </div>
        )}

        {advancedSearch && (
          <div
            id='activation-advanced'
          >
            <input
              className="form-control"
              name="patientid"
              onChange={(e) => handleAdvancedQuery(e)}
              placeholder="enter patientid"
              type="number"
              id="patientid"
            />
            <input
              className="form-control"
              onChange={(e) => handleAdvancedQuery(e)}
              type="text"
              placeholder="fullname"
              name="fullname"
            />
            <input
              className="form-control"
              onChange={(e) => handleAdvancedQuery(e)}
              type="tell"
              maxLength={10}
              minLength={0}
              inputMode="numeric"
              placeholder="mobile number"
              name="mobile"
            />
            <input
              className="form-control"
              onChange={(e) => handleAdvancedQuery(e)}
              type="date"
              size="small"
              placeholder="from"
              name="from"
              inputMode="date"
            />
            <input
              className="form-control"
              onChange={(e) => handleAdvancedQuery(e)}
              tui
              type="date"
              size="small"
              name="to"
            />
            <button
              type="button"
              className="custom-button"
              onClick={(e) => advancedSearchButton(e)}
              variant="contained"
              color="primary"
              size='small'
            >
              search
            </button>
            <button
              type="button"
              size='small'
              className="btn btn-danger"
              color="error"
              onClick={(e) => setAdvancedSearch(false)}
            >
              close
            </button>
          </div>
        )}


          <div style={{ overflowY: "auto", margin: "10px" }}>
            <table className='table'>
              <thead>
                <tr>
                  <th>reg date</th>
                  <th>patient id</th>
                  <th>fullname</th>
                  <th>
                    status
                  </th>
                  <th>action</th>
                  <th>action</th>
                </tr>
              </thead>
              <tbody>
                {(activationData.length > 0 && !loading ) &&
                  activationData.map((item) => (
                    <tr key={item.ID}>
                      <td>{item.DATE.slice(0, 10)}</td>
                      <td>{item.PATIENTID}</td>
                      <td>{item.FULLNAME}</td>
                      <td className={
                        item.ACTIVATION_STATUS === "TRUE"
                          ? "activated"
                          : "deactivated"
                      }>
                        {item.ACTIVATION_STATUS === "TRUE"
                          ? "activated"
                          : "deactivated"}
                      </td>
                      <td>
                        <button
                          className={
                            item.ACTIVATION_STATUS === "TRUE"
                              ? "btn btn-danger btn-sm"
                              : "btn btn-success btn-sm"
                          }
                          onClick={(e) => {
                            handleActivation(
                              e,
                              item.ID,
                              item.ACTIVATION_STATUS,
                              item.PATIENTID,
                              getInitData
                            );
                          }}
                        >
                          {item.ACTIVATION_STATUS === "FALSE"
                            ? "activate"
                            : "deactivate"}
                        </button>
                      </td>
                      <td>
                        {item.ACTIVATION_STATUS === "TRUE" ? (
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
                              router.push(`/patients/${item.PATIENTID}`)
                            }}
                          >
                            update
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {
                    (activationData.length === 0 && !loading) && (<tr>
                      <td colSpan={6}>No data to display</td>
                    </tr>)
                  }
                  {
                    loading && <TableIsLoading/>
                  }
              </tbody>
            </table>
          </div>
      </SettingsLayout>
    </>
  );
}

