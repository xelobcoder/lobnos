import React, {Component} from 'react';
import "../../css/bootstrap.css";
import "../../css/file.css";


export default class Fileform extends Component {
    constructor(props){
        super(props)
        this.state = {
            id: "",
            file: "",
            tag : "",
            description : "" 
      }  
    }

     customerid = event => {
      this.setState({
          id: event.target.value
      })
    }

    handlerFile = event => {
        this.setState({
            file : event.target.value
        })
    }

    handlerDesc = event => {
        this.setState({
            description: event.target.value
        })
    }

    handlertag = event => {
        this.setState({
            tag: event.target.value
        })
    }
    
    input = event => {
        let inputfield = event.target;
        if(inputfield){
            inputfield.style.border= "1px solid black";  
            inputfield.style.color ="gray"; 
        }
        let next_Element = inputfield.nextElementSibling;
        let callback = (element) => {
             element.style.display ="none";
        }
        if(next_Element.hasAttribute("class")){
            return next_Element.getAttribute("class") === "input-error" ? callback(next_Element) : null;
        }
        
    }

    blur = event => {
        if(event.target.value === ""){
            event.target.style.border = "1px solid red";
            let next_Element = event.target.nextElementSibling;
            const callback = (element) => {
                element.style.display = "block";
            }
            if(next_Element){
                if(next_Element.hasAttribute("class")){
                   return next_Element.getAttribute("class") === "input-error" ? callback(next_Element): undefined;   
                }
            }

            callback(next_Element);
     }
    }

    submit = events =>{
        events.preventDefault();
        const tags = document.querySelector("#tag");
        const clientid = document.querySelector("#clientid");
        const file = document.getElementById("image");
        const description = document.getElementById("description");
        if(clientid.value === 0 || file.value === ""){
           const fields = [file,clientid]
           let value =  fields.filter( (item) => {
                return item.value === "";
           })  
           if(value){
               for(let i = 0; i < value.length; i++){
                   value[i].style.border = "1px solid red";
                   value[i].setAttribute("placeholder","required");
                   value[i].style.color = "red";
               }
           }
        }else{
            console.log("ready to move")
        }
    }

    
  render(){
      return(
        <div id="form-wrapper">
            <form className="fileupload-form" id="fileupload-form" encType="multiparte/formData">
                <label htmlFor="clientid" className="form-label">customer Id</label>
                <input type="number" id="clientid"  className="form-control" onInput={this.input} onBlur={this.blur} value={this.state.id} onChange={this.customerid}  required/>
                <div className="input-error">input field above must be filled</div>
                <label htmlFor="image">image</label>
                <input type="file" id="image" onInput={this.input} className="form-control" value={this.state.file} onChange={this.handlerFile} required
                  multiple/>
                <div className="input-error">input field above required</div>
                <label htmlFor="filetag">tag</label>
                <input type="text" id="filetag"   className="form-control" onInput={this.input} onBlur={this.blur} value={this.state.tag} onChange={this.handlertag}  />
                <div className="input-error">input field above must be filled</div>
                <label htmlFor="description">description</label>
                <textarea  id="description"  className="form-control"   value={this.state.description} onChange = {this.handlerDesc} />
                <button type="submit"  className="btn btn-primary mt-3" id="uploadbtn" onClick={this.submit}>upload</button>
            </form>
    </div>
    )
  }
}

const multipleUpload = function(props){
    return(
        <div>
            <ol>
                <li>file 1 uploaded</li>
            </ol>
        </div>
    )
}

const uploadMessage = function(prop){
    return(
        <div>
            <div className="alert alert-primary" id="uploadMessage">
                
            </div>
        </div>
    )
}

