import { useContext } from "react"
import { BillingContext } from "./BillingContext"
import { billingSource } from "./Lib/billingLib";

export default function BillingSourceDeterminer() {
    const { billingdata, updateBilling } = useContext(BillingContext);
console.log(updateBilling)
    return (
        <div>
            <section className="col-5 d-flex p-2 br-5 mb-2">
                <div className="form-group">
                    <label>Billing Source</label>
                    <select onchange={(ev) => { }} autoFocus={true} className="custom-select">
                        <option value=''>select an option below</option>
                        {
                            Array.isArray(billingSource)
                            && billingSource.length > 0
                            && billingSource.map((item) => <option key={item.value}
                                value={item.value}> {item.label}
                            </option>)}
                    </select>
                </div>
                {billingdata?.billingSource === 3 && <div className="form-group mx-2">
                    <label>search organization here</label>
                    <input type='text' placeholder="please for organization here" className="custom-input" />
                </div>}
            </section>
        </div>
    )
}