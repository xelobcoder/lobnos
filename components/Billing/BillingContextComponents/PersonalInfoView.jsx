import { useEffect, useState } from "react";
import { customFetch } from "../../Auth/customFetch";
import { useSearchParams } from "next/navigation";
import { Row, Col } from "react-bootstrap";

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
      <Row>
        <Col>
          <h5 className="my-3 mx-2 text-capitalize">
            {data?.firstname} {data?.lastname}
          </h5>
        </Col>
      </Row>
      <hr />
      <Row>
        <Col className="patient-info">
          <div className="mx-2 mb-3">
            <label className="text-muted">Patient ID:</label>
            <p className="text-capitalize">{data?.patientid}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Email:</label>
            <p className="text-capitalize">{data?.email}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Mobile Number:</label>
            <p className="text-capitalize">{data?.mobile_number}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">DOB:</label>
            <p className="text-capitalize">{new Date(data?.dob).toLocaleDateString()}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Gender:</label>
            <p className="text-capitalize">{data?.gender}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Organization:</label>
            <p className="text-capitalize">{data?.organization}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Status:</label>
            <p className="text-capitalize">{data?.activation_status ? "Active" : "Inactive"}</p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">Age:</label>
            <p className="text-capitalize">
              {data?.age} {data?.ageType}
            </p>
          </div>
          <div className="mx-2 mb-3">
            <label className="text-muted">WhatsApp:</label>
            <p className="text-capitalize">{data?.whatsapp}</p>
          </div>
        </Col>
      </Row>
    </section>
  );
}
