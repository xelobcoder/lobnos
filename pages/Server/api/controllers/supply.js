const router = require('express').Router();
const { new_supplier,get_suppliers, update_supplier, delete_supplier } = require('../models/supply.js')

router.get('/api/v1/suppliers', function (request, response) {
  get_suppliers(request, response)
})



router.post('/api/v1/suppliers', function (request, response) {
  new_supplier(request, response)
})


router.delete('/api/v1/suppliers', function (request, response) {
  delete_supplier(request, response)
})



module.exports = router;