import React from 'react'

export default function Lipid() {
    return (
        <div>
            <section>
                <form>
                    <table className="table">
                        <thead>
                            <th>#</th>
                            <th>parameter</th>
                            <th>unit</th>
                            <th>lower limit</th>
                            <th>upper limit</th>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#</td>
                                <td>total cholesterol</td>
                                <td>
                                    <input type="text" className="form-control" id="unit"/>
                                </td>
                                <td>
                                    <input type="number" className="form-control " id="lowerlimit"/>
                                </td>
                                <td>
                                <input type="number" className="form-control " id="upperlimit"/>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>tryglycerides</td>
                                <td>
                                     <input type="text" 
                                     className="form-control"
                                     id="unit"/>
                                </td>
                                <td>
                                     <input type="number"
                                      className="form-control" id="lowerlimit"/>
                                </td>
                                <td>
                                     <input type="number" className="form-control" 
                                     id="upperlimit"/>
                                </td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>ldl-cholesterol</td>
                                <td>
                                     <input type="text" 
                                     className="form-control"
                                     id="unit"/>
                                </td>
                                <td>
                                     <input type="number"
                                      className="form-control" id="lowerlimit"/>
                                </td>
                                <td>
                                     <input type="number" className="form-control" 
                                     id="upperlimit"/>
                                </td>
                            </tr>
                            <tr>
                                <td>4</td>
                                <td>hdl-cholesterol</td>
                                <td>
                                     <input type="text" 
                                     className="form-control"
                                     id="unit"/>
                                </td>
                                <td>
                                     <input type="number"
                                      className="form-control" id="lowerlimit"/>
                                </td>
                                <td>
                                     <input type="number" className="form-control" 
                                     id="upperlimit"/>
                                </td>
                            </tr>
                            <tr>
                                <td>5</td>
                                <td>Non hdl cholesterol</td>
                                <td>
                                     <input type="text" 
                                     className="form-control"
                                     id="unit"/>
                                </td>
                                <td>
                                     <input type="number"
                                      className="form-control" id="lowerlimit"/>
                                </td>
                                <td>
                                     <input type="number" className="form-control" 
                                     id="upperlimit"/>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>t cholesterol/hdl ratio</td>
                                <td>
                                  
                                </td>
                                <td>
                                     
                                </td>
                                <td>
                                      <input type="number"
                                        className="form-control" 
                                        id="limit"/>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </form>
            </section>
        </div>
    )
}
