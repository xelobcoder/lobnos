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


export async function handleComments (e,stateVariable) {
  stateVariable({...stateVariable,remarks:e.target.value })
}