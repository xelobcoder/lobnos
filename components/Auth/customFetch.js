export async function customFetch(endpoint) {
   let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
      headers: {
         Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
         "Content-Type": "application/json",
      },
   });

   return await response.json();
}

export const Glucoseoptions = ["", "mg/dl", "mmol/L"];

export async function customPost(endpoint, method, data) {
   let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
      method: method,
      headers: {
         "content-type": "application/json",
         Authorization: `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
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
   datafunction({ ...stateVariable, [target]: e.target.value });
}


export const resultCommentHander = async function (statecallback, target, datasource, testid, billingid) {
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

export const handleChange = (event, target) => {
   const { value } = event.target;
   setData({ ...data, [target]: value })
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