import connection from '../db.js';
import fs from 'fs';
import path from 'path'

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
     let id = result.length > 0 ? result[0]['ID'] : null;
     connection.query(result.length == 0
      ? SQL_QUERY_INSERT : SQL_QUERY_UPDATE(id),
      [name, email, motto, phonenumber, address],
      (err, result) => {
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



 const imagesretainer = function (res) {
  let turn = path.join('C:/Users/leonides/Documents/GitHub/image-r-v/lobnos', './public/asserts/companylogo.jpg');
  fs.createReadStream(turn).pipe(res)
 }

 if (req.method == 'GET') {
  connection.query(SQL_QUERY_ALL, function (err, result) {
   if (err) {
    throw err;
   }
   if (result.length > 0) {
    let info = result[0]
    let data = {
     name: info['NAME'],
     email: info['EMAIL'],
     motto: info['MOTTO'],
     address: info['ADDRESS'],
     phonenumber: info['PHONENUMBER']
    }
    res.send(data)
   }
  })

 }
}



