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

export const getRecords = async function (panelname, datasource, defaultsource,setloading) {
  let endpoint = `test/setup/entry?testname=${panelname}`
  try {
    let response = await customFetch(endpoint)
    const { status, statusCode,resolve,message,records } = response;
    if (status == 'success' && statusCode == 200 && resolve && records.length > 0) {
      datasource(records);
        setloading(false);
    } else {
      datasource(defaultsource)
      setloading(false);
    }

  }
  catch (err) {
    alert('error occured connecting to server');
    datasource(defaultsource)
    setloading(false);
  }

}


export const handleDeleteParams = async (ev, item,toast) => {
  ev.preventDefault();
  const { setupid } = item;
  if (!setupid) { toast.info('default parameter cannot be deleted,update form to continue or  create custom parameters please'); return;}
  const response = await customPost('test/setup/entry/delete', 'DELETE', item);
}