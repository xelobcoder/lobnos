import React from 'react';
import "../../css/file.css";

export default function Navbar() {
  return (
    <div className="container-fluid p-3 bg-dark">
         <div className="row">
         <div className="header-section col-3" id="headName">
                        imagery
         </div>
         <div className="col-6">
              <input className="form-control" type="search"  placeholder="search tag, customer id"/>
          </div>
          <div className="col-3" id="header-list">
            <ul>
                <li>upload</li>
                <li>images</li>
                <li>profile image</li>
            </ul>
           </div>
         </div>
    </div>
  );
}
