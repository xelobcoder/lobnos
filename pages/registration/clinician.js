import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";
import { useState } from "react";


// export default Clinicians;
function Clinicians () {
    const [listview,setListview] = useState(true);
    const [addview,setAddview] = useState(false);
    const [button,setButton] = useState(true);

    const toggleListView = () => {
        console.log("toggleListView");
        if (listview === true) {
            setListview(false);
            setAddview(true);
        } else {
            setAddview(false)
            setListview(true)
        }
    }



    const NewClinician= () => {
        return(
            <div className="add-clinician-view">
                    <form>
                        <div>
                        <h2 className="lead">Clinician Profile</h2>
                        <hr></hr>
                        <div className="form-row">
                            <label>Name</label>
                            <input type='text' className='form-control' id="name"/>
                        </div>
                        <div className="form-row">
                            <label>Phone</label>
                            <input type='tel' className='form-control' id="phone"/>
                        </div>
                        <div className="form-row">
                            <label>Email</label>
                            <input type='email' className='form-control' id="email"/>
                        </div>
                        <div className="form-row">
                            <label> website</label>
                            <input type='text' className='form-control' id="website"/>
                        </div>
                        <div className="form-row">
                                <label>organization</label>
                                <input type='text' className='form-control'></input>
                        </div>
                        <div className="form-row">
                            <label>location</label>
                            <input type='text' id="location" className='form-control'></input>
                        </div>
                        <div className="form-row">
                            <label>address</label>
                            <textarea className='form-control' id="address"></textarea>
                        </div>
                         <div>
                         <button type="button" className="btn btn-primary mt-3">save information</button>
                         <button type="button" onClick={toggleListView} className="btn btn-outline-danger border-danger mt-3 ml-5">cancel</button>
                         </div>
                        </div>
                </form>
            </div>
        )
    }
    

    const AddClinicianButton = () => {
        return(
            <div className="d-flex justify-content-end mt-2 btn-sm">
                <button onClick = {toggleListView} className="btn btn-outline-primary border-dark mt-w">add new clinician</button>
            </div>
        )
    }


        // show list of clinicians
        const ListClinicians = () => {
            return(
                <>
                {
                    button ? <AddClinicianButton/> : null
                }
                <h1>ListClinicians</h1>
                </>
            )
        }
        

    

    return (
        <>
           <div >
                {
                    listview ? <ListClinicians/> : null
                }
           </div>
           <div>
              {
                addview ? <NewClinician/> : null
              }
           </div>
        </>
    )
}


export default Clinicians;



Clinicians.getLayout = function(page) {
    return (
       <>
         <Header/>
         <div className="wrapper">
            <div className="side">
                <SidebarFrontPage/>
            </div>
            <div className="main">
                {page}
            </div>
         </div>
       </>
    )
  }