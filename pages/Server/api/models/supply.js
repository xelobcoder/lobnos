const connection = require('../db');
const database_queries = require('../database/queries');
const { response } = require('express');

const new_supplier = async function (request, response) {

  const { name, commodity, address } = request.body;
  // create a query
  const query = `INSERT INTO supplier (NAME,COMMODITY,ADDRESS) VALUES (?,?,?)`

  // execute the query
  connection.query(query, [name, commodity, address], function (err, result) {
    if (err) {
      response.send({
        status: 'error',
        err
      })
    }
    if (result) {
      response.send({
        status: 'success',
        message: 'supplier added successfully'
      })
    }
  })
}


const update_supplier = async function (request, response) { }


const delete_supplier = async function (request, response) {
  const { supplierid } = request.query;

  database_queries.del([supplierid], 'supplier', 'SUPPLIERID')
    .then(result => {
      response.send({
        status: 'success',
        message: 'supplier deleted successfully'
      })
    })
}



const get_suppliers = async function (request, response) {
  const query = `SELECT * FROM supplier ORDER BY SUPPLIERID DESC LIMIT 100`;

  connection.query(query, function (err, result) {
    if (err) {
      response.send({
        status: 'error',
        err
      })
    }
    if (result) {
      response.send(result.map(supplier => {
        return {
          supplierid: supplier.SUPPLIERID,
          name: supplier.NAME,
          commodity: supplier.COMMODITY,
          address: supplier.ADDRESS,
        }
      }));
    }
  }
  )
}



const specificSupllier = async function (request,response) {
  const { supplierid } = request.query;
  // if supplier id is provided
  if (supplierid) {
    try {
      database_queries.getsingleid([supplierid], 'supplier', 'SUPPLIERID')
        .then(result => {
          response.send({
            message: 'success',
            status: 200,
             result
          })
        })
        .catch(error => {
          response.send(error);
        })
    } catch (error) {
      return error;
    }
  }
  // if supplier id is not provided
  else {
    response.send({
      status: 'error',
      message: 'no supplier id provided'
    })
  }
}


module.exports = { new_supplier, update_supplier, delete_supplier, get_suppliers, specificSupllier }