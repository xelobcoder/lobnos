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


   return await response.json();
}

export const Glucoseoptions = ["", "mg/dl", "mmol/L"];

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


export async function handleResponse(response) {
   const { status, message, statusCode } = response;

   if (status == "success") {
      alert(message);
   }

   if (status == "error") {
      alert(message || "An error occured");
   }
}

export const readyToPrint = async function (billingid, testid) {
   const isApproved = await customPost(
      "test/result/preview/approved/check",
      "POST",
      { billingid, testid }
   );
   const { approved } = isApproved;
   if (approved) {
      window.print();
   } else {
      alert("Test not approved. Printing cannot be done.");
      window.document.body.style.display = "none";
      window.close();
   }
};

export const validateMobileNumber = async function (number, len) {
   // convert number to string expliticly
   const nmString = new String(number);
   const digitLen = nmString.length;

   if (len == 10) {
      if (digitLen != 10 && !nmString.startsWith(0)) {
         return "number must be 10 and starts with 0";
      } else {
         return true;
      }
   } else if (len == 13) {
      if (digitLen != 13 && !nmString.startsWith("+")) {
         return "number must be 13 and starts with +";
      } else {
         return true;
      }
   } else if (!len || !number) {
      return "required variables not given";
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

export const getApplicationSettings = async function (setApplicationSettings) {
   const getResponse = await customFetch('applicationsettings');
   const { status, result, statusCode } = getResponse;
   if (statusCode == 200 && status == 'success') {
      if (result.length > 0) {
         setApplicationSettings(result[0])
      } else {
         setApplicationSettings(defaultApplicationSettings)
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
   const response = await customFetch('departments');
   const { status, data } = response;
   if (status == 'success') {
      setDepartments(data)
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

export const defaultApplicationSettings = {
   bulkregistration: 1,
   fontsize: 14,
   textcolor: 'black',
   BackgroundColor: 'wheat',
   DeactivateBilling24hrs: 0,
   PaidBillsBeforeTransaction: 1,
   completeFlow: 1,
   approvalbeforeprinting: 1,
}


export const deleteOrganization = async function (id, getdatafxn) {
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
}


export const getDataAndUpdateState = async function (setfxn, endpoint, returner) {
   const getResponse = await customFetch(endpoint);
   const { statusCode, status, result } = getResponse;
   if (statusCode == 200) {
      if (returner == true || returner != undefined) {
         return result
      } else {
         setfxn(result)
      }
   }
}


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
      window.open(`/registration/result?billingid=${billingid}&&testid=${testid}&&test=${nwName.toLowerCase()}`)
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