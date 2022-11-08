import database_queries from "../../database/queries";
import connection from "../../db";
// steps
// 1. state clearlly category and check db if data for category exist
// 2. if exist , clear all the information and load new set of information.
// 3. if exist not, save all the information and notify client of success.


const DB_TABLE_MALE = 'setup_full_blood_count_test_male';
const DB_TABLE_FEMALE = 'setup_full_count_count_female';
const DB_TABLE_GENERAL = 'setup_full_blood_count_test_general';


const category_determiner = function (t) {
 if (t == 'male') {
  return DB_TABLE_MALE;
 }

 if (t == 'female') {
  return DB_TABLE_FEMALE;
 }


 if (t == 'children') {
  return DB_TABLE_GENERAL;
 }

}

const insertdata = function (request, response) {

 const { category, setupdata } = JSON.parse(request.body);

 if (!category || category == null || category == undefined) {
  response.send({
   error: 'category essential'
  })
 }


 if (category && setupdata) {
  let category_table = category_determiner(category)
  // delete all rows first
  database_queries.deleteAllrows(category_table)
   .then((resolve) => {
    // if all records are deleted ,resolves true else resolves false
    let count = 0;
    console.log(setupdata)
    setupdata.map((item) => {
     let SQL_QUERY = `INSERT INTO ${category_table} (PARAMETER,UNIT,LOWER,UPPER) VALUES (?,?,?,?)`
     connection.query(SQL_QUERY, [item.PARAMETER, item.UNIT, item.LOWER, item.UPPER], (err, result) => {
      if (err) { console.log(err) }
      count++;
      count == setupdata.length ? response.send({ message: 'data inserted successfully' }) : null
     })
    })
   })
 }
}

const getdata = function (request, response) {
 let queries = Object.keys(request.query);
 if (queries && queries.includes('category')) {
  let category = request.query.category;
  console.log(category)
  if (category) {
   let category_table = category_determiner(category);
   if (category_table != undefined) {
    let SQL_QUERY = `SELECT * FROM ${category_table}`;
    connection.query(SQL_QUERY, (err, result) => {
     if (err) { throw err }
     response.send(result)
    })
   }
   else {
    response.send({
     message: category + " " + 'not defined'
    })
   }
  }
 }
}

export default function handler(req, res) {
 const method = req.method;
 switch (method) {
  case 'POST':
   insertdata(req, res);
   break
  case 'GET':
   getdata(req, res)
   break;
  default:
   res.send({
    status: '400',
    message: 'method not known'
   })
 }
}

