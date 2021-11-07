import React from 'react';
import "../css/login.css";


export default function Credentials() {
  return (
    <section>
        <div className="container-fluid">
          <div className="container">
              <div className="row">
                  <div  className="col">
                      <div id="credentials">
                          <form>
                          <label>firstname</label>
                            <input type="text" className="form-control" id="firstname" placeholder="eg.kojo"/>
                            <label>lastname</label>
                            <input type="text" className="form-control" id="lastname" placeholder="eg. hamza"/>
                            <label>profession</label>
                            <input type="text" className="form-control" id="profession" placeholder="eg.nursing"/>
                            <label>Are you a staff of labhill diagnostics ?</label><br/>
                            <div class="form-check form-check-inline">
                              <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="yes"/>
                              <label>yes</label>
                          </div>
                          <div class="form-check form-check-inline">
                              <input class="form-check-input" type="checkbox" id="inlineCheckbox1" value="no"/>
                              <label>no</label>
                          </div>
                          <div>
                            <label>identify your position in labhill</label>
                             <input type="text" className="form-control mb-2" placeholder="eg.sonographer" id="identity"/>
                          </div>
                          <div>
                              <button type="button" className="btn btn-success" id="button" >Request</button>
                          </div>
                          </form>
                          <div className="credential-response">
                             
                          </div>
                      </div>
                  </div>
              </div>
           </div>
        </div>
    </section>
  );
}
