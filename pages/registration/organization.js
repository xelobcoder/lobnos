import SidebarFrontPage from "../../components/frontpagesidebar";
import Header from "../../components/header";


const AddOrganization = () => {
    return(
        <form className="grid-2 p-3">
            <div className="plane-organ">
            <div className="form-row grid-slide">
                <label>organization name</label>
                <input type='text' className="form-control" id='orgname'></input>
            </div>
            <div className="form-row grid-slide">
                <label>organization phone</label>
                <input type='tel' className="form-control" id='orgphone'></input>
            </div>
            <div className="form-row grid-slide">
                <label>organization email</label>
                <input type='email' className="form-control" id='orgemail'></input>
            </div>
            <div className="form-row grid-slide">
                <label>organization website</label>
                <input className="form-control" type='text' id='orgwebsite'></input>
            </div>
            <div className="form-row grid-slide">
               <label>location</label>
                <input type='text' className="form-control" id='location'></input>
            </div>
        </div>
            <div className="plane-organ">
            <div className="form-row grid-slide">
                <label>organization contact person</label>
                <input type='text' className="form-control" id='orgcontactperson'></input>
            </div>
            <div className="form-row grid-slide">
                <label>contact person contact</label>
                <input type='tel' className="form-control" id="contactpersoncontact"></input>
            </div>
            <div className="form-row grid-slide">
                <label>organization address</label>
                <textarea id='orgaddress' className="form-control">

                </textarea>
            </div>
            
            <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-primary button" style={{marginRight:"50px"}}>submit</button>
            </div>
            </div>
      </form>
    )
}

const OrganizationList = () => {
    return (
        <div>
            <div className="organization-list p-3 col-12">
               <div className="row card-header mb-2">
                   <div>
                      <input className="form-control col-3" type='search'/>
                   </div>
                </div> 
              <table className="table">
                <caption>Organization List</caption>
                <thead>
                    <tr>
                        <th scope="col"><input type='checkbox'/></th>
                        <th scope="col">Name</th>
                        <th scope="col">Phone</th>
                        <th scope="col">Email</th>
                        <th scope="col">Website</th>
                        <th scope="col">Location</th>
                        <th scope="col">Person</th>
                        <th scope="col">Contact</th>
                        <th scope="col">Address</th>
                    </tr>
                </thead>
                <tbody className="tbody">
                    <tr>
                        <td><input type='checkbox' ></input></td>
                        <td>Leonides Diagnostics</td>
                        <td>555-555-5555</td>
                        <td> xelobcoder@gmail.com</td>
                        <td>www.leonides.com</td>
                        <td>New York</td>
                        <td>Leonides</td>
                        <td>555-555-5555</td>
                        <td> jalpohin loecost</td>
                    </tr>
                    <tr>
                        <td><input type='checkbox' ></input></td>
                        <td>Leonides Diagnostics</td>
                        <td>555-555-5555</td>
                        <td> xelobcoder@gmail.com</td>
                        <td>www.leonides.com</td>
                        <td>New York</td>
                        <td>Leonides</td>
                        <td>555-555-5555</td>
                        <td> jalpohin loecost</td>
                    </tr>
                    <tr>
                        <td><input type='checkbox' ></input></td>
                        <td>Leonides  Diagnostics</td>
                        <td>555-555-5555</td>
                        <td> xelobcoder@gmail.com</td>
                        <td>www.leonides.com</td>
                        <td>New York</td>
                        <td>Leonides</td>
                        <td>555-555-5555</td>
                        <td> jalpohin loecost</td>
                    </tr>
                    <tr>
                        <td><input type='checkbox' ></input></td>
                        <td>Leonides Diagnostics</td>
                        <td>555-555-5555</td>
                        <td> xelobcoder@gmail.com</td>
                        <td>www.leonides.com</td>
                        <td>New York</td>
                        <td>Leonides</td>
                        <td>555-555-5555</td>
                        <td> jalpohin loecost</td>
                    </tr>
                </tbody>
                <tfoot className="tfoot">
                    <input type='number' className='form-control  col-3' ></input>
                </tfoot>
              </table>
            </div>
        </div>
    )
}

function Organization () {
    return (
        <>
           <div className="create-organization">
               <AddOrganization/>
           </div>
           <div className="list-organization">
              <OrganizationList/>
           </div>
        </>
    )
}


export default Organization;


Organization.getLayout = function(page) {
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