import { customFetch } from "../../components/Auth/customFetch";
export default async function PatientBillingPage(context) {

    const clientdata = await customFetch(`register/personalinformation?patientid=202462529`);
    console.log(context)
    return <div >
        <div className="border border-secondary border-3 p-3 my-2 mx-2" >
            <h3 className="text-capitalize"> {" "}
                {clientdata.result.firstname}
                {" "}
                {clientdata.result.middlename}
                {" "}
                {clientdata.result.lastname}</h3>
        </div>
        <div className="bg-secondary-subtle mx-2 my-2 p-2 ">
            <form >
                <div>
                    <input type="checkbox" name="standard">
                    </input> General Pricing
                </div>
                <div>
                    <input type="checkbox" name="organizational" /> Organizational Pricing
                </div>
                <input type="checkbox" />
                <input className="form-control mb-2" type="text" placeholder="name" name="username" />
                <button className="btn btn-primary" type="submit">save information</button>
            </form>
        </div>
    </div>
}