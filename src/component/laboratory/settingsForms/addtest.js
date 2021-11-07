import React,{Component} from 'react';

export default class Addtest extends Component {
    constructor(props){
       super(props)
       this.state = {
           name:"",
           category:'',
           description:"",
           price:"0",
           limitation:""
       }
    }

    modal = function(){
       return (
            <div>
                <label>category</label>
                <input type="text" className="form-control" id="newCategory"/>
                <label>subcategory</label>
                <input type="text" className="form-control" id="subCategory"/>
                <button type="button" className="btn btn-outline-success" id="save">save</button>
                <button type="button" className="btn btn-outline-cancel">close</button>
            </div>
    )
    }
    render() {
        return (
            <div className="col-4">
                <label>name </label>
                <input type="text" className="form-control" id="name"  />
                <div>
                    <div>
                        <label>category</label>
                        <input type="text" className="form-control" list="category"/>
                        <datalist  id="category"> 
                            <option>laboratory</option>
                            <option>full blood count</option>
                        </datalist>
                    </div>
                    <div style={{"color":"black","position":"relative" ,"top":"20px","font-size":"30px","cursor":"pointer","display":"flex","justifyContent":"center","alignItems":"center",}}>
                        +
                    </div>
                </div>
                <label>description</label>
                <textarea type="text" className="form-control" id="description"></textarea>
                <label>price</label>
                <input type="number" className="form-control" id="price"/>
                <label>limitation (institutional)</label>
                <input type="text" className="form-control" id="limitation" />
                <button className="btn btn-outline-primary mt-3" id="save">save</button>
            </div>
        )
    }
}
