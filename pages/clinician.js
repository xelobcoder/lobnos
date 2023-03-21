import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header';
import { Button, Box } from '@mui/material'
import AddIcon from '@mui/icons-material/Add';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import EditIcon from '@mui/icons-material/Edit';
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
      <>
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
              <div className='org-button-wrapper' style={{ justifyContent: "flex-start" }}>
                <Button type="button" variant='contained' style={{ marginLeft: '-10px', marginRight: '20px' }} >
                  save information
                </Button>
                <Button variant='contained' type="button" color='error'
                  onClick={toggleListView}
                >
                  cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </>
    )
  }

  const AddClinicianButton = () => {
    return (
      <div className="d-flex justify-content-end mt-2 btn-sm">
        <Button variant='contained' type="button" color='primary' startIcon={<AddIcon />}
          onClick={toggleListView}>
          new clinician
        </Button>
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
              <Button color='error' variant='contained' startIcon={<DeleteSweepIcon />}>
                delete
              </Button>
              <Button color='primary' variant='contained' startIcon={<EditIcon />}>edit</Button>
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
            
            </tbody>
          </table>
        </div>
      </>
    )
  }

  return (
    <>
      <Box sx={{ width: '96%' }}>
        <div>{listview ? <ListClinicians /> : null}</div>
        <div>{addview ? <NewClinician /> : null}</div>
      </Box>
    </>
  )
}

export default Clinicians
