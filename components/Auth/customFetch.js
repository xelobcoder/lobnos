export async function customFetch(endpoint) {
  let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  return await response.json()
}



export async function customPost(endpoint, method, data) {
  let response = await fetch(`${process.env.BASEURL}/${endpoint}`, {
    method: method,
    headers: {
      'content-type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ACCESS_TOKEN}`
    },
    body: JSON.stringify(data)
  })

  return await response.json()
}



export async function CheckResultEntered(testname, billingid) {
  if (!(testname && billingid)) {
    return false
  }
  else {
    let response = await customFetch(`test/result/check?testname=${testname}&billingid=${billingid}`);
    return response;
  }
}



export async function validateFormData(data, allrequired, requiredFields = [], endpoint,callback) {
  const isObject = typeof requiredFields === 'object';
  const requiredLen = requiredFields.length;


  async function forwardToServer() {
    let response = await customPost(endpoint, 'POST', data)
    callback(response)
  }
  // if all the fields are not required , we pass data to server 
  if (!allrequired) {
    await forwardToServer();
  }



  if (allrequired && arguments[3] !== undefined) {
    if (isObject && requiredLen > 0) {
      // we check to ensure the required fields are not empty
      const passChecked = [];
      // loop through the data
      for (let i = 0; i < requiredLen; i++) {
        for (const [key, value] of Object.entries(data)) {
          if (key === requiredFields[i]) {
            if (value == '' || value == null || value == undefined) {
              passChecked.push(key)
            }
          }
        }
      }
      // if required fields is e,pty pass checked array increase beyond 0
      if (passChecked.length > 0) {
        alert(`${passChecked} is required`)
        throw new Error(`${passChecked} is required`)
      }

      if (passChecked.length == 0) {
        forwardToServer()
      }

    } else {
      //  we check all fields 
      const allFilled = Object.values(data)
        .filter((val) => val == null || val == '' || val == " " || val === undefined)
        .length > 0;

      if (allFilled) {
        forwardToServer()
      }
    }
  }
}


export async function handleComments(e, stateVariable) {
  stateVariable({ ...stateVariable, remarks: e.target.value })
}