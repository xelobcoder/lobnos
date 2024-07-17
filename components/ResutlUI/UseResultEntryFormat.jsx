import { useEffect, useState } from "react";
import { customFetch } from "../Auth/customFetch";
import Loader from "../accessories/Loader";

export default function UseResultEntryScientist({ testid, billingid }) {
  const [isloading, setLoading] = useState(true);
  const [data, setData] = useState({ resultentry: "", validatedBy: "" });

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true);
      customFetch(`result/preview/entry/scientist?billingid=${billingid}&&testid=${testid}`)
        .then((data) => setData(data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
  }, [billingid, testid]);

  const rendering = () => {
    if (isloading) return <Loader />;
    else {
      const { resultentry, validatedBy } = data;
      if (typeof resultentry == "undefined" || typeof validatedBy == "undefined") return;
      return (
        <div className="grid grid-50 ui">
          {data.resultentry && (
            <span className="text-uppercase">
              <span className="fw-bold">{data?.validatedBy ? "VALIDATED BY" : "ENTERED BY"}</span>
              {data?.resultentry}
            </span>
          )}
          {data.validatedBy && (
            <span className="text-uppercase">
              <span className="fw-bold">Validated By</span>: {data?.validatedBy}
            </span>
          )}
        </div>
      );
    }
  };
  return <div>{rendering()}</div>;
}
