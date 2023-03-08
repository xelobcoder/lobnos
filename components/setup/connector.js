/**
 * @param {ev} event
 * @param {object} source datasource in object to send to server
 * @param {string} category chemistry setup type like LIVER_SETUP which is for setting up liver table
 * @param {object} setMsgDx  attaches to a state for display messages after request made to server
 * @ return a promise
 */
export const serverCall = function (ev,source,category,setMsgDx) {
 // this define final data to be sent to the server
 let finalproductdata = {
   data: source,
   category
 }

 console.log(finalproductdata)

 // sanitize liverpanel to ensure it dosent call empty values

 let sanitizeValues = function (data) {
   let result = data.filter(item => {
     return item.unit == '' || item.lower == '' || item.upper == '' || item.upper == 0 || item.lower == 0
   })
   return result;
 }


 if (sanitizeValues(source).length > 0) {
   setMsgDx({
     show: true,displaytime: 5000,message: 'fill in all input fields',type: 'error'
   })
   return;
 }
 else {
   let url = `http://localhost:5000/api/v1/test/setup/chemistry`;
   let options = {
     method: 'POST',
     headers: {
       'Content-Type': 'application/json',
       'Accept': 'application/json'
     },
     body: JSON.stringify(finalproductdata)

   }

   fetch(url, options)
     .then(
       (response) => {
         return response.json();
       }
     )
     .then((response) => {
        if (response.statusCode == 200 && response.message == 'success' ) {
         setMsgDx({
           show: true,
           display: true,
           type: 'success',
           displaytime: '3000',
           width: 'col-12',
           message: 'Values updated successfully'
         })
        }
        else {
         setMsgDx({
          show: true,
          display: true,
          type: 'warning',
          displaytime: '5000',
          width: 'col-12',
          message: response.message
        })
        }
     })
     .catch(
       (error) => {
         setMsgDx({
          show: true,
          display: true,
          type:'info',
          displaytime: '3000',
          width: 'col-12',
          message: 'error occured during transaction'
         })
       }
     )
 }
}

// this checks if panel has table,
// get the records and populate the tabale with it data

export const getRecords = function (panelname,datasource,defaultsource) {
  fetch(`http://localhost:5000/api/v1/test/setup/chemistry?panelname=${panelname}`)
  .then ( (res) => {return res.json()})
  .then (
    (res) =>{
     if(res.status == 'success' && res.statusCode == 200 ) {
      if (res.records && res.records.length > 0) {
        datasource(res.records)
      }
      else  
      {
       datasource(defaultsource)
      }
     }
    }
  )
  .catch ( (err) => console.log(err))
}

