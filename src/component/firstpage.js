import React from 'react';
import Header from './header';
import Login from './login';
import Credentials from './credentials';
import Password from './password';
import {BrowserRouter,Route,Switch} from 'react-router-dom'

export default function Firstpage() {
    return (
        <div>
           <BrowserRouter>
            <Header/> 
              <Switch>
                <Route exact path="/login" component={Login}/>
                <Route exact path="/password" component={Password}/>
                <Route exact path="/credentials" component={Credentials}/>
              </Switch>
              <div className="container">
                  <div className="introduction-wrapper">
                    <h1>welcome to lobnos laboratory information system</h1>   
                  </div> 
              </div>
           </BrowserRouter>
        </div>
    )
}
