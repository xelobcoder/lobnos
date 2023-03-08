const express = require('express');
const app = express();
const port = 5000;
const { addBilling, addperformingTest } = require('./api/billing');
const { getClinicians, putClinicians, deleteClinicians, postClinicians } = require('./api/clinicians');
const { getOrganizations } = require('./api/organization');
const { getpatient, addpatient } = require('./api/register');
const rejectedRouter = require('./api/controllers/rejected');
const activation = require('./api/activation');
const { getCategory, putCategory, deleteCategory, postCategory } = require('./api/testpanel/categories')
const testpanel = require('./api/testpanel/list');
const { get } = require('./api/center');
const SampleHandler = require('./api/sample');
const org = require('./api/org');
const ChemistryRoutes = require('./api/controllers/chemistrysetup');
const phelobotomyRouter = require('./api/controllers/phelobotomy');
const supplyRouter = require('./api/controllers/supply');





app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});

// manage with cors
// manage with body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const cors = require('cors');
const connection = require('./api/db');
app.use(cors(
  {
    origin: 'http://localhost:3000',
    credentials: false,
  }
));

app.use(ChemistryRoutes);
app.use(phelobotomyRouter);
app.use(rejectedRouter)
app.use(supplyRouter);
app.get('/', (req, res) => {
  res.status(200).json({ message: 'success' });
});



// 





app.post('/api/v1/billing', (req, res) => {
  addBilling(req, res);
});


// sample api endpoint 

app.get('/api/v1/sample', function (request, response) {
  let sampleHandle = new SampleHandler(
    request.query.status,
    new Date(),
    request,
    response
  );
  const { status, date } = request.query;

  if (!status && !date) {
    sampleHandle.getRecords();
  }
  else {
    if (status && !date) {
      sampleHandle.getStatus(status);
    } else if (!status && date) {
      sampleHandle.getDate(date);
    } else {
      sampleHandle.getSelectedStutusAndDate(date, status);
    }
  }
})


app.put('/api/v1/sample', function (request, response) {
  let sampleHandle = new SampleHandler(
    request.query.status,
    new Date(),
    request,
    response
  );

  const data = request.body;
  const { status, billingid, message = '' } = data;
  sampleHandle.updateRecords(status.toUpperCase(), billingid, message);
})



app.get('/api/v1/organization', (req, res) => {
  getOrganizations(req, res);
});


app.get('/api/v1/clinicians', (req, res) => {
  getClinicians(req, res);
});

app.get('/api/v1/register', (req, res) => {
  getpatient(req, res);
})

app.post('/api/v1/register', (req, res) => {
  addpatient(req, res);
})

app.get('/api/v1/activation', (req, res) => {
  if (
    Object.keys(req.query).includes('action') &&
    Object.keys(req.query).includes('patientid')
  ) {
    activation.activateDeactivate(req, res)
  } else {
    activation.getPartialData(req, res)
  }
})


app.get('/api/v1/testpanel/categories', (req, res) => {
  getCategory(req, res)
})

app.post('/api/v1/testpanel/categories', (req, res) => {
  postCategory(req, res)
})

app.get('/api/v1/center', (req, res) => {
  get(req, res)
})




app.get('/api/v1/testpanel/list', (req, res) => {
  testpanel.getPanels(req, res)
})

app.post('/api/v1/testpanel/list', (req, res) => {
  testpanel.postPanel(req, res)
})

app.get('/api/v1/org', function (req, res) {
  res.send(org)
})


// app.get('/api/v1/rejected', (req, res) => {
//   const billingid = req.query.billingid;

//   if (billingid) {
//     let query = `SELECT  * from performing_test as rejected INNER JOIN (SELECT * FROM new_patients) as p ON rejected.PATIENTID = p.PATIENTID WHERE rejected.BILLINGID =' ${billingid}' AND rejected.SAMPLE_STATUS = 'REJECTED';`

//     // execute query
//     connection.query(query, (err, result) => {
//       if (err) {
//         console.log(err)
//         res.status(400).send({
//           statusCode: 301,
//           message: 'error occured'
//         })
//       }
//       else {
//         res.status(200).send({
//           statusCode: 200,
//           message: 'success',
//           result
//         })
//       }
//     })
//   }

//   if (!billingid) {
//     res.status(400).send({
//       statusCode: 301,
//       message: 'billingid is required'
//     })
//   }
// })