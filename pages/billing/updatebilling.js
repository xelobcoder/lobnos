import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import UpdatePersonal from "../../components/Billing/updatePersonal";
import TestProfileBilling from "../../components/Billing/testprofile";
import SamplingInformation from "../../components/Billing/samplingInformation";
import { customFetch } from "../../components/Auth/customFetch";
import FrontDeskLayout from "../../components/Layout/FrontDeskLayout";
export default function Updatebilling() {
  const [clientDetails, setClientDetails] = useState([]);
  const [updateViewer, setUpdateViewer] = useState(true);

  // pick infromation from the database
  const billid = useSearchParams().get('billingid');

  useEffect(() => {
    if (billid) {
      try {
        async function getData() {
          const { result, statusCode } = await customFetch(`billing?billingid=${billid}`)
          statusCode === 200 && setClientDetails(result)
        }
        getData()
      } catch (error) {
        console.error(error);
      }
    }
  }, [billid]);


  const updateTestButton = () => { setUpdateViewer(true);};
  return (
    <FrontDeskLayout>
      <div className="update-billing-wrapper">
      <div >
          {clientDetails.length === 0
            ? <h1>No Data available</h1> :
            (
              <>
                <UpdatePersonal clientDetails={clientDetails[0]} />
                <SamplingInformation id={billid} source={clientDetails} />
                {updateViewer && (<TestProfileBilling clientDetails={clientDetails[0]} />)}
              </>
            )}
      </div>
    </div>
    </FrontDeskLayout>
  );
}
