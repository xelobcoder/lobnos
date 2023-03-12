const connection = require('../db')
const database_queries = require('../database/queries')
const { response } = require('express')

const new_supplier = async function (request, response) {
  const {
    name,
    commodity,
    address,
    email,
    contactperson,
    region,
    phonenumber,
  } = request.body
  // create a query
  const query = `INSERT INTO supplier (NAME,COMMODITY,ADDRESS,EMAIL,CONTACTPERSON,REGION,PHONENUMBER) VALUES (?,?,?,?,?,?,?)`

  // execute the query
  connection.query(
    query,
    [name, commodity, address, email, contactperson, region, phonenumber],
    function (err, result) {
      if (err) {
        response.send({
          status: 'error',
          err,
        })
        console.log(err.message)
      }
      if (result) {
        response.send({
          status: 'success',
          message: 'supplier added successfully',
        })
      }
    },
  )
}

const delete_supplier = async function (request, response) {
  const { supplierid } = request.query

  database_queries
    .del([supplierid], 'supplier', 'SUPPLIERID')
    .then((result) => {
      response.send({
        status: 'success',
        message: 'supplier deleted successfully',
        result,
      })
    })
    .catch((error) => {
      response.send({
        status: 'error',
        message: error,
      })
    })
}

const get_suppliers = async function (request, response) {
  const query = `SELECT * FROM supplier ORDER BY SUPPLIERID DESC LIMIT 100`

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
        result: result.map((supplier) => {
          return {
            supplierid: supplier.SUPPLIERID,
            name: supplier.NAME,
            commodity: supplier.COMMODITY,
            address: supplier.ADDRESS,
            email: supplier.EMAIL,
            contactperson: supplier.CONTACTPERSON,
            region: supplier.REGION,
            phonenumber: supplier.PHONENUMBER,

          }
        }),
      })
    }
  })
}

const update_supplier = async function (request, response) {
  const {
    name,
    commodity,
    address,
    region,
    contactperson,
    email,
    phonenumber,
  } = request.body

  const { supplierid } = request.query

  console.log(request.body)


  const query = `UPDATE supplier SET NAME = ?, COMMODITY = ?, ADDRESS = ?, REGION = ?, CONTACTPERSON = ?, EMAIL = ?, PHONENUMBER = ? WHERE SUPPLIERID = ?`

  connection.query(
    query,
    [
      name,
      commodity,
      address,
      region,
      contactperson,
      email,
      phonenumber,
      supplierid,
    ],
    function (err, result) {
      if (err) {
        response.send({
          status: 'error',
          err,
        })
      }
      if (result) {
        console.log(result)
        response.send({
          status: 'success',
          message: 'supplier updated successfully',
        })
      }
    }
  )
}

const specificSupllier = async function (request, response) {
  const { supplierid } = request.query
  // if supplier id is provided
  if (supplierid) {
    try {
      database_queries
        .getsingleid([supplierid], 'supplier', 'SUPPLIERID')
        .then((result) => {
          response.send({
            message: 'success',
            status: 200,
            result,
          })
        })
        .catch((error) => {
          response.send(error)
        })
    } catch (error) {
      return error
    }
  }
  // if supplier id is not provided
  else {
    response.send({
      status: 'error',
      message: 'no supplier id provided',
    })
  }
}

const postCommodity = async function (request, response) {
  const datasource = request.body
  // check the datasource length
  const isArray = Array.isArray(datasource)
  const isSingle = datasource.length === 0 ? true : false;

  // functio  to insert commodity
  const insertCommodity = (commodity) => {
    const query = `INSERT INTO commodity (COMMODITY,CATEGORY) VALUES (?,?)`
    const { name, category } = commodity
    connection.query(query, [name, category], function (err, result) {
      if (err) {
        response.send({
          status: 'error',
          err,
        })
        return;
      }
      if (result) {
        return;
      }
    })
  }


  let items_found_in_db = 0;

  const checkCommodityExist = (commodity) => {

    let query = `SELECT * FROM commodity WHERE COMMODITY = ?`

    connection.query(query, [commodity.name], function (err, result) {
      if (err) {
        response.send({
          status: 'error',
          err,
        })
      }
      if (result) {
        console.log(items_found_in_db)
        if (result.length === 0) {
          insertCommodity(commodity)
        }
        else {
          items_found_in_db++;
        }
      }
    })
  }

  if (isArray && !isSingle) {
    let target = datasource.length
    let counter = 0
    while (counter < target) {
      checkCommodityExist(datasource[counter])
      counter++
    }
    if (counter === target) {
      response.send({
        status: 'success',
        message: 'commodity added successfully to the database however some commodity already exist in the database',
      })
    }
  }
  else {
    response.send({
      status: 'error',
      message: 'no commodity provided',
    })
  }

  // if the datasource is an array
}

const getCommodity = async function (request, response) {
  let query = `SELECT * FROM commodity`
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


// check if stock exist

const checkStockExist = (stock) => {
  let query = `SELECT * FROM newstock WHERE name = ?`
  return new Promise((resolve, reject) => {
    connection.query(query, [stock], function (err, result) {
      if (err) {
        reject(err)
      }
      if (result) {
        if (result.length === 0) {
          resolve(false)
        }
        else {
          resolve(true)
        }
      }
    })
  })
}

// add new stock to the database
const new_stock = async function (request, response) {
  const {
    name,
    category,
    consumptionunit,
    purchaseunit,
    unitquantity,
    alertlevel,
    materialcode,
    tax
  } = request.body

  // check if the stock already exist
  checkStockExist(name)
    .then((result) => {
      if (result) {
        response.send({
          status: 'error',
          message: 'stock already exist',
          statusCode: 400,
        })
      }
      else {
        const query = `INSERT INTO newstock (NAME,CATEGORY,CONSUMPTIONUNIT,PURCHASEUNIT,UNITQUANTITY,ALERTLEVEL,MATERIALCODE,TAX) VALUES (?,?,?,?,?,?,?,?)`
        connection.query(
          query,
          [
            name,
            category,
            consumptionunit,
            purchaseunit,
            unitquantity,
            alertlevel,
            materialcode,
            tax
          ],
          function (err, result) {
            if (err) {
              response.send({
                status: 'error',
                err,
              })
            }
            if (result) {
              response.send({
                status: 'success',
                message: 'stock added successfully',
                statusCode: 200,
              })
            }
          }
        )
      }
    })
    .catch((error) => {
      response.send({
        status: 'error',
        message: error,
        statusCode: 500,
      })
    })
}

const getStock = async function (request, response) {
  let query = `SELECT * FROM newstock`;

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

const getAstock = async function (request, response) {
  const { stockid } = request.query
  if (stockid) {
    connection.query(
      `SELECT * FROM newstock WHERE STOCKID = ?`,
      [stockid],
      function (err, result) {
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
      }
    )
  }
  else {
    response.send({
      status: 'error',
      message: 'no stock id provided',
    })
  }
}
module.exports = {
  new_supplier,
  update_supplier,
  delete_supplier,
  get_suppliers,
  specificSupllier,
  postCommodity,
  getCommodity,
  getStock,
  new_stock,
  getAstock
}
