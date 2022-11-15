import connection from '../db.js'

let SQL_QUERY_ALL = 'SELECT * FROM companyprofile';

export default function handler(req, res) {
 if (req.method == 'POST') {
  const { target, name, motto, email, phonenumber, address } = JSON.parse(req.body)
  console.log(target)
  if (target && target == 'profile') {
   let SQL_QUERY_INSERT = `INSERT INTO companyprofile (NAME,EMAIL,MOTTO,PHONENUMBER,ADDRESS) VALUES (?,?,?,?,?)`;

   let SQL_QUERY_UPDATE = function (id) {
    return `UPDATE companyprofile SET 
    NAME = '${name}',
    EMAIL = '${email}',
    MOTTO = '${motto}',
    PHONENUMBER = '${phonenumber}',
    ADDRESS = '${address}'
    WHERE ID ='${id}'
   `
   }
   connection.query(SQL_QUERY_ALL, (err, result) => {
    if (err) { throw err; }

    if (result) {
     let id = result[0]['ID']
     connection.query(result.length == 0 ? SQL_QUERY_INSERT : SQL_QUERY_UPDATE(id), [name, email, motto, phonenumber, address], (err, result) => {
      if (err) {
       throw err;
      }
      res.send({
       message: 'information uploaded',
       status: 200
      })
     })
    }
   })
  }
 }

 if (req.method == 'GET') {
  connection.query(SQL_QUERY_ALL, function (err, result) {
   if (err) {
    throw err;
   }
   res.send(result)
  })
 }
}



