import { customFetch, customPost } from "../Auth/customFetch"

/**
 * @param {ev} event
 * @param {object} source datasource in object to send to server
 * @param {string} category chemistry setup type like LIVER_SETUP which is for setting up liver table
 * @param {object} setMsgDx  attaches to a state for display messages after request made to server
 * @ return a promise
 */
export const serverCall = function (ev, source,literature, category,toast) {
  // this define final data to be sent to the server
  let finalproductdata = {
    data: source,
    testname: category,
    literature
  }

  if (literature.length == 0) {
    toast.error('Comments or literature cannot be null');
    return;
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

  /**
   * Retrieves records from a server and populates a table with the data.
   * 
   * @param {string} panelname - The name of the panel to retrieve records for.
   * @param {function} datasource - A function that takes an array of records and populates the table with the data.
   * @param {array} defaultsource - The default data source to use if no records are retrieved from the server.
   * @param {function} setloading - A function to set the loading state of the table.
   * @param {function} usedefault - A function to indicate whether the default data source is being used.
   * @returns {void} - None. The function performs actions based on the response from the server and updates the table accordingly.
   */
export const getSetupRecords = async function (panelname, datasource, defaultsource,setloading,usedefault,setLiterature) {
  let endpoint = `test/setup/entry?testname=${panelname}`
  try {
    let response = await customFetch(endpoint)
    const { status, statusCode,resolve,message,records,literature } = response;
    if (status == 'success' && statusCode == 200 && resolve && records.length > 0) {
      datasource(records);
      setloading(false);
      literature.length > 0 ? setLiterature(literature[0]['literature']) : "";
    } else {
      datasource(defaultsource)
      setloading(false);
      usedefault(true);
    }

  }
  catch (err) {
    datasource(defaultsource)
    setloading(false);
  }

}

/**
   * Handles the deletion of a parameter.
   * 
   * @param {Event} ev - The event object triggered by the user action.
   * @param {Object} item - The parameter object to be deleted.
   * @param {Object} toast - The toast object used for displaying notifications.
   * @param {string} testname - The name of the test.
   * @param {Object} updateData - An object containing data to be updated.
   * @returns {void}
   */
export const handleDeleteParams = async (ev, item, toast, testname, updateData) => {
  const { l, d, ds,loading,literature } = updateData;
  ev.preventDefault()
  const confirmation = window.confirm("Are you sure you want to delete this parameter?")
  if (confirmation) {
    const { setupid } = item
    if (!setupid) {
      toast.info("default parameter cannot be deleted,update form to continue or  create custom parameters please")
      return
    }
    const response = await customPost("test/setup/entry/delete", "DELETE", { ...item, testname })
    const { status, statusCode, message } = response
    if (status == "success" && statusCode == 200) {
      toast.success(message);
      getSetupRecords(testname, d, ds, l,loading, literature);
    } else {
      toast.error(message)
    }
  }

}