import { customFetch } from "../../../components/Auth/customFetch";
import FrontDeskLayout from "../../../components/Layout/FrontDeskLayout";


export default function PatientBillingClassic(props) {
    return <FrontDeskLayout>
        <h1>Billing Page Classic Version</h1>
    </FrontDeskLayout>
}



export async function getServerSideProps(context) {
    const { query } = context;
    if (query.patientid) {
        const clientdata = await customFetch(`register/personalinformation?patientid=${query.patientid}`);
        return {
            props: {
                clientdata: clientdata.result
            }
        }
    }
}