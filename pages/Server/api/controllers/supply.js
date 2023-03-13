const router = require('express').Router()
const {
  new_supplier,
  get_suppliers,
  update_supplier,
  delete_supplier,
  specificSupllier,
  postCommodity,
  getCommodity,
  new_stock,
  getAstock,
  getStock,
} = require('../models/supply.js')

const {placeOrder,getOrders} = require('../models/placeorders.js');

router.get('/api/v1/suppliers', function (request, response) {
  const hasQuery = Object.keys(request.query).length > 0
  if (!hasQuery) {
    get_suppliers(request, response)
  } else {
    specificSupllier(request, response)
  }
})

router.post('/api/v1/suppliers', function (request, response) {
  new_supplier(request, response)
})

router.delete('/api/v1/suppliers', function (request, response) {
  delete_supplier(request, response)
})

router.put('/api/v1/suppliers', function (request, response) {
  update_supplier(request, response)
})

router.post('/api/v1/commodities', function (request, response) {
  postCommodity(request, response)
})

router.get('/api/v1/commodities', function (request, response) {
  getCommodity(request, response)
})

router.post('/api/v1/stock', function (request, response) {
  new_stock(request, response)
})

router.get('/api/v1/stock', function (request, response) {
  if (Object.keys(request.query).length === 0) {
    getStock(request, response)
  }
  else {
    getAstock(request, response)
  }
})


router.post('/api/v1/orders', function(request,response) {
  placeOrder(request,response)
})


router.get('/api/v1/orders', function(request,response) {
  getOrders(request,response)
})

module.exports = router
