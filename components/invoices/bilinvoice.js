class Invoice {
 constructor(paymentmode, idx, discount, institution) {
  this.paymentmode = paymentmode;
  this.idx = idx;
  this.discount = discount || 0;
  this.institution = institution || false;


  this.isVoiceRight = function () {
   if (this.paymentmode != 'invoice') {
    return false;
   }
   return true;
  };
  this.isIdx = function () {
   if (typeof this.idx != 'number') {
    throw new Error('Number required!!!');
   }
   return true;
  };
  this.getInvoiceData = function () {
   const id = this.idx;
   const institution = this.institution;
   // return a promise with the billing data and the test involved;
   return new Promise(function (resolve, reject) {
    let getdata = async function () {
     let api_endpoint = `http://localhost:3000/api/invoices?action=INVOICE_DATA&institution=${institution}&id=${id}`;
     let pick = await fetch(api_endpoint);
     let response = await pick.json();
     console.log(response)
     return await response;
    };
    getdata()
     .then((t) => {
      if (t.message == 'done' && t.status == 'success') {
       resolve(t.result);
      }
     })
     .catch((_err) => {
      reject(_err);
     });
   });
  };
  this.resultTest = function (result) {
   if (typeof result === 'function' || typeof result === 'object') {
    throw new Error('string type required')
   }
   // split result using comma delimeter
   const splitResult = result.split(',');


   // get test data
   let testObject = async function () {
    let apiGet = await fetch('http://localhost:3000/api/testpanel/list')
    let response = await apiGet.json();
    return await response;
   }



   const getKeyValues = async function () {
    var result = [];
    testObject().then((t) => {
     for (let i = 0; i < t.length; i++) {
      result.unshift(t[i])
     }
    })
    return await result;
   }

   return getKeyValues()

  }
  this.generateInvoice = function () {
   if (this.isVoiceRight() && this.isIdx()) {
    this.getInvoiceData(this.idx).then((t) => {
     console.log(t);
    }).catch((err) => { throw err; })
   }
  };
  this.sendviaEmail = function (transactionType) {

  }
 };

}


export default Invoice;
