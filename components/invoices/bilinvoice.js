class Invoice {
  constructor(paymentmode, idx, discount) {
    this.paymentmode = paymentmode;
    this.idx = idx;
    this.discount = discount || 0;


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
      // return a promise with the billing data and the test involved;
      return new Promise(function (resolve, reject) {
        let getdata = async function () {
          let api_endpoint = `http://localhost:3000/api/invoices?action=INVOICE_DATA&id=${id}`;
          let pick = await fetch(api_endpoint);
          let response = await pick.json();
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
    this.generateInvoice = function () {
      if (this.isVoiceRight() && this.isIdx()) {
         this.getInvoiceData(this.idx).then((t) => {
          console.log(t);
        }).catch((err) => { throw err; })
      }
    };
  }
}


export default Invoice;
