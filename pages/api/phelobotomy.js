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
}

const getPhelobotomy = async (req, res) => {
 // get patientid,id,name,test,date,sample status, phelobotomy status from database table
 // where date == today's date ---- performing test
 // return data
 // join new patient table with performing test table where phelobotomy status == queue
 let query = `SELECT * FROM billing INNER JOIN performing_test ON billing.PATIENTID = performing_test.PATIENTID WHERE performing_test.PHELOBOTOMY_STATUS = 'QUEUE'`;
 // let myquery = `SELECT * FROM performing_test`;

 connection.query(query, (err, result) => {
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
