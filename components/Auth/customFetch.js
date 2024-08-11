import Cookies from "js-cookie"

/**
 * Sends an HTTP request to the specified endpoint and returns the response as JSON.
 *
 * @param {string} endpoint - The endpoint URL to send the request to.
 * @returns {Promise<object>} - The response from the server as JSON.
 */
export async function customFetch(endpoint) {
  try {
    let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "cache": "no-cache,must-revalidate,no-store,max-age=60,s-maxage=0"
      },
    })
    const source = await response.json()
    const { status, message } = source
    if (status == 401 && message == "Unauthorized") {
      window.location.href = "/authentication/login"
    } else {
      return source
    }
  } catch (err) {
    console.log(err)
  }
}

export const generateRandomTextAndNumbers = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


export const parseDate = (date) => {
  return new Date(date).toLocaleDateString();
}



export const defaultResultSettings = {
  literatureReview: 1,
  letterHeading: 1,
  passwordonResult: 1,
  DepartmentEntry: 1,
  samplingInformation: 1,
}

export async function getResultSettings(setResult, setLoading) {
  customFetch("applicationsetting/resultsettings")
    .then((data) => {
      setResult(data)
      setLoading(false)
    })
    .catch((err) => {
      setLoading(false)
    })
}

export const Glucoseoptions = ["mg/dl", "mmol/L"]

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
export async function customPost(endpoint, method, data, hash = false) {
  if (process.env.NODE_ENV == "production" && !process.env.NEXT_PUBLIC_ACCESS_TOKEN) {
    throw new Error("NEXT_PUBLIC_ACCESS_TOKEN MISSING")
  }
  var requestBody = data
  if (hash && hash === true) {
    if (process.env.HASH_KEY != undefined) {
      requestBody = {}
    } else {
      throw new Error("HASH_KEY not set in NODE_ENV")
    }
  }
  let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
    method: method,
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
      mode: "no-cors",
    },
    body: JSON.stringify(requestBody),
  })
  let datasource = await response.json()
  const { status, message } = datasource

  if (status == 401 && message == "Unauthorized") {
    window.location.href = "/authentication/login"
  } else {
    return datasource
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
    return false
  } else {
    let response = await customFetch(`test/result/check?testname=${testname}&billingid=${billingid}`)
    return response
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
export async function validateFormData(data, allrequired, requiredFields = [], endpoint, callback, updateState) {
  const isObject = typeof requiredFields === "object"
  const requiredLen = requiredFields.length

  async function forwardToServer() {
    let response = await customPost(endpoint, "POST", data)
    callback(response)
    if (updateState) {
      updateState
    }
  }
  // if all the fields are not required , we pass data to server
  if (!allrequired) {
    if (isObject && requiredLen > 0) {
      // we check to ensure the required fields are not empty
      const passChecked = []
      // loop through the data
      for (let i = 0; i < requiredLen; i++) {
        for (const [key, value] of Object.entries(data)) {
          if (key === requiredFields[i]) {
            if (value == "" || value == null || value == undefined) {
              passChecked.push(key)
            }
          }
        }
      }
      // if required fields is e,pty pass checked array increase beyond 0
      if (passChecked.length > 0) {
        alert(`${passChecked} is required`)
        // throw new Error(`${passChecked} is required`)
      }

      if (passChecked.length == 0) {
        forwardToServer()
      }
    } else {
      alert("some required fields are empty")
    }
  }

  if (allrequired) {
    const emptyFileds = Object.values(data).filter((item, index) => {
      return new String(item).length == 0
    }).length
    // we need all fields filled
    if (emptyFileds === 0) {
      forwardToServer()
    } else {
      alert("All Fields Required")
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
  datafunction({ ...stateVariable, [target]: e.target.value })
}

export const resultCommentHander = async function (statecallback, target, datasource, testid, billingid) {
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
  const commentResponse = await customFetch(`result/preview/comments?billingid=${billingid}&testid=${testid}`)
  if (Array.isArray(commentResponse) && commentResponse.length > 0) {
    const { comments } = commentResponse[0]
    statecallback({ ...datasource, [target]: comments })
  }
}
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
  const { status, message, statusCode } = response
  if (status == "success") {
    toast ? toast.success(message, { autoClose: 500 }) : alert(message)
  }
  if (status == "error") {
    toast ? toast.error(message || "something went wrong", { autoClose: 1000 }) : alert(message || "An error occured")
  }
}

export const readyToPrint = async function (billingid, testid) {
  try {
    const isApproved = await customPost("test/result/preview/approved/check", "POST", { billingid, testid })
    const { approved } = isApproved
    if (approved) {
      window.print()
      console.log(window)
    } else {
      alert("Test not approved. Printing cannot be done.")
      window.document.body.style.display = "none"
      window.close()
    }
  } catch (error) {
    console.error(error)
    // Handle the error here
  }
}

export const validateMobileNumber = async function (number, len) {
  const nmString = String(number)
  const digitLen = nmString.length

  const regex = /^(0|\+)[0-9]{9,12}$/
  if (!regex.test(number)) {
    return "number must be 10 and starts with 0 or 13 and starts with +"
  } else {
    return true
  }
}

export const handleChange = (event, target, data) => {
  const { value } = event.target
  setData({ ...data, [target]: value })
}

export const handleChangeWithState = (event, target, setData, data) => {
  const { value } = event.target
  setData({ ...data, [target]: value })
}

export const handleChangeCheck = (event, target, setData, data) => {
  const { checked } = event.target
  setData({ ...data, [target]: checked })
}
export const getSampleTypeList = async function (setSource) {
  const getResponse = await customFetch("sampletype")
  const { result } = getResponse
  Array.isArray(result) && result ? setSource(result) : setSource([])
}

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
  const getResponse = await customFetch("applicationsettings")
  const { status, result, statusCode } = getResponse
  if (statusCode == 200 && status == "success") {
    if (result.length > 0) {
      return result[0]
    } else {
      return defaultApplicationSettings
    }
  }
}

export const handleTestListChange = (ev, index, item) => {
  setPanel((prev) => {
    const mappedFiltered = prev[index]
    mappedFiltered[item] = ev.target.value
    prev[index] = mappedFiltered
    return [...prev]
  })
}

export const getDepartment = async (setDepartments) => {
  try {
    const response = await customFetch("departments")
    const { status, data, statusCode } = response
    if (status == "success" && statusCode === 200) {
      setDepartments(data)
    } else {
      setDepartments([])
    }
  } catch (err) {
    setDepartments([])
  }
}

export const getCompanyInformation = async function (setHeaders) {
  try {
    const getdata = await customFetch("settings/companyprofile")
    setHeaders(getdata)
  } catch (err) {
    alert("error in connecting to server")
  }
}

export const defaultSmsSettings = {
  result: "No",
  registration: "Yes",
  sample: "No",
  birthday: "No",
}

export const fetchRequisitionsByIdAndCategory = async function (departmentId, dataCategory, setHxData) {
  if (departmentId) {
    try {
      const data = await customFetch(`departments/requisitions?id=${departmentId}&&type=${dataCategory}`)
      if (data?.status === "success" && data?.statusCode === 200) {
        setHxData(data?.data)
      }
    } catch (error) {
      setHxData([])
    }
  }
}

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
}

export const deleteOrganization = async function (id, getdatafxn) {
  try {
    if (!id) {
      alert(`id required`)
    }
    let confirmation = window.confirm("Do you want to delete organization? This will affect your finances records")
    if (confirmation) {
      const deleteResponse = await customPost(`organization?id=${id}`, "DELETE", {})
      const { statusCode } = deleteResponse
      if (statusCode == 201) {
        getdatafxn()
      }
    }
  } catch (err) {
    console.log(err)
  }
}

export const getDataAndUpdateState = async function (setfxn, endpoint, returner, loader = null) {
  try {
    if (loader) loader(true)
    const getResponse = await customFetch(endpoint)
    const { statusCode, status, result } = getResponse
    if (statusCode == 200) {
      if (returner) {
        return result
      } else {
        setfxn(result)
      }
    }
    if (loader) loader(false)
  } catch (err) {
    if (loader) loader(false)
    alert("something went wrong")
  }
}

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
export const printResultNavigator = async (navigate, billingid, item, newTab = false) => {
  const { testid, name, patientid, department } = item
  let nwName = name
  if (name.split(" ").length > 1) {
    nwName = name.split(" ").join("_")
    if (new String(nwName).includes("(")) {
      nwName = nwName.split("(")
      nwName = nwName[0]
    }
  }

  if (newTab) {
    if (department === "ultrasound") {
      window.open(
        `/registration/result/scan?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}`
      )
    } else {
      window.open(
        `/registration/result/labReport?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}`
      )
    }
  } else {
    navigate.push(`registration/result?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}&&patientid=${patientid}`)
  }
}

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
}

export const dayCollection = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}

export const emailPreference = {
  registration: "No",
  result: "No",
  approval: "No",
  rejection: "No",
  transactions: "No",
  birthday: "Yes",
  billing: "Yes",
}

export const forwardEmailReceipt = async (billingid) => {
  if (billingid) {
    const mail = await customFetch(`billing/email/receipt?billingid=${billingid}`)
  } else alert(`Please select a billingid to forward receipt via email`)
}

export const getInstitutionUsers = async (setUser, queryendpoint, setLoading) => {
  try {
    if (setLoading) setLoading(true)
    let endpoint = "logins"
    if (queryendpoint) endpoint = queryendpoint
    const response = await customFetch(endpoint)
    const { statusCode, status, result } = response
    if (statusCode === 200 && status === "success") setUser(result)
    if (setLoading) setLoading(false)
  } catch (err) {
    if (setLoading) setLoading(false)
    setUser([])
  }
}

export const activateInstitutionUser = async (id, previousStatus, setUser) => {
  let currentv
  if (previousStatus == 0) {
    currentv = 1
  }

  if (previousStatus == 1) {
    currentv = 0
  }
  //  show a confimation message before deleting
  const confirm = window.confirm(`Are you sure you want to ${currentv === 1 ? "activate" : "deactivate"} this user?`)
  if (confirm) {
    const response = await customPost(`user/authentication/activate`, "PUT", {
      id,
      currentv,
    })
    const { statusCode, message, status, result } = response
    if (statusCode === 200 && status == "success") {
      alert(message)
      getInstitutionUsers(setUser)
    }
  }
}

export const getDateExpression = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`

export const getBranches = async function (setBranches, id, loader = null) {
  try {
    if (loader) loader(true)
    let endpoint = `branches`
    if (id) {
      endpoint = endpoint + `?branchid=${id}`
    }
    let response = await customFetch(endpoint)
    const { result, status } = response
    if (status == "success") {
      if (id && result.length > 0) {
        setBranches(result[0])
      } else {
        setBranches(result)
      }
    }
    if (loader) loader(false)
  } catch (err) {
    if (loader) loader(false)
    alert("something wrong occured")
  }
}

export const newBranchDefault = {
  name: "",
  contact: "",
  email: "",
  address: "",
  managerid: "",
}

export const customData = async (endpoint, setData) => {
  const response = await customFetch(endpoint)
  const { statusCode, status, result } = response
  if (statusCode == 200 && status == "success") {
    setData(result)
  } else setData(result)
}

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
]

export const defaultSupplierdata = {
  name: "",
  address: "",
  region: "",
  contactperson: "",
  email: "",
  phonenumber: "",
}

const isFalsi = (data) => {
  if (data == null || data == undefined || data == "" || typeof data == undefined) {
    return true
  }

  if (typeof data == "object" && Object.keys(data).length == 0) {
    return true
  }
}

export const isAuthenticated = async function (auth, navigate, updateAuthentication) {
  try {
    if (isFalsi(auth)) {
      const token = Cookies.get("X-AUTH-PRIME-LAB-SYSTEM");
      if (isFalsi(token)) {
        navigate.push("/authentication/login")
      } else {
        const authentic = await customFetch(`authenticate/employee/token?token=${token}`);
        const { statusCode, status } = authentic
        if (statusCode == 200 && status == "success") {
          const { username, role, email, employeeid, branchid } = authentic?.user
          const permissions = JSON.parse(authentic?.user?.permissions)
          updateAuthentication({
            username,
            role,
            email,
            employeeid,
            permissions,
            branchid,
          })
        } else {
          navigate.push("/authentication/login")
        }
      }
    }
  } catch (err) {
    console.log(err)
    console.log("error getting token")
  }
}

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
}

export const organizationPaymentDefault = {
  module: "",
  commission: "",
  momo: "",
  bankname: "",
  accountname: "",
  branch: "",
  account: "",
  momoname: "",
}

export const handleLogout = async function (employeeid) {
  try {
    if (!employeeid) return;
    const response = await customFetch(`security/user/logout?employeeid=${employeeid}`);
    Cookies.remove('X-AUTH-PRIME-LAB-SYSTEM');
    if (response?.status == true) {
      window.location.href = "/authentication/login";
    }
    window.location.reload();
  } catch (err) {
    console.log('error connecting to server');
  }
}

export const filterTrendData = async (parameters, data) => {
  const trend = parameters.map((item, index) => {
    const filtered = data.filter((u, t) => {
      return u.parameter == item
    })
    return filtered.length > 0 ? filtered[0] : { upper: null, lower: null, value: "Nil", parameter: "null" }
  })
  return trend
}
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
export const handleDecision = async function (client, decision, setClients, clients, employeeid) {
  try {
    const data = decision === "approve" ? { ...client, approvedby: employeeid, approvalstatus: 1 } : { ...client, approvedby: employeeid }
    const pushData = await customPost("result/approve", "POST", data)
    if (pushData?.status == "success" && decision == "approve") {
      //  remove item ffrom clients
      const getClient = clients.filter((item, index) => {
        return !(item.billingid == client?.billingid && client?.testid == item?.testid)
      })
      setClients(getClient)
    }
  } catch (err) {
    return {}
  }
}

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
  const url = `orders/temporary/processing?orderid=${id}`
  const response = await customFetch(url)
  const { status, statusCode, result } = response
  if (status == "success" && statusCode == 200) {
    setData(result)
  } else {
    setData({})
  }
  setLoading(false)
}

export const currencyFormatter = new Intl.NumberFormat("en-GH", {
  style: "currency",
  currency: "GHS",

})

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
}

export const formatTest = (name) => {
  let testname = name.replace(/\s/g, "_").toLowerCase()
  if (name.includes("(") && name.includes(")")) {
    testname = name.slice(0, name.indexOf("("))
  }
  if (testname.includes(" ")) {
    return formatTest(testname)
  }
  return testname
}

export const defaultTestEditValues = {
  id: "",
  name: "",
  category: "",
  price: "",
  created_on: "",
  sample: "",
  description: "",
  sample_container: "",
  unit: "",
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
}



export const getSingleEditTest = (testid, setTestData, setLoading) => {
  customFetch(`gettestpanel/edit?id=${testid}`)
    .then((data) => {
      setTestData(data)
      setLoading(false)
    })
    .catch((err) => {
      setLoading(false)
    })
}

export const getDateRange = (range) => {
  if (Array.isArray(range) && range.length == 2) {
    const start = new Date(range[0]);
    const end = new Date(range[1]);
    const startYear = start.getFullYear();
    const startMonth = String(start.getMonth() + 1).padStart(2, '0');
    const startDay = String(start.getDate()).padStart(2, '0');

    const endYear = end.getFullYear();
    const endMonth = String(end.getMonth() + 1).padStart(2, '0');
    const endDay = String(end.getDate()).padStart(2, '0');

    const formattedStartDate = `${startYear}-${startMonth}-${startDay}`;
    const formattedEndDate = `${endYear}-${endMonth}-${endDay}`;
    return [formattedStartDate, formattedEndDate];
  }
}



export function PrepareResultEntryHeader(data) {
  if (typeof data != "object") return;
  const { id, name, billingid, patientid } = data;
  if (!id || !name || !billingid || !patientid) return;
  var csvid = `${generateRandomTextAndNumbers(70)}${billingid}`.trim();
  var ptid = `${csvid.slice(25, 50)}${csvid.slice(0, 25)}${patientid}`.trim();
  window.open(`/operations/laboratory/resultentry?csvid=${csvid}&&ptid=${ptid}`);
}



export const loadAllTest = async () => {
  try {
    const response = await customFetch("testpanel/list/bulk");
    const test = response?.data;
    return test;
  } catch (err) {
    return null;
  }
}



export const formatPlainOptionsToObject =
  function (plaindata) {

    const plainDataFormarted = plaindata.split(";");
    const requiredHeaders = ['general', 'male', 'female', 'children'];
    let plainObject = {};

    if (plainDataFormarted.length > 0) {
      for (let i = 0; i < plainDataFormarted.length; i++) {
        const cleaned = plainDataFormarted[i].trim();
        if (cleaned.includes(":") && cleaned.split(":").length > 0) {
          const [header, referenceRange] = cleaned.split(":");
          const cleanedReferenceRange = referenceRange.trim().split("-");
          if (cleanedReferenceRange.length !== 0 && requiredHeaders.includes(header.toLowerCase())) {
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
                lowerLimit = valueOne
              }
              plainObject[header.toLowerCase()] = {
                upperLimit, lowerLimit
              }
            }
          }
        }
      }
    }
    return plainObject;
  }
