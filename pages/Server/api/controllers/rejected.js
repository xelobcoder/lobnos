const express = require('express');
const router = express.Router();
const { rejectedSample, RejectedSampleApproval } = require('../models/rejected');

router.get('/api/v1/rejected', function (request, response) {
 rejectedSample(request, response);
})

router.post('/api/v1/rejected', function (request, response) {
 RejectedSampleApproval(request,response)
})







module.exports = router;