import React from 'react';
import "../css/login.css";

export default function Login() {
  return (
     <React.Fragment> 
        <div className="container-fluid">
            <section id="login-wrapper">
                <form method="post" className="form" id="login-form">
                    <div className="alert mt-3 text-small"></div>
                    <label>Username or email</label>
                    <input type="text" className="form-control" id="username" autocomplete="off"/>
                    <label>Password</label>
                    <input type="password" className="form-control" id="password" autocomplete="off"/>
                    <div className="d-flex justify-content-between mt-3">
                    <button type="button" className="btn btn-outline-primary text-capitalize">login</button>
                    </div>
                </form>
            </section>

        </div>
     </React.Fragment>
  )
         
}
