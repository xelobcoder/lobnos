class Inventory {
  constructor(pricing, taxcaluatedIn) {
    this.pricing = pricing;
    this.taxcaluatedIn = taxcaluatedIn;
  }

  changepricing = function (value) { this.pricing = value }
  async calculatePlaceOrderReceivedBalance(array, index, setupdate) {
    const { quantityReceived, quantity } = array[index];
    if (quantityReceived < quantity) {
      const balance = parseInt(quantity) - parseInt(quantityReceived);
      setupdate((prev) => { prev[index]['balance'] = balance; return [...prev] })
    } else {
      setupdate((prev) => { prev[index]['balance'] = 0; prev[index]['quantityReceived'] = quantity; return [...prev] })
    }
  }

  async calculateOrderTotal(setupdata, array, index) {
    const { quantityReceived, price } = array[index];
    let current = [...array];
    if (!this.pricing) alert('pricing not selected');
    if (this.pricing) {
      if (this.pricing == 'unit') {
        current[index]['totalamount'] = parseInt(quantityReceived) * parseFloat(price);
      } else {
        current[index]['totalamount'] = parseFloat(price);
      }
      setupdata(current);
    }
  }

  async placeOrderSum(setupdata, array) {
    let sum = 0;
    array.map(element => { sum += parseFloat(element['totalamount']) });
    setupdata(sum)
  }

  async totalwithTaxAdded({ setdata, total = 0, amount = 0, datasource }) {
    // we keep a hold of the previous total so in case the amount was reversed to zero , we revert to the total initially provided
    let previous = total;
    if (this.taxcaluatedIn) {
      if (amount > 0 && total > 0) {
        if (this.taxcaluatedIn == 'percentage') {
          setdata(total * amount)
        }
        if (this.taxcaluatedIn == 'absolute') {
          setdata(amount + total);
        }
      } else {
        this.placeOrderSum(setdata, datasource)
      }
    } else {
      alert('tax calculated not set up');
    }
  }
}




export default Inventory