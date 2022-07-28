export default  function  AddOrganization (){
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
                <label className="--label">organization email</label>
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