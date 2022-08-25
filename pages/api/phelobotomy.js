import connection from './db.js';


let filteredTest_in_date = function (test, res) {
  // check if array
  const isArray = Array.isArray(test) ? true : false;
  // check is empty or not

  const isEmpty = test.length == 0 ? true : false;

  if (isArray && !isEmpty) {
    let today = new Date();


    let filtereddate = test.filter(function (item) {
      // filter today from test array
      let date = new Date(item.DATE);
      return date.getDate() == today.getDate() && date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear();
    })

    res.send(filtereddate);
  }
  else {
    res.send(test);
  }
}

const getPhelobotomy = async (req, res) => {
  let myquery = `SELECT * FROM new_patients AS p INNER JOIN billing AS b ON p.PATIENTID = b.PATIENTID INNER JOIN performing_test as t ON b.BILLINGID = t.BILLINGID WHERE t.PHELOBOTOMY_STATUS='queue' AND p.ACTIVATION_STATUS ='true' AND t.DATE = CURRENT_DATE()`;

  connection.query(myquery, (err, result) => {
    if (err) throw err;
    filteredTest_in_date(result, res);
  })
}


const updatePhelobotomy = async (id, req, res) => { }



export default function handler(req, res) {
  let method = req.method;
  switch (method) {
    case 'GET':
      if (Object.keys(req.query).length == 0) {
        getPhelobotomy(req, res);
      }
      break;
    case 'PUT':
      updatePhelobotomy(req, res);
    default:
      res.status(405).send(`Method ${method} Not Allowed`);

  }
}
