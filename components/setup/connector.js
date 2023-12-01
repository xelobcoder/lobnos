import { customFetch, customPost } from "../Auth/customFetch"

/**
 * @param {ev} event
 * @param {object} source datasource in object to send to server
 * @param {string} category chemistry setup type like LIVER_SETUP which is for setting up liver table
 * @param {object} setMsgDx  attaches to a state for display messages after request made to server
 * @ return a promise
 */
export const serverCall = function (ev, source, category,toast) {
  // this define final data to be sent to the server
  let finalproductdata = {
    data: source,
    testname: category
  }
  // sanitize liverpanel to ensure it dosent call empty values
  let sanitizeValues = function (data) {
    let result = data.filter(item => {
      return item.unit == '' || item.lower == '' || item.upper == '' || item.upper == 0 || item.lower == 0
    })
    return result;
  }

  if (sanitizeValues(source).length > 0) {
    toast.info('fill in all blank fields');
    return;
  }
  else {
    let response = customPost('test/setup/entry', 'POST', finalproductdata)
    response.then(
      (res) => {
        if (res.status == 'success' && res.statusCode == 200) {
          toast.success(res.message)
        }
        else {
          toast.error(res.message)
        }
      }
    )
      .catch(
        (err) => {
          
        }
      )
  }
}

// this checks if panel has table,
// get the records and populate the tabale with it data

export const getRecords = async function (panelname, datasource, defaultsource) {
  let endpoint = `test/setup/entry?testname=${panelname}`
  try {
    let response = await customFetch(endpoint)
    const { status, statusCode } = response;
    if (status == 'success' && statusCode == 200) {
      const { records } = response;
      console.log(records)
      if (records.length > 0) {
        datasource(records)
      }
      else {
        datasource(defaultsource)
      }
    } else {
      datasource(defaultsource)
    }
  }
  catch (err) {
   alert('error occured connecting to server')
  }

}
