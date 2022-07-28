
const Mobilemoney = function() {
    return(
       <>
        <div className="form-row grid-slide">
            <label>Mobile number</label>
            <input type='tel' minLength='10' className="form-control" maxLength='10'></input>
        </div>
        <div className="form-row grid-slide">
            <label>Receiver Name</label>
            <input type='text' className="form-control"></input>
        </div>
       </>
    )
}

const BankDetails = function() {
    return(
        <>
            <div className="form-row grid-slide">
                <label>Bank name</label>
                <input type='text' className="form-control"></input>
            </div>
            <div className="form-row grid-slide">
                <label>Account number</label>
                <input type='number' className="form-control"></input>
            </div>
            <div className="form-row grid-slide">
                <label>Account name</label>
                <input type='text' className="form-control"></input>
            </div>
            <div className="form-row grid-slide">
                <label>Branch name</label>
                <input type='text' className="form-control"></input>
            </div>
        </>
    )
}

const Opanel = function(name,html) {
    return (
        <div className="--lobnos-card --w-xxl-p ">
            <div className="--lobnos-header">
               {name}
            </div>
            <div className="--lobnos-body">
              {
                html()
              }
            </div>
        </div>
    )
}

const Opay = function() {
    return(
        <div className="opay">
            <div className="form-row grid-slide">
                <label>payment module</label>
                <select className="form-control">
                    <option value="mobile money">mobile money</option>
                    <option value ="bank transfer">bank transfer</option>
                    <option value="cash">cash</option>
                </select>
            </div>
            <Mobilemoney/>
            <div className="form-row grid-slide">
                <label>frequency</label>
                <select className="form-control">
                     <option value='weekly'>weekly</option>
                     <option value='monthly'>monthly</option>
                     <option value='annually'>annually</option>
                </select>
            </div>
            <BankDetails/>
        </div>
    )
}

