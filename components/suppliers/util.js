import { customPost } from "../Auth/customFetch";
const checkEmtyFields = (data) => {
  let empty = false;
  for (let key in data) {
    if (data[key] ==  "" || data[key] == " ") {
      empty = true;
      break;
    }
  }
  return empty;
}
export const pushNewSupplierInformation = async (method, data, toast,supplierid) => {
  try {
    if (typeof data != 'object' || !method) return false;
    
    if (checkEmtyFields(data)) {
      toast.error("Fill all fields", { autoclose: 3000 });
      return;
    }
    if (data?.phonenumber.toString().length != 10) {
      toast.warning("Phone number must be 10 in length", { autoclose: 500 });
      return;
    }

    const enpoint = method == 'POST' ? `suppliers` : `suppliers?supplierid=${supplierid}`;
    const response = await customPost(enpoint, method, data);
    const { statusCode, status, message } = response;
    if (statusCode === 200 && status === 'success') {
      toast.success(message, { autoclose: 500 });
      return true;
    } else {
      toast.error(message, { autoclose: 5000, position: 'top-center' });
    }
  } catch (err) {
    toast.error("something wrong occured", {autoclose: 3000})
  }
}



