import SidebarFrontPage from '../components/frontpagesidebar'
import Header from '../components/header';
import { Input } from '@chakra-ui/Input';
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
                <Input type="text" required className="form-control" id="name" />
              </div>
              <div className="form-row">
                <label>Phone</label>
                <Input
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
                <Input
                  type="email"
                  required
                  className="form-control"
                  id="email"
                />
              </div>
              <div className="form-row">
                <label> website</label>
                <Input type="text" className="form-control" id="website" />
              </div>
              <div className="form-row">
                <label>organization</label>
                <Input type="text" required className="form-control"></Input>
              </div>
              <div className="form-row">
                <label>location</label>
                <Input type="text" id="location" className="form-control"></Input>
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
            <Input
              type="search"
              placeholder="filter"
              className="col-5 ml-3 pl-3 "
            ></Input>
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
                  <Input
                    onClick={(ev) => markCheckbox(ev)}
                    type="checkbox"
                    className="checked"
                  ></Input>
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
                  <Input type="checkbox" className="checked"></Input>
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
                  <Input type="checkbox" className="checked"></Input>
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
                  <Input type="checkbox" className="checked"></Input>
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
                  <Input type="checkbox" className="checked"></Input>
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
                  <Input type="checkbox" className="checked"></Input>
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
      <Box sx={{ width: '96%' }}>
        <div>{listview ? <ListClinicians /> : null}</div>
        <div>{addview ? <NewClinician /> : null}</div>
      </Box>
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
        <div className="main" style={{backgroundColor:'aliceblue'}}>{page}</div>
      </div>
    </>
  )
}
