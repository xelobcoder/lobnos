const connection = require('../db');


const placeOrder = function (request, response) {
 const {
  quantity,
  stockid,
  name,
  tax,
  suppliername,
  supplierid,
  purchaseunit,
 } = request.body;
 // check if order exist and items are recieved 
 // if not recieved then update the order, then we notify the front end of order status
 // if recieved then we notify the front end of order status
 // if not available , insert into the database 
 const addNewOrder = (request, response) => {

  connection.query(
   `INSERT INTO orders (quantity, stockid, name, tax, suppliername, supplierid, purchaseunit) VALUES (?,?,?,?,?,?,?)`,
   [quantity, stockid, name, tax, suppliername, supplierid, purchaseunit],
   function (err, result) {
    if (err) {
     response.send({
      status: 'error',
      err,
     });
    }
    if (result) {
     response.send({
      status: 'success',
      message: 'order placed successfully',
      statusCode: 200,
     });
    }
   }
  );
 }
 const checkOrderExist = (stockid) => {
  let query = `SELECT * FROM orders WHERE stockid = ? and received = ?  `;

  connection.query(query,
   [stockid, 'FALSE'],
   function (err, result) {

    if (err) {
     response.send({
      status: 'error',
      err,
     });
    }

    if (result) {
     const checkedLength = result.length;
     if (checkedLength === 0) {
      addNewOrder(request, response);
     }
     else {
      response.send({
       status: 'success',
       message: 'order already exist',
       info: `order already exist and is not yet recieved.kindly check the order ${result[0]['productordersid']}`,
       statusCode: 200,
      });
     }
    }
   })
 }


 checkOrderExist(stockid)
}


const getOrders = async function (request, response) {
 const query = `SELECT * FROM orders WHERE received = 'FALSE'`;
 // execute the query
 connection.query(query, function (err, result) {
   if (err) {
     response.send({
       status: 'error',
       err,
     })
   }
   if (result) {
     response.send({
       status: 'success',
       result,
     })
   }
 })
}




module.exports = { placeOrder,getOrders};