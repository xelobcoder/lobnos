import { customPost, customFetch } from "./customFetch";
const REQUISITIONS_URL = "departments/requisitions";
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

  getPlaceOrderStocks = async function (setStocks, setTemp) {
    try {
      let data = await customFetch('stock');
      const { status, result } = data;
      if (status === 'success' && result.length > 0) {
        let transfromed = result.map((item, index) => {
          return { ...item, quantityrequired: 0 };
        })
        setTemp(transfromed)
        setStocks(transfromed)
      } else {
        setStocks([]);
      }
    } catch (err) {
      setStocks([]);
    }
  }

  departmentRequisition = async (e, id, departmentId, setStocks, stocks) => {
    const filteredStock = stocks.find((stock) => stock.stockid === id);

    const transformedData = {
      stockid: filteredStock.stockid,
      departmentid: departmentId,
      quantity: parseInt(filteredStock.quantityrequired),
      comsumptionunit: filteredStock.consumptionunit,
      requisitionid: Date.now(),
    };

    const emptyValues = Object.values(transformedData).filter(
      (value) => value === ""
    );


    if (emptyValues.length > 0 || transformedData.quantity === 0) {
      alert("Please fill in the required quantity.")
      return;
    }

    try {
      const pushResponse = await customPost(`${REQUISITIONS_URL}`, "POST", transformedData);
      const { status, statusCode, message } = pushResponse;
      if (status === "success" && statusCode === 200 && message === "Department requisition added successfully"
      ) {
        alert(message);
        const updatedStocks = stocks.filter((stock) => stock.stockid !== id);
        setStocks(updatedStocks);
      } else {
        alert(message);
      }
    } catch (err) {
      console.log(err);
    }
  };
}




export default Inventory