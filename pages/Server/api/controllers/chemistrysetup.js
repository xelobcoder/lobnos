const router = require('express').Router();
const Chemistry = require('../models/chemistry');

router.route('/api/v1/test/setup/chemistry')
 .post((req, res) => {
  const { category, data } = req.body;
  const chemistry = new Chemistry(category, data);
  if (chemistry.validateData()) {
   chemistry.clearTable()
    .then(result => {
     chemistry.insertData(req, res);
    })
    .catch(err => {
     res.status(500).send({
      message: err.message,
      statusCode: 500
     })
    })
  } else {
   res.status(400).send({
    message: 'Invalid data',
    statusCode: 400,
   })
  }
 })

 .get( (req,res) => {
   new Chemistry().getRecords(req,res)
 })





module.exports = router;