import { customFetch } from "../Auth/customFetch";

export const getEmailSummary = async function (setdata, setloading,toast) {
  try {
    if (setloading) setloading(true);
    const response = await customFetch("email/summary");
    const { statusCode, status, result } = response;
    if (statusCode === 200 && status === "success" && result.length > 0) {
      setdata(result[0]);
    }
    if (setloading) setloading(false);
  } catch (err) {
    if (setloading) setloading(false);
    if (toast) toast.error(err.message || "something went wrong");
   }
}