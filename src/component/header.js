import React from 'react';
import {Link,Router} from "react-router-dom";
import "../css/login.css";

export default function Header() {
    return (
        <div>
          <div className="container-fluid p-3 bg-success">
            <div className="container">
                <div className="row">
                    <div className="col">
                         <div className="text-lead text-white text-uppercase" style={{"fontWeight":600, fontSize:"20px"}}>
                            lobnos 
                         </div>
                    </div>
                    <div className="col">
                            <ul id="header-list">
                                <Link id="child" to="/login">Login</Link>
                                <Link id="child" exact to="/password">? forgot password</Link>
                                <Link id="child" to="/credentials">get credentials</Link>
                            </ul>
                    </div>
                </div>
            </div>
           </div>
        </div>
    )
}
