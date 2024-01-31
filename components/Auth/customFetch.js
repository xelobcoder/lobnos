export async function customFetch(endpoint) {
   /**
    * Sends an HTTP request to the specified endpoint and returns the response as JSON.
    * 
    * @param {string} endpoint - The endpoint URL to send the request to.
    * @returns {Promise<object>} - The response from the server as JSON.
    */
   let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
      headers: {
         Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
         "Content-Type": "application/json",
         mode: 'no-cors',
      },
   });

   const source = await response.json();
   const { status, message } = source
   if (status == 401 && message == 'Unauthorized') {
      window.location.href = '/authentication/login'
   } else {
      return source
   }
}

export const Glucoseoptions = ["mg/dl", "mmol/L"];

export async function customPost(endpoint, method, data) {
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
   let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
      method: method,
      headers: {
         "content-type": "application/json",
         Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
         mode: 'no-cors',
      },
      body: JSON.stringify(data),
   });
   let datasource = await response.json();
   const { status, message } = datasource;

   if (status == 401 && message == 'Unauthorized') {
      window.location.href = '/authentication/login'
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
      return false;
   } else {
      let response = await customFetch(
         `test/result/check?testname=${testname}&billingid=${billingid}`
      );
      return response;
   }
}


export async function validateFormData(
   data,
   allrequired,
   requiredFields = [],
   endpoint,
   callback,
   updateState
) {
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

   const isObject = typeof requiredFields === "object";
   const requiredLen = requiredFields.length;

   async function forwardToServer() {
      let response = await customPost(endpoint, "POST", data);
      callback(response);
      if (updateState) {
         updateState
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
   const commentResponse = await customFetch(`result/preview/comments?billingid=${billingid}&testid=${testid}`);
   if (Array.isArray(commentResponse) && commentResponse.length > 0) {
      const { comments } = commentResponse[0];
      statecallback({ ...datasource, [target]: comments });
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


export async function handleResponse(response,toast) {
   const { status, message, statusCode } = response;
   if (status == "success") {
      toast ? toast.success(message,{autoClose: 5000}) : alert(message);
   }
   if (status == "error") {
      toast ? toast.error(message || "something went wrong",{autoClose: 5000} ) : alert(message || "An error occured");
   }
}


export const readyToPrint = async function (billingid, testid) {
   try {
      const isApproved = await customPost(
         "test/result/preview/approved/check",
         "POST",
         { billingid, testid }
      );

      console.log(isApproved);
      const { approved } = isApproved;
      console.log(approved)
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
   setData({ ...data, [target]: value })
}



export const handleChangeWithState = (event, target, setData, data) => {
   const { value } = event.target;
   setData({ ...data, [target]: value })
}



export const getSampleTypeList = async function (setSource) {
   const getResponse = await customFetch('sampletype');
   const { result, statusCode, status } = getResponse;
   if (statusCode == 200 && status == 'success') {
      setSource(result)
   }
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
   const getResponse = await customFetch('applicationsettings');
   const { status, result, statusCode } = getResponse;
   if (statusCode == 200 && status == 'success') {
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
      mappedFiltered[item] = ev.target.value;
      prev[index] = mappedFiltered;
      return [...prev]
   })
}


export const getDepartment = async (setDepartments) => {
   try {
      const response = await customFetch('departments');
      const { status, data, statusCode } = response;
   if (status == 'success' && statusCode === 200) {
      setDepartments(data)
   } else {
      setDepartments([]);
   }
   } catch (err) {
      setDepartments([]);
   }
}


export const getCompanyInformation = async function (setHeaders) {
   try {
      const getdata = await customFetch('settings/companyprofile');
      setHeaders(getdata)
   } catch (err) {
      alert('error in connecting to server')
   }
}

export const defaultSmsSettings = { result: 'No', registration: 'Yes', sample: 'No', birthday: 'No' };

export const fetchRequisitionsByIdAndCategory = async function (departmentId,dataCategory,setHxData) {
   if (departmentId) {
     try {
       const data = await customFetch(`departments/requisitions?id=${departmentId}&&type=${dataCategory}`)
       if (data?.status === 'success' && data?.statusCode === 200) {
         setHxData(data?.data);
       }
     } catch (error) {
       setHxData([])
     }
   }
 }



export const defaultApplicationSettings = {
   bulkregistration: 1,
   fontsize: 14,
   textcolor: 'black',
   BackgroundColor: 'wheat',
   DeactivateBilling24hrs: 0,
   PaidBillsBeforeTransaction: 1,
   completeFlow: 1,
   approvalbeforeprinting: 1,
   smsSettings: defaultSmsSettings,
   emailNotification: 0
}


export const deleteOrganization = async function (id, getdatafxn) {
   try {
      if (!id) {
         alert(`id required`);
      }
      let confirmation = window.confirm('Do you want to delete organization? This will affect your finances records');
      if (confirmation) {
         const deleteResponse = await customPost(`organization?id=${id}`, 'DELETE', {});
         const { statusCode } = deleteResponse;
         if (statusCode == 201) {
            getdatafxn();
         }
      }
   } catch (err) {
      console.log(err);
  }
}


export const getDataAndUpdateState = async function (setfxn, endpoint, returner) {
   try {
      const getResponse = await customFetch(endpoint);
      const { statusCode, status, result } = getResponse;
      if (statusCode == 200) {
         if (returner) {
            return result
         } else {
            setfxn(result)
         }
      }
   } catch (err) {
      alert("something wrong occured");
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
   const { testid, name } = item;
   let nwName = name;
   if (name.split(" ").length > 1) {
      nwName = name.split(" ").join("_")
      if (new String(nwName).includes('(')) {
         nwName = nwName.split("(");
         nwName = nwName[0]
      }
   }

   if (newTab) {
      window.open(`http://localhost:5000/billing/result/pdf?billingid=${billingid}&&testid=${testid}&&testname=${nwName.toLowerCase()}`)
   } else {
      navigate.push(`/registration/result?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}`)
   }
}


export const monthCollection = {
   0: 'january',
   1: 'Febraury',
   2: 'March',
   3: 'April',
   4: 'May',
   5: 'June',
   6: 'July',
   7: 'August',
   8: 'September',
   9: 'October',
   10: 'November',
   11: 'December'
}

export const dayCollection = {
   0: 'Sunday',
   1: 'Monday',
   2: 'Tuesday',
   3: 'Wednesday',
   4: 'Thursday',
   5: 'Friday',
   6: 'Saturday'
}


export const emailPreference = {
   registration: 'No',
   result: 'No',
   approval: 'No',
   rejection: 'No',
   transactions: 'No',
   birthday: 'Yes',
   billing: 'Yes'
}

export const forwardEmailReceipt = async (billingid) => {
   if (billingid) {
      const mail = await customFetch(`billing/email/receipt?billingid=${billingid}`);
      console.log(mail)
   } else alert(`Please select a billingid to forward receipt via email `)
}



export const getInstitutionUsers = async (setUser) => {
   const response = await customFetch('logins');
   const { statusCode, message, result } = response;
   if (statusCode === 200) {
      setUser(result);
   }
}

export const activateInstitutionUser = async (id, previousStatus, setUser) => {
   let currentv;
   if (previousStatus == 0) {
      currentv = 1;
   }

   if (previousStatus == 1) {
      currentv = 0;
   }
   //  show a confimation message before deleting
   const confirm = window.confirm(`Are you sure you want to ${currentv === 1 ? 'activate' : 'deactivate'} this user?`);
   if (confirm) {
      const response = await customPost(`user/authentication/activate`, 'PUT', { id, currentv });
      const { statusCode, message, status, result } = response;
      if (statusCode === 200 && status == 'success') {
         alert(message);
         getInstitutionUsers(setUser)
      }
   }
}


export const getDateExpression = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`


export const getBranches = async function (setBranches, id) {
   let endpoint = `branches`;
   if (id) { endpoint = endpoint + `?branchid=${id}` };
   let response = await customFetch(endpoint)
   const { result, status } = response;
   if (status == 'success') {
      if (id && result.length > 0) {
         setBranches(result[0])
      } else {
         setBranches(result)
      }
   }
}



export const newBranchDefault = {
   name: '',
   contact: '',
   email: '',
   address: '',
   managerid: ''
}

export const customData = async (endpoint, setData) => {
   const response = await customFetch(endpoint);
   const { statusCode, status, result } = response;
   if (statusCode == 200 && status == 'success') {
      setData(result)
   } else setData(result)
}


export const regions = [
   'Greater Accra',
   'Ashanti',
   'Western',
   'Eastern',
   'Central',
   'Volta',
   'Northern',
   'Upper East',
   'Upper West',
   'Bono',
   'Bono East',
   'Ahafo',
   'Savannah',
   'North East',
   'Oti',
   'Western North'
];


export const defaultSupplierdata = {
   name: '',
   address: '',
   region: '',
   contactperson: '',
   email: '',
   phonenumber: ''
}

export const isAuthenticated = async function (auth, navigate, updateAuthentication) {
   if (auth === null || auth === undefined || auth == '' || Object.keys(auth).length == 0) {
      let user = await window.cookieStore.get('X-AUTH-PRIME-LAB-SYSTEMS');
      if (user == null || user == undefined || user == '' || Object.keys(user).length == 0) {
         if (window.location.href !== '/authentication/login') {
            navigate.push('/authentication/login')
         }
      } else {
         const token = user?.value;
         const authentic = await customFetch(`authenticate/employee/token?token=${token}`);
         const { statusCode, status } = authentic;
         if (statusCode == 200 && status == 'success') {
            const { username, role, email, employeeid } = authentic?.user;

            const permissions = JSON.parse(authentic?.user?.permissions);

            updateAuthentication({ username, role, email, employeeid, permissions });
         } else {
            navigate.push('/authentication/login')
         }
      }
   }
}


export const organizationDefaultBasicInfo = {
   email: '',
   name: '',
   location: '',
   street: '',
   mobile: 0,
   address: '',
   website: '',
   gpsmapping: '',
   region: '',
}



export const organizationPaymentDefault = {
   module: '',
   commission: '',
   momo: '',
   bankname: '',
   accountname: '',
   branch: '',
   account: '',
   momoname: ''
}


export const handleLogout = async () => {
   await window.cookieStore.delete('X-AUTH-PRIME-LAB-SYSTEMS');
   window.location.reload();
}


export const filterTrendData = async (parameters, data) => {
   const trend = parameters.map((item, index) => {
      const filtered = data.filter((u, t) => {
         return u.parameter == item;
      });
      return filtered.length > 0
         ? filtered[0]
         : { upper: null, lower: null, value: "Nil",parameter:'null' };
   });
   return trend;
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
      const data = decision === 'approve' ? { ...client, approvedby: employeeid, approvalstatus: 1 } : { ...client, approvedby: employeeid };
      const pushData = await customPost('result/approve', 'POST', data);
      if (pushData?.status == 'success' && decision == 'approve') {
         //  remove item ffrom clients
         const getClient = clients.filter((item, index) => { return !(item.billingid == client?.billingid && client?.testid == item?.testid) })
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
export const getHematologicalResultEntered = async function (billingid, test, loadingFxn, setter, updateentered) {
    try {
        const response = await CheckResultEntered(test, billingid);
        const { result, statusCode, records, status, message } = response;
        if (status == 'success' && statusCode === 200 && records.length > 0 && result) {
            setter(records[0]);
            updateentered(true);
        } else {
            updateentered(false);
        }
        loadingFxn(false);
    } catch (err) {
        loadingFxn(false);
    }
}
 
export const defaultHormonesParameters = [{
   parameter: 'LH',
   unit: 'U/L',
   value: '',
   upper: '',
   lower: '',
   gender: 'male',
},
{
   parameter: 'LH',
   unit: 'U/L',
   value: '',
   upper: '',
   lower: '',
   gender: 'female'
}
]


export  const getSpecificOrder = async (id,setData,setLoading) => {
   const url = `orders/temporary/processing?orderid=${id}`;
   const response = await customFetch(url);
   const { status, statusCode, result } = response;
   if (status == 'success' && statusCode == 200 ) {
      setData(result)
   } else {
      setData({})
   }
   setLoading(false);
 }

 export const currencyFormatter = new Intl.NumberFormat('en-GH', {
   style: 'currency',
   currency: 'GHS',
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
   if (pageValue === page) return;

   if (pageValue < 1 || pageValue > 5) return;

   if (pageValue === "increment" && page > 0) {
      setQuery({ ...query, page: page + pageValue });
   }

   if (pageValue === "decrement" && page > 0) {
      setQuery({ ...query, page: page - 1 });
   }

   setQuery({ ...query, page: pageValue });
}