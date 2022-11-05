class FastApipush {
 constructor(method, data = {}, route, allrequited = true) {
  this.method = method;
  this.data = data;
  this.route = route;
  this.allrequited = allrequited;
 }

 allHaveValues() {
  let valuesArray = Object.values(this.data);
  let verify = function (valuesArray) {
   return valuesArray.every(function (value) {
    return value !== '';
   });
  }

  return verify(valuesArray);
 }


 getdata() {
  // make request to the endpoint and return a promise
  return new Promise((resolve, reject) => {
   let pushdata = fetch(this.route)
    .then(response => response.json())
    .then(data => {
     resolve(data)
    }).catch(error => { reject(error) })
   return pushdata;
  })
 }

 postdata() {
  let route = this.route;
  let method = this.method;
  let data = JSON.stringify(this.data);
  // push data to the endpoint and return a promise
  let pushdata = async function () {
   let push = await fetch(route, { method, body: data })
   let response = await push.json();
   return response;
  }

  let allvalues = this.allHaveValues() ? pushdata() : false;
  let allrequired = this.allrequited ? allvalues : false;

  return allrequired;
 }

}


export default FastApipush;