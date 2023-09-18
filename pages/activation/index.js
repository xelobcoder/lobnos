import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button, Typography } from '@mui/material';
import TableIsLoading from '../../components/accessories/TableIsLoading';
import { ActivationBulk, handleActivation } from '../../components/Auth/registerclient';
import { customFetch } from '../../components/Auth/customFetch';

export default function Activator() {
  const [activationData, setActivationData] = useState([]);
  const [tempStore, setStore] = useState([]);
  const [urlquery, seturlQuery] = useState(`activation?`)
  const [advancedSearch, setAdvancedSearch] = useState(false);
  // applying filter to the advanced query search
  const [filter, setFilter] = useState({
    patientId: '', fullname: '', mobile: '', to: '', from: ''
  })


  // 
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
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value })
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
        setStore(data)
      }
    } catch (err) {
      alert('error occured in connecting to server')
    }
  }
  useEffect(() => {
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
                Activate all
              </button>
            </div>
            <div>
              <button className="btn btn-outline-danger m-2" onClick={(e) => ActivationBulk(e, 'FALSE', getInitData)}>
                Deactivate all
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
      <div style={{ height: "100vh", overflowY: "auto", margin: "10px" }}>
        {activationData.length > 0 && (
          <table id="custom-table">
            <thead>
              <tr>
                <th>reg date</th>
                <th>patient id</th>
                <th>fullname</th>
                <th style={{ display: "flex", justifyContent: "center" }}>
                  status
                </th>
                <th>action</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activationData.length === 0 && <TableIsLoading col={8} />}
              {activationData.length > 0 &&
                activationData.map((item) => (
                  <tr key={item.ID}>
                    <td>{item.DATE.slice(0, 10)}</td>
                    <td>{item.PATIENTID}</td>
                    <td>{item.FULLNAME}</td>
                    <td>
                      <div
                        className={
                          item.ACTIVATION_STATUS === "TRUE"
                            ? "activated"
                            : "deactivated"
                        }
                      >
                        {item.ACTIVATION_STATUS === "TRUE"
                          ? "activated"
                          : "deactivated"}
                      </div>
                    </td>
                    <td className="activation-cell">
                      <Button
                        size="small"
                        variant="outlined"
                        color={
                          item.ACTIVATION_STATUS === "TRUE"
                            ? "error"
                            : "success"
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
                      </Button>
                    </td>
                    <td>
                      {item.ACTIVATION_STATUS === "TRUE" ? (
                        <Button
                          sx={{ width: "100px" }}
                          color="success"
                          variant="contained"
                          size="small"
                          onClick={(e) => {
                            handleBilling(item);
                          }}
                        >
                          bill client
                        </Button>
                      ) : (
                        <Button
                          variant="contained"
                          sx={{ width: "100px" }}
                          size="small"
                          color='primary'
                          onClick={(e) => {
                            router.push(`/patients/${item.PATIENTID}`)
                          }}
                        >
                          update info

                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
            {activationData.length === 0 && (
              <tr>
                <td colSpan="7">
                  <Typography variant="h5">No data found</Typography>
                </td>
              </tr>
            )}
          </table>
        )}
      </div>
    </>
  );
}
