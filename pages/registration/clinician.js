import SidebarFrontPage from '../../components/frontpagesidebar'
import Header from '../../components/header';
import { useState } from 'react'
// export default Clinicians;
function Clinicians() {
  const [listview, setListview] = useState(true)
  const [addview, setAddview] = useState(false)
  const [button, setButton] = useState(true)

  const toggleListView = () => {
    console.log('toggleListView')
    if (listview === true) {
      setListview(false)
      setAddview(true)
    } else {
      setAddview(false)
      setListview(true)
    }
  }

  const markCheckbox = (ev) => {
    let e = ev.target;
    console.log(e)
    const allcheckbox = document.querySelectorAll('.checked')
    if (e.checked) {
      allcheckbox.forEach(function (item) {
        item.checked = true;
      })
    } else {
      allcheckbox.forEach((element) => {
        element.checked = false;
      })
    }
  }

  const NewClinician = () => {
    return (
      <div className="add-clinician-view">
        <form>
          <div>
            <h2 className="lead">Clinician Profile</h2>
            <hr></hr>
            <div className="form-row">
              <label>Name</label>
              <input type="text" required className="form-control" id="name" />
            </div>
            <div className="form-row">
              <label>Phone</label>
              <input
                type="tel"
                required
                maxLength="10"
                minLength="10"
                className="form-control"
                id="phone"
              />
            </div>
            <div className="form-row">
              <label>Email</label>
              <input
                type="email"
                required
                className="form-control"
                id="email"
              />
            </div>
            <div className="form-row">
              <label> website</label>
              <input type="text" className="form-control" id="website" />
            </div>
            <div className="form-row">
              <label>organization</label>
              <input type="text" required className="form-control"></input>
            </div>
            <div className="form-row">
              <label>location</label>
              <input type="text" id="location" className="form-control"></input>
            </div>
            <div className="form-row">
              <label>address</label>
              <textarea className="form-control" id="address"></textarea>
            </div>
            <div className="form-row">
              <p>select occupation that match close to yours</p>
              <select className="form-control" id="occupation">
                <option>select occupation</option>
                <option value="doctor">doctor</option>
                <option value="nurse">nurse</option>
                <option value="pharmacist">pharmacist</option>
                <option value="therapist">therapist</option>
                <option value="other">other</option>
              </select>
            </div>
            <div>
              <button type="button" className="btn btn-primary mt-3">
                save information
              </button>
              <button
                type="button"
                onClick={toggleListView}
                className="btn btn-outline-danger border-danger mt-3 ml-5"
              >
                cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    )
  }

  const AddClinicianButton = () => {
    return (
      <div className="d-flex justify-content-end mt-2 btn-sm">
        <button
          onClick={toggleListView}
          className="btn btn-outline-primary border-dark mt-w"
        >
          add new clinician
        </button>
      </div>
    )
  }

  // show list of clinicians
  const ListClinicians = () => {
    return (
      <>
        {button ? <AddClinicianButton /> : null}
        <div className="p-3">
          <div className="grid-2 pb-2 pt-2" id="filterer-top">
            <input
              type="search"
              placeholder="filter"
              className="col-5 ml-3 pl-3 "
            ></input>
            <div className="d-flex justify-content-end mr-5 pr-5">
              <button className="btn btn-sm btn-danger"> 
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-archive-fill" viewBox="0 0 16 16">
                <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/>
                </svg >delete
            </button>
              <button className="btn btn-sm btn-info">edit</button>
            </div>
          </div>
          <table className="table">
            <thead className="thead">
              <tr>
                <th>
                  <input
                    onClick={(ev) => markCheckbox(ev)}
                    type="checkbox"
                    className="checked"
                  ></input>
                </th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>website</th>
                <th>organization</th>
                <th>location</th>
                <th>address</th>
                <th>occupation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <input type="checkbox" className="checked"></input>
                </td>
                <td>John nyakpi thompson</td>
                <td>1234567890</td>
                <td> xelobcoder@gmail</td>
                <td>www.xelobcoder.com</td>
                <td>xelobcoder</td>
                <td>kigali</td>
                <td>kigali</td>
                <td>doctor</td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" className="checked"></input>
                </td>
                <td>John</td>
                <td>1234567890</td>
                <td> xelobcoder@gmail</td>
                <td>www.xelobcoder.com</td>
                <td>xelobcoder</td>
                <td>kigali</td>
                <td>kigali</td>
                <td>doctor</td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" className="checked"></input>
                </td>
                <td>John</td>
                <td>1234567890</td>
                <td> xelobcoder@gmail</td>
                <td>www.xelobcoder.com</td>
                <td>xelobcoder</td>
                <td>kigali</td>
                <td>kigali</td>
                <td>doctor</td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" className="checked"></input>
                </td>
                <td>John</td>
                <td>1234567890</td>
                <td> xelobcoder@gmail</td>
                <td>www.xelobcoder.com</td>
                <td>xelobcoder</td>
                <td>kigali</td>
                <td>kigali</td>
                <td>doctor</td>
              </tr>
              <tr>
                <td>
                  <input type="checkbox" className="checked"></input>
                </td>
                <td>John</td>
                <td>1234567890</td>
                <td> xelobcoder@gmail</td>
                <td>www.xelobcoder.com</td>
                <td>xelobcoder</td>
                <td>kigali</td>
                <td>kigali</td>
                <td>doctor</td>
              </tr>
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <>
      <div>{listview ? <ListClinicians /> : null}</div>
      <div>{addview ? <NewClinician /> : null}</div>
    </>
  )
}

export default Clinicians

Clinicians.getLayout = function (page) {
  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="side">
          <SidebarFrontPage />
        </div>
        <div className="main">{page}</div>
      </div>
    </>
  )
}
