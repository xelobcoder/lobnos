import { useState, useEffect } from "react";
import Loader from "../../accessories/Loader";
import { customFetch } from "../../Auth/customFetch";

interface UseResultEntryScientistProps {
  testid: string;
  billingid: string;
}

interface ResultEntryData {
  resultentry?: string;
  validatedBy?: string;
}

export default function UseResultEntryScientist({ testid, billingid }: UseResultEntryScientistProps) {
  const [isloading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ResultEntryData>({ resultentry: "", validatedBy: "" });

  useEffect(() => {
    if (billingid && testid) {
      setLoading(true);
      customFetch(`result/preview/entry/scientist?billingid=${billingid}&&testid=${testid}`)
        .then((data: ResultEntryData) => setData(data))
        .catch((err) => console.log(err))
        .finally(() => setLoading(false));
    }
  }, [billingid, testid]);

  const rendering = () => {
    if (isloading) return <Loader />;
    else {
      const { resultentry, validatedBy } = data;
      if (typeof resultentry == "undefined" || typeof validatedBy == "undefined") return null;
      return (
        <div className="grid grid-50 ui">
          {data.resultentry && (
            <span className="text-uppercase">
              <span className="fw-bold">{data?.validatedBy ? "VALIDATED BY: " : "VALIDATED BY: "}</span>
              {data?.resultentry}
            </span>
          )}
        </div>
      );
    }
  };
  return <div>{rendering()}</div>;
}