import React from 'react';


const Random = () => {
    return (
        <section>
            <form>
                    <tr>
                        <td>
                            Random blood sugar
                        </td>
                        <td>
                            <input type="text" className="form-control" id="random-unit"/>
                        </td>
                        <td>
                             <input type="number" className="form-control" id="random-lower"/>
                        </td>
                        <td>
                             <input type="number" className="form-control" id="random-upper"/>
                        </td>
                        <td>
                            <button type="button" className="btn btn-success" id="save-random">save</button>
                        </td>
                    </tr>
            </form>
        </section>
    )
}


const Fasting = () => {
    return(
        <section>
        <form>
            <tr>
                <td>
                    Fasting Blood Sugar
                </td>
                <td>
                     <input type="text" className="form-control" id="fasting-unit"/>
                </td>
                <td>
                    <input type="number " className="form-control" id ="fasting-lower" />
                </td>
                <td>
                    <input  type="number" className="form-control" id="fasting-upper"/>
                </td>
                <td>
                    <button type="button" className="btn btn-success" id="save-fast">save</button>
                </td>
            </tr>
        </form>
    </section>
    )
}

const  GlycatedHeamoglobin = () => {
    return(
        <section>
            <form>
                <tr>
                    <td>Glycated Heamoglobin Test</td>
                    <input type="unit" className="form-control" id="glycated-unit"/>
                    <td>
                        <input type="number" className="form-control " id="glycated-lower" />
                    </td>
                    <td>
                        <input type="number" className="form-control" id="glycated-upper"/>
                    </td>
                </tr>
                {/* eAG */}
                <tr>
                    <td>eAG</td>
                    <td>
                         <input type="text" className="form-control" id="eAG" />
                    </td>
                    <td>
                        
                    </td>
                    <td>
                        <input type="number" className="form-control" id="limit"/>
                    </td>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>
                        <button type="button" className="btn btn-success" id="save-glycated">save</button>
                    </td>
                </tr>
            </form>
        </section>
    )
}



export default function Bloodglucose() {
    return (
        <div>
              <Random/>
              <Fasting />
              <GlycatedHeamoglobin/>
        </div>
    )
}
