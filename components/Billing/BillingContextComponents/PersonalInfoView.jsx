import { useEffect, useState } from "react";
import { customFetch } from "../../Auth/customFetch";
import { useSearchParams } from "next/navigation";

export default function BillingPagePatientInformation() {
  const patientid = useSearchParams().get("patientid");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (patientid) {
      setLoading(true);
      customFetch(`register/personalinformation?patientid=${patientid}`)
        .then((data) => {
          setData(data?.result);
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          setData({});
        });
    }
  }, [patientid]);

  if (loading) return <h5>Loading ...</h5>;

  return (
    <section>
      <div className="mx-2 mb-3 bg-body-secondary">
        <div className="text-capitalize p-2">
          <div className="d-flex justify-content-between">
            <span>
              FullName:{data?.firstname} {data?.middlename} {data.lastname}</span>
            <span>PatientId:{data?.patientid} </span>
          </div>
          <div className="d-flex justify-content-between">
            <span>Email:{data?.email}</span>
            <span>Age:{data?.age} {data?.ageType}</span>
          </div>
          <div className="d-flex justify-content-between">
            <span>
              Gender: {data?.gender}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
