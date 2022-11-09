import React, {
 useState,
 useEffect,
 useCallback
} from 'react';




function PARAMETER_LIST(props) {
 const { testname, hasCategory } = props;

 useEffect(() => {
  let apiCall = async function (testname, hasCategory = false) {
   let getdata = await fetch(`http://localhost:3000/api/test/setup/fbc?testname=${testname}`)
  }
 }, [])
}




export default PARAMETER_LIST;