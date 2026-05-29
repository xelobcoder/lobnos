import Cookies from "js-cookie";
import moment from "moment";
import { toast } from "react-toastify";
import { getRequestContext } from "../serverActions/requestHeaders";

export async function customFile(endpoint, formbody) {
  if (
    process.env.NODE_ENV == "production" &&
    !process.env.NEXT_PUBLIC_ACCESS_TOKEN
  ) {
    throw new Error("NEXT_PUBLIC_ACCESS_TOKEN MISSING");
  }

  const url = new URL(
    `${endpoint}`,
    process.env.NODE_ENV == "production"
      ? process.env.PRODUCTION_BASEURL
      : process.env.DEVELOPMENT_BASEURL,
  );
  url.searchParams.append("tenantId", process.env.TENANTID);

  const context = await getRequestContext();
  if (
    !context ||
    !context["PLS_PRIME_TENANT_SESSION"] ||
    !context["PLS_SESSION"]
  ) {
    return { error: "Session not found" };
  }
  const { PLS_PRIME_TENANT_SESSION, PLS_SESSION } = context;
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
      cache: "no-cache,must-revalidate,no-store,max-age=60,s-maxage=0",
      "pls-prime-tenant-session": PLS_PRIME_TENANT_SESSION,
      "pls-session": PLS_SESSION,
    },
    cache: "no-cache",
    credentials: "include",
    body: formbody,
  });

  const source = await response.json();
  return source;
}

/**
 * Sends an HTTP request to the specified endpoint and returns the response as JSON.
 *
 * @param {string} endpoint - The endpoint URL to send the request to.
 * @returns {Promise<object>} - The response from the server as JSON.
 */
export async function customFetch(endpoint, isLogin = false) {
  try {
    const url = new URL(
      `/api/v1/${endpoint}`,
      process.env.NODE_ENV == "production"
        ? process.env.PRODUCTION_BASEURL
        : process.env.DEVELOPMENT_BASEURL,
    );
    url.searchParams.append("tenantId", process.env.TENANTID);
    const context = await getRequestContext();
    if (
      !isLogin &&
      (!context ||
        !context["PLS_PRIME_TENANT_SESSION"] ||
        !context["PLS_SESSION"])
    ) {
      if (window) {
        alert("SESSION EXPIRED, LOGGING YOU OUT...");
        window.location.href = "/authentication/logout";
      }
      return { error: "Session not found" };
    }

    const { PLS_PRIME_TENANT_SESSION, PLS_SESSION } = context;

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${PLS_SESSION ? PLS_SESSION : ""}`,
        "Content-Type": "application/json",
        cache: "no-cache,must-revalidate,no-store,max-age=60,s-maxage=0",
        "pls-prime-tenant-session": PLS_PRIME_TENANT_SESSION
          ? PLS_PRIME_TENANT_SESSION
          : null,
        "pls-session": PLS_SESSION ? PLS_SESSION : null,
        loginsessionId: context?.loginsessionId ? context.loginsessionId : null,
      },
      cache: "no-cache",
      credentials: "include",
    });

    const source = await response.json();

    // if (typeof source === "object" && source['isExpired'] && source['isExpired'] === true) {
    // 	handleLogout();
    // 	return { error: "Session expired" };
    // }

    const { status, message, statusCode } = source;
    if (
      (status == 401 || statusCode == 401 || statusCode == 500) &&
      (message.toLowerCase() == "Unauthorized".toLowerCase() ||
        message.toLowerCase() == "Token not Provided".toLowerCase() ||
        message.toLowerCase() == "Token Expired".toLowerCase())
    ) {
      handleLogout();
    } else {
      return source;
    }
  } catch (err) {
    throw err;
  }
}

export async function handleLogout(setIsLoggingOut) {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      setTimeout(() => {
        window.location.href = "/authentications/login";
      }, 1000);
    } else {
      console.error("Logout failed");
      setTimeout(() => {
        window.location.href = "/authentications/login";
      }, 1000);
    }
  } catch (error) {
    setTimeout(() => {
      window.location.href = "/authentications/login";
    }, 1000);
  } finally {
    setIsLoggingOut(false);
  }
}

export async function InventoryFetch(endpoint) {
  try {
    let response = await fetch(`${process.env.PSL_INVEN_ROUTE}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        cache: "no-cache,must-revalidate,no-store,max-age=60,s-maxage=0",
      },
      cache: "no-store",
    });
    const source = await response.json();
    const { status, message } = source;
    if (status == 401 && message == "Unauthorized") {
      window.location.href = "/authentication/login";
    } else {
      return source;
    }
  } catch (err) {
    console.log(err);
  }
}

export const generateRandomTextAndNumbers = (length = 10) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const parseDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const validatePin = async (employeeid, pin) => {
  try {
    console.log(pin, typeof pin);
    if (pin && pin.toString().length < 4) {
      return "PIN must be at least 4 digits long";
    }

    if (pin && isNaN(pin)) return "pin must be full numbers";
    const url = `prime/validate-user-pin?employeeid=${employeeid}&&pin=${encodeURIComponent(pin)}`;
    const response = await customFetch(url);
    const { status, message } = response;
    if (status && status == "error") {
      alert(message.toUpperCase || "INVALID PIN");
      return;
    }

    if (status == false || status == "false") {
      alert(message);
    }
    if (!status) return response;
    return response;
  } catch (error) {
    toast.error("An error occurred while validating the PIN");
    return false;
  }
};

export function formatDateOrNA(dateStr) {
  // Check for empty, invalid, or zeroed date strings
  if (
    !dateStr ||
    isNaN(new Date(dateStr).getTime()) ||
    /^0{2,}/.test(dateStr) ||
    /^0{4}-0{2}-0{2}$/.test(dateStr) ||
    dateStr === "0000-00-00"
  ) {
    return "NILL";
  }
  return new Date(dateStr).toLocaleDateString();
}

export async function getResultSettings(setResult, setLoading) {
  customFetch("applicationsetting/resultsettings")
    .then((data) => {
      setResult(data);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
    });
}

export const Glucoseoptions = ["mg/dl", "mmol/L"];

/**
 * Sends a POST request to a specified endpoint with the provided data.
 * Includes necessary headers and authorization token.
 * Parses the response and checks for a specific status and message.
 * If the status is 401 and the message is "Unauthorized", redirects the user to the login page.
 * Otherwise, returns the parsed response.
 *
 * @param {string} endpoint - The endpoint to send the POST request to.
 * @param {string} method - The HTTP method to use for the request (e.g., "POST", "PUT").
 * @param {object} data - The data to send in the request body.
 * @returns {Promise<object>} - The parsed response from the POST request.
 */
export async function customPost(
  endpoint,
  method,
  data,
  hash = false,
  login = false,
) {
  try {
    var requestBody = data;
    const url = new URL(
      `${endpoint}`,
      process.env.NODE_ENV == "production"
        ? process.env.PRODUCTION_BASEURL
        : process.env.DEVELOPMENT_BASEURL,
    );
    url.searchParams.append("tenantId", "3");

    const context = await getRequestContext();
    if (
      !login &&
      (!context ||
        !context["PLS_PRIME_TENANT_SESSION"] ||
        !context["PLS_SESSION"])
    ) {
      return { error: "Session not found" };
    }

    const { PLS_PRIME_TENANT_SESSION, PLS_SESSION } = context;
    let response = await fetch(url.href, {
      method: method,
      headers: {
        "content-type": "application/json",
        Authorization: PLS_SESSION ? `Bearer ${PLS_SESSION} ` : "",
        mode: "no-cors",
        "pls-prime-tenant-session": PLS_PRIME_TENANT_SESSION
          ? PLS_PRIME_TENANT_SESSION
          : "",
        "pls-session": PLS_SESSION ? PLS_SESSION : "",
      },
      cache: "no-cache",
      body: JSON.stringify(requestBody),
      credentials: "include",
    });
    let datasource = await response.json();
    const { status, message } = datasource;

    if (status == 401 && message == "Unauthorized") {
      window.location.href = "/authentication/login";
    } else {
      return datasource;
    }
  } catch (err) {
    console.log(err);
  }
}

export async function CheckResultEntered(testname, billingid) {
  /**
   * Checks if a test result has been entered for a given test name and billing ID.
   *
   * @param {string} testname - The name of the test to check the result for.
   * @param {string} billingid - The billing ID associated with the test.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether a test result has been entered.
   */
  if (!(testname && billingid)) {
    return false;
  } else {
    let response = await customFetch(
      `test/result/check?testname=${testname}&billingid=${billingid}`,
    );
    return response;
  }
}

/**
 * Validates form data before sending it to the server.
 *
 * @param {object} data - The form data to be validated.
 * @param {boolean} allrequired - A flag indicating whether all fields are required or not.
 * @param {array} [requiredFields=[]] - An optional array of field names that are required.
 * @param {string} endpoint - The endpoint to send the form data to.
 * @param {function} callback - A callback function to handle the response from the server.
 * @param {boolean} updateState - update state function , optional
 * @returns {void}
 */
export async function validateFormData(
  data,
  allrequired,
  requiredFields = [],
  endpoint,
  callback,
  updateState,
) {
  const isObject = typeof requiredFields === "object";
  const requiredLen = requiredFields.length;

  async function forwardToServer() {
    let response = await customPost(endpoint, "POST", data);
    callback(response);
    if (updateState) {
      updateState;
    }
  }
  // if all the fields are not required , we pass data to server
  if (!allrequired) {
    if (isObject && requiredLen > 0) {
      // we check to ensure the required fields are not empty
      const passChecked = [];
      // loop through the data
      for (let i = 0; i < requiredLen; i++) {
        for (const [key, value] of Object.entries(data)) {
          if (key === requiredFields[i]) {
            if (value == "" || value == null || value == undefined) {
              passChecked.push(key);
            }
          }
        }
      }
      // if required fields is e,pty pass checked array increase beyond 0
      if (passChecked.length > 0) {
        alert(`${passChecked} is required`);
        // throw new Error(`${passChecked} is required`)
      }

      if (passChecked.length == 0) {
        forwardToServer();
      }
    } else {
      alert("some required fields are empty");
    }
  }

  if (allrequired) {
    const emptyFileds = Object.values(data).filter((item, index) => {
      return new String(item).length == 0;
    }).length;
    // we need all fields filled
    if (emptyFileds === 0) {
      forwardToServer();
    } else {
      alert("All Fields Required");
    }
  }
}

export async function handleComments(e, stateVariable, target, datafunction) {
  /**
   * Updates a state variable with the value of a target element in response to an event.
   *
   * @param {Event} e - The event object that triggered the function.
   * @param {Object} stateVariable - The current state variable that needs to be updated.
   * @param {string} target - The key of the state variable that needs to be updated.
   * @param {Function} datafunction - The function that updates the state variable.
   * @returns {void}
   */
  datafunction({ ...stateVariable, [target]: e.target.value });
}

export const resultCommentHander = async function (
  statecallback,
  target,
  datasource,
  testid,
  billingid,
) {
  /**
   * Retrieves comments from a server and updates the state of a callback function.
   *
   * @param {function} statecallback - The callback function that will be called with the updated state.
   * @param {string} target - The key in the `datasource` object where the comments will be stored.
   * @param {object} datasource - An object that holds the data.
   * @param {string} testid - The ID of the test.
   * @param {string} billingid - The ID of the billing.
   * @returns {void} - This function does not return any value. It updates the state of the `statecallback` function with the merged comments.
   */
  const commentResponse = await customFetch(
    `result/preview/comments?billingid=${billingid}&testid=${testid}`,
  );
  if (Array.isArray(commentResponse) && commentResponse.length > 0) {
    const { comments } = commentResponse[0];
    statecallback({ ...datasource, [target]: comments });
  }
};
/**
 * Handles the response object and displays appropriate messages based on the status property.
 *
 * @param {object} response - The response object containing the status, message, and statusCode properties.
 * @returns {void}
 *
 * @example
 * const response = {
 *   status: "success",
 *   message: "Request successful",
 *   statusCode: 200
 * };
 *
 * handleResponse(response);
 */

export async function handleResponse(response, toast) {
  const { status, message, statusCode } = response;
  if (status == "success") {
    toast ? toast.success(message, { autoClose: 500 }) : alert(message);
  }
  if (status == "error") {
    toast
      ? toast.error(message || "something went wrong", { autoClose: 1000 })
      : alert(message || "An error occured");
  }
}

export const readyToPrint = async function (billingid, testid) {
  try {
    const isApproved = await customPost(
      "test/result/preview/approved/check",
      "POST",
      { billingid, testid },
    );
    const { approved } = isApproved;
    if (approved) {
      window.print();
    } else {
      alert("Test not approved. Printing cannot be done.");
      window.document.body.style.display = "none";
      window.close();
    }
  } catch (error) {
    console.error(error);
    // Handle the error here
  }
};

export const validateMobileNumber = async function (number, len) {
  const nmString = String(number);
  const digitLen = nmString.length;

  const regex = /^(0|\+)[0-9]{9,12}$/;
  if (!regex.test(number)) {
    return "number must be 10 and starts with 0 or 13 and starts with +";
  } else {
    return true;
  }
};

export const handleChange = (event, target, data) => {
  const { value } = event.target;
  setData({ ...data, [target]: value });
};

export const handleChangeWithState = (event, target, setData, data) => {
  const { value } = event.target;
  setData({ ...data, [target]: value });
};

export const handleChangeCheck = (event, target, setData, data) => {
  const { checked } = event.target;
  setData({ ...data, [target]: checked });
};
export const getSampleTypeList = async function (setSource) {
  const getResponse = await customFetch("sampletype");
  const { result } = getResponse;
  Array.isArray(result) && result ? setSource(result) : setSource([]);
};

export const getSampleContainerList = async function (setSource) {
  const result = await customFetch("sample/containers");
  Array.isArray(result) && result ? setSource(result) : setSource([]);
};

/**
 * Retrieves application settings from a server.
 * If the server returns a successful response with settings, it returns the first result.
 * Otherwise, it returns a default set of application settings.
 *
 * @returns {Promise<Object>} The retrieved application settings or the default application settings.
 *
 * @example
 * const settings = await getApplicationSettings();
 * console.log(settings);
 * // Output: The application settings object
 */
export const getApplicationSettings = async function () {
  const getResponse = await customFetch("applicationsettings");
  const { status, result, statusCode } = getResponse;
  if (statusCode == 200 && status == "success") {
    if (result.length > 0) {
      return result[0];
    } else {
      return defaultApplicationSettings;
    }
  }
};

export const handleTestListChange = (ev, index, item) => {
  setPanel((prev) => {
    const mappedFiltered = prev[index];
    mappedFiltered[item] = ev.target.value;
    prev[index] = mappedFiltered;
    return [...prev];
  });
};

export const getDepartment = async (setDepartments) => {
  try {
    const response = await customFetch("departments");
    const { status, data, statusCode } = response;
    if (status == "success" && statusCode === 200) {
      setDepartments(data);
    } else {
      setDepartments([]);
    }
  } catch (err) {
    setDepartments([]);
  }
};

export const getCompanyInformation = async function (setHeaders) {
  try {
    const getdata = await customFetch("settings/companyprofile");
    setHeaders(getdata);
  } catch (err) {
    alert("error in connecting to server");
  }
};

export const defaultSmsSettings = {
  result: "No",
  registration: "Yes",
  sample: "No",
  birthday: "No",
};

export const fetchRequisitionsByIdAndCategory = async function (
  departmentId,
  dataCategory,
  setHxData,
) {
  if (departmentId) {
    try {
      const data = await customFetch(
        `departments/requisitions?id=${departmentId}&&type=${dataCategory}`,
      );
      if (data?.status === "success" && data?.statusCode === 200) {
        setHxData(data?.data);
      }
    } catch (error) {
      setHxData([]);
    }
  }
};

export const defaultApplicationSettings = {
  bulkregistration: 1,
  fontsize: 14,
  textcolor: "black",
  BackgroundColor: "wheat",
  DeactivateBilling24hrs: 0,
  PaidBillsBeforeTransaction: 1,
  completeFlow: 1,
  approvalbeforeprinting: 1,
  smsSettings: defaultSmsSettings,
  emailNotification: 0,
  includeTax: 0,
};

export const deleteOrganization = async function (id, getdatafxn, employeeid) {
  try {
    if (!id) {
      alert(`id required`);
    }
    let confirmation = window.confirm(
      "Do you want to delete organization? This will affect your finances records",
    );
    if (confirmation) {
      const deleteResponse = await customPost(
        `organization?id=${id}&&employeeid=${employeeid}`,
        "DELETE",
        {},
      );
      return deleteResponse;
    }
  } catch (err) {
    console.log(err);
  }
};

export const getDataAndUpdateState = async function (
  setfxn,
  endpoint,
  returner,
  loader = null,
) {
  try {
    if (loader) loader(true);
    const getResponse = await customFetch(endpoint);
    const { statusCode, status, result } = getResponse;
    if (statusCode == 200) {
      if (returner) {
        return result;
      } else {
        setfxn(result);
      }
    }
    if (loader) loader(false);
  } catch (err) {
    if (loader) loader(false);
    alert("something went wrong");
  }
};

/**
 * Navigates to a result page based on the provided parameters.
 *
 * @param {function} navigate - The navigation function.
 * @param {string} billingid - The ID of the billing.
 * @param {object} item - An object containing properties 'testid' and 'name'.
 * @param {boolean} [newTab=false] - Flag indicating whether to open the result page in a new tab.
 *
 * @returns {void}
 */
export const printResultNavigator = async (
  navigate,
  billingid,
  item,
  newTab = false,
) => {
  const { testid, name, patientid, department, ascensionid } = item;
  let nwName = name;
  if (name.split(" ").length > 1) {
    nwName = name.split(" ").join("_");
    if (new String(nwName).includes("(")) {
      nwName = nwName.split("(");
      nwName = nwName[0];
    }
  }

  if (newTab) {
    if (department === "ultrasound") {
      window.open(
        `/registration/result/scan?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}&&ascensionid=${ascensionid}`,
      );
    } else {
      window.open(
        `/registration/result/labReport?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}&&ascensionid=${ascensionid}`,
      );
    }
  } else {
    navigate.push(
      `registration/result?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}&&ascensionid=${ascensionid}`,
    );
  }
};

export const monthCollection = {
  0: "january",
  1: "February",
  2: "March",
  3: "April",
  4: "May",
  5: "June",
  6: "July",
  7: "August",
  8: "September",
  9: "October",
  10: "November",
  11: "December",
};

export const dayCollection = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const emailPreference = {
  registration: "No",
  result: "No",
  approval: "No",
  rejection: "No",
  transactions: "No",
  birthday: "Yes",
  billing: "Yes",
};

export const forwardEmailReceipt = async (billingid) => {
  if (billingid) {
    const mail = await customFetch(
      `billing/email/receipt?billingid=${billingid}`,
    );
  } else alert(`Please select a billingid to forward receipt via email`);
};

export const getInstitutionUsers = async (
  setUser,
  queryendpoint,
  setLoading,
) => {
  try {
    if (setLoading) setLoading(true);
    let endpoint = "logins";
    if (queryendpoint) endpoint = queryendpoint;
    const response = await customFetch(endpoint);
    const { statusCode, status, result } = response;
    if (statusCode === 200 && status === "success") setUser(result);
    if (setLoading) setLoading(false);
  } catch (err) {
    if (setLoading) setLoading(false);
    setUser([]);
  }
};

export const activateInstitutionUser = async (id, previousStatus, setUser) => {
  let currentv;
  if (previousStatus == 0) {
    currentv = 1;
  }

  if (previousStatus == 1) {
    currentv = 0;
  }
  //  show a confimation message before deleting
  const confirm = window.confirm(
    `Are you sure you want to ${currentv === 1 ? "activate" : "deactivate"} this user?`,
  );
  if (confirm) {
    const response = await customPost(`user/authentication/activate`, "PUT", {
      id,
      currentv,
    });
    const { statusCode, message, status, result } = response;
    if (statusCode === 200 && status == "success") {
      alert(message);
      getInstitutionUsers(setUser);
    }
  }
};

export const getDateExpression = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`;

export const getBranches = async function (setBranches, id, loader) {
  try {
    if (loader) loader(true);
    let endpoint = `branches`;
    if (id) {
      endpoint = endpoint + `?branchid=${id}`;
    }
    let response = await customFetch(endpoint);
    const { result, status } = response;
    if (id && result.length > 0) {
      setBranches(result[0]);
    } else {
      setBranches(result);
    }
    if (loader) loader(false);
  } catch (err) {
    if (loader) loader(false);
    alert("something wrong occured");
  }
};

export const newBranchDefault = {
  name: "",
  contact: "",
  email: "",
  address: "",
  managerid: "",
};

export const customData = async (endpoint, setData) => {
  const response = await customFetch(endpoint);
  const { statusCode, status, result } = response;
  if (statusCode == 200 && status == "success") {
    setData(result);
  } else setData(result);
};

export const regions = [
  "Greater Accra",
  "Ashanti",
  "Western",
  "Eastern",
  "Central",
  "Volta",
  "Northern",
  "Upper East",
  "Upper West",
  "Bono",
  "Bono East",
  "Ahafo",
  "Savannah",
  "North East",
  "Oti",
  "Western North",
];

export const defaultSupplierdata = {
  name: "",
  address: "",
  region: "",
  contactperson: "",
  email: "",
  phonenumber: "",
};

const isFalsi = (data) => {
  if (
    data == null ||
    data == undefined ||
    data == "" ||
    typeof data == undefined
  ) {
    return true;
  }

  if (typeof data == "object" && Object.keys(data).length == 0) {
    return true;
  }
};

export const isAuthenticated = async function (
  auth,
  navigate,
  updateAuthentication,
) {
  try {
    console.log("auth", auth);
    if (isFalsi(auth)) {
      const token = Cookies.get("pls-prime-tenant-session");
      console.log("token", token);
      // if (isFalsi(token)) {
      // 	navigate.push("/authentication/login")
      // } else {
      // 	const authentic = await customFetch(`authenticate/employee/token?token=${token}`);
      // 	const { statusCode, status } = authentic
      // 	if (statusCode == 200 && status == "success") {
      // 		const { username, role, email, employeeid, branchid } = authentic?.user
      // 		const permissions = JSON.parse(authentic?.user?.permissions)
      // 		updateAuthentication({
      // 			username,
      // 			role,
      // 			email,
      // 			employeeid,
      // 			permissions,
      // 			branchid,
      // 		})
      // 	} else {
      // 		navigate.push("/authentication/login")
      // 	}
      // }
    }
  } catch (err) {
    console.log(err);
    console.log("error getting token");
  }
};

export const organizationDefaultBasicInfo = {
  email: "",
  name: "",
  location: "",
  street: "",
  mobile: 0,
  address: "",
  website: "",
  gpsmapping: "",
  type: "",
  region: "",
};

export const organizationPaymentDefault = {
  module: "",
  commission: "",
  momo: "",
  bankname: "",
  accountname: "",
  branch: "",
  account: "",
  momoname: "",
};

export const filterTrendData = async (parameters, data) => {
  const trend = parameters.map((item, index) => {
    const filtered = data.filter((u, t) => {
      return u.parameter == item;
    });
    return filtered.length > 0
      ? filtered[0]
      : { upper: null, lower: null, value: "Nil", parameter: "null" };
  });
  return trend;
};
/**
 * Handles the decision for a client.
 *
 * @param {object} client - The client object.
 * @param {string} decision - The decision to be made (e.g., "approve", "reject").
 * @param {function} setClients - A function to update the clients array.
 * @param {array} clients - An array of client objects.
 * @param {string} employeeid - The ID of the employee making the decision.
 * @returns {void}
 */
export const handleDecision = async function (
  client,
  decision,
  setClients,
  clients,
  employeeid,
) {
  try {
    const data =
      decision === "approve"
        ? { ...client, approvedby: employeeid, approvalstatus: 1 }
        : { ...client, approvedby: employeeid };
    const pushData = await customPost("result/approve", "POST", data);
    if (pushData?.status == "success" && decision == "approve") {
      //  remove item ffrom clients
      const getClient = clients.filter((item, index) => {
        return !(
          item.billingid == client?.billingid && client?.testid == item?.testid
        );
      });
      setClients(getClient);
    }
  } catch (err) {
    return {};
  }
};

/**
 * Checks if a test result has been entered for a given billing ID and test name.
 *
 * @param {string} billingid - The billing ID associated with the test.
 * @param {string} test - The name of the test to check the result for.
 * @param {function} loadingFxn - A function to set the loading state.
 * @param {function} setter - A function to set the result state.
 * @param {function} updateentered - A function to update the entered flag state.
 * @returns {void}
 */

export const getSpecificOrder = async (id, setData, setLoading) => {
  const url = `orders/temporary/processing?orderid=${id}`;
  const response = await customFetch(url);
  const { status, statusCode, result } = response;
  if (status == "success" && statusCode == 200) {
    setData(result);
  } else {
    setData({});
  }
  setLoading(false);
};

export const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",
});

/**
 * Updates the pagination of a query based on the given page value.
 *
 * @param {number|string} pageValue - The new page value to be set for the query.
 * @param {function} setQuery - A function to update the query.
 * @param {object} query - The current query object containing `count` and `page` properties.
 * @returns {void}
 */
export const updatePagination = (pageValue, setQuery, query) => {
  const { count, page } = query;

  if (pageValue === "increment" && page >= 0) {
    setQuery({ ...query, page: page + 1 });
  } else if (pageValue === "decrement" && page > 1) {
    setQuery({ ...query, page: page - 1 });
  } else if (typeof pageValue == "number" && pageValue > 0 && pageValue < 6) {
    setQuery({ ...query, page: pageValue });
  } else {
    return;
  }
};

export const formatTest = (name) => {
  let testname = name.replace(/\s/g, "_").toLowerCase();
  if (name.includes("(") && name.includes(")")) {
    testname = name.slice(0, name.indexOf("("));
  }
  if (testname.includes(" ")) {
    return formatTest(testname);
  }
  return testname;
};

export const defaultTestEditValues = {
  id: "",
  name: "",
  category: 0,
  price: 0,
  created_on: "",
  sample: "none",
  description: "",
  post_TatEvaluation: "min",
  pre_TatEvaluation: "min",
  tatEvaluation: "min",
  sample_container: null,
  unit: "",
  hasDrugs: 0,
  qty_required: "",
  shorttext: "",
  useLiterature: "",
  testid: "",
  testcost: "",
  testprice: "",
  hasManual: "",
  procedureCode: "",
  pre_Tat: "",
  tat: "",
  post_Tat: "",
  tatCount: "",
  updatedon: "",
  updatedby: "",
  showtrend: 0,
  isoutsourced: 0,
  iscustom: 0,
  hasGenderVariation: 0,
  hasChildrenLimit: 0,
};

export const getSingleEditTest = (
  testid,
  setTestData,
  setLoading,
  withoutdepartment = true,
) => {
  customFetch(
    `gettestpanel/edit?id=${testid}&&withoutdepartment=${withoutdepartment}`,
  )
    .then((data) => {
      setTestData(data);
      setLoading(false);
    })
    .catch((err) => {
      setLoading(false);
    });
};

export const getDateRange = (range) => {
  if (Array.isArray(range) && range.length == 2) {
    const start = range[0] ? new Date(range[0]) : null;
    const end = range[1] ? new Date(range[1]) : null;

    if (!start && !end) {
      return ["", ""];
    }

    const formattedStartDate = start
      ? `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`
      : "";
    const formattedEndDate = end
      ? `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`
      : "";

    return [formattedStartDate, formattedEndDate];
  }
  return ["", ""];
};

export function PrepareResultEntryHeader(
  data,
  isUltrasound = false,
  branchid,
  isOpenSideBarShow = true,
) {
  if (typeof data !== "object") return;

  const {
    id,
    name,
    billingid,
    patientid,
    ascensionid,
    category = "ungrouped",
  } = data;
  if (!id || !name || !billingid || !patientid) return;

  const csvid = `${generateRandomTextAndNumbers(70)}${billingid}`.trim();
  const ptid = `${csvid.slice(25, 50)}${csvid.slice(0, 25)}${patientid}`.trim();

  const popup = window.open(
    !isUltrasound
      ? `/operations/laboratory/resultentry/${branchid}?csvid=${csvid}&&ptid=${ptid}&&isOpenSideBarShow=${isOpenSideBarShow}`
      : `/operations/imaging/ultrasound/result/${branchid}?csvid=${csvid}&&ptid=${ptid}&&testid=${id}&&ascensionid=${ascensionid}&&isOpenSideBarShow=${isOpenSideBarShow}&&category=${category}`,
  );

  if (popup) popup.focus();
}

export const loadAllTest = async () => {
  try {
    const response = await customFetch("testpanel/list/bulk");
    const test = response?.data;
    return test;
  } catch (err) {
    return null;
  }
};

export const formatPlainOptionsToObject = function (plaindata) {
  const plainDataFormarted = plaindata.split(";");
  const requiredHeaders = ["general", "male", "female", "children"];
  let plainObject = {};

  if (plainDataFormarted.length > 0) {
    for (let i = 0; i < plainDataFormarted.length; i++) {
      const cleaned = plainDataFormarted[i].trim();
      if (cleaned.includes(":") && cleaned.split(":").length > 0) {
        const [header, referenceRange] = cleaned.split(":");
        const cleanedReferenceRange = referenceRange.trim().split("-");
        if (
          cleanedReferenceRange.length !== 0 &&
          requiredHeaders.includes(header.toLowerCase())
        ) {
          let valueOne = cleanedReferenceRange[0];
          let valueTwo = cleanedReferenceRange[1];
          if (!isNaN(valueOne) && !isNaN(valueTwo)) {
            let upperLimit = 0;
            let lowerLimit = 0;
            valueOne = parseFloat(valueOne);
            valueTwo = parseFloat(valueTwo);
            if (valueOne > valueTwo) {
              upperLimit = valueOne;
              lowerLimit = valueTwo;
            } else {
              upperLimit = valueTwo;
              lowerLimit = valueOne;
            }
            plainObject[header.toLowerCase()] = {
              upperLimit,
              lowerLimit,
            };
          }
        }
      }
    }
  }
  return plainObject;
};

export const reactSelectCustomStyles = {
  control: (base, state) => ({
    ...base,
    height: "40px",
    minHeight: "30px",
    fontSize: "13px",
    backgroundColor: "var(--bs-body-bg)",
    borderColor: "var(--bs-border-color)",
    color: "var(--bs-body-color)",
    boxShadow: state.isFocused
      ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
      : "none",
    "&:hover": {
      borderColor: "var(--bs-border-color)",
    },
  }),
  input: (provided) => ({
    ...provided,
    height: "35px",
    fontSize: "13px",
    color: "var(--bs-body-color)",
  }),
  menu: (base) => ({
    ...base,
    maxHeight: "400px",
    fontSize: "12px",
    zIndex: 1060,
    backgroundColor: "var(--bs-body-bg)",
    border: "1px solid var(--bs-border-color)",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "400px",
    backgroundColor: "var(--bs-body-bg)",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--theme-accent)"
      : state.isFocused
        ? "var(--bs-border-color)"
        : "var(--bs-body-bg)",
    color: state.isSelected ? "#fff" : "var(--bs-body-color)",
    cursor: "pointer",
    ":active": {
      backgroundColor: "var(--theme-accent)",
    },
  }),
  valueContainer: (base) => ({
    ...base,
    overflow: "visible",
  }),
  singleValue: (base) => ({
    ...base,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    color: "var(--bs-body-color)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--bs-secondary-color)",
  }),
};

export const calculateTimeUsed = (startTime, endTime) => {
  const start = moment(startTime);
  const end = moment(endTime);
  const h = end.diff(start, "hours");
  const m = end.diff(start, "minutes");
  const d = end.diff(start, "days");
  const s = end.diff(start, "seconds");
  if (d > 0) {
    return `${d} days~ ${h} hours ~ ${m} mins`;
  } else if (h > 0) {
    return `${h} hours ~ ${m} mins`;
  } else if (m > 0) {
    return `${m} mins`;
  } else {
    return `${s} seconds`;
  }
};

export const ResultEntrydefaultData = {
  resultLockAfter24Hours: 0,
  isPinOnResultEntry: 0,
  isPinOnResultViewAfter24Hours: 0,
  maximumResultValidation: 0,
  minimumResultValidation: 0,
  showPastTestResult: 0,
  allowScientistViewAudit: 0,
  showTaTAnalysis: 0,
  encryptResultAfter24Hours: 0,
  sendLoginEmailNotificationAfterResultEdit: 0,
  monitorForCriticalValues: 0,
  notifyClientOnResultReady: 0,
  notificationType: "Email",
};

export const getResultEntrySettings = async (employeeid) => {
  if (!employeeid) return ResultEntrydefaultData;
  try {
    const response = await customFetch(
      `applicationsetting/resultsettings/resultentrysettings?employeeid=${employeeid}`,
    );
    return response?.result;
  } catch (err) {
    return ResultEntrydefaultData;
  }
};

export const smallSelectStyles = {
  ...reactSelectCustomStyles,
  control: (base, state) => ({
    ...base,
    height: "31px",
    minHeight: "31px",
    fontSize: "0.875rem",
    backgroundColor: "var(--bs-body-bg)",
    borderColor: "var(--bs-border-color)",
    color: "var(--bs-body-color)",
    boxShadow: state.isFocused
      ? "0 0 0 0.25rem rgba(13, 110, 253, 0.25)"
      : "none",
    "&:hover": {
      borderColor: "var(--bs-border-color)",
    },
  }),
  input: (provided) => ({
    ...provided,
    height: "29px",
    fontSize: "0.875rem",
    color: "var(--bs-body-color)",
  }),
  valueContainer: (base) => ({
    ...base,
    height: "31px",
    padding: "0 8px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    height: "31px",
  }),
  menu: (base) => ({
    ...base,
    maxHeight: "none",
    fontSize: "0.875rem",
    zIndex: 9999,
    position: "absolute",
    backgroundColor: "var(--bs-body-bg)",
    border: "1px solid var(--bs-border-color)",
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "none",
    overflowY: "visible",
    backgroundColor: "var(--bs-body-bg)",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};

export const fetchPatientPersonalInfo = async (patientid) => {
  try {
    const response = await customFetch(
      `register/personalinformation?patientid=${patientid}`,
    );
    return response;
  } catch (err) {
    throw new Error("Error fetching patient information");
  }
};
