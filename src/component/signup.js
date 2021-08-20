import React, {Component} from 'react';

export default class Signup extends Component{
    constructor(props){
        super(props)
        this.state ={}
    }
    render(){
        return(
            <div>
                <label>username</label>
                <input type="text" className="form-control" value="" required id="username"/>
                <label>password</label>
                <input type="password" className="form-control" value="" required id="password"/>
                <button type="button" className="btn btn-outline-primary">login</button>
            </div>
        )
    }
}