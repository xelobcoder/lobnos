import connection from '../db';
import testResults from '../testResult';

// create an object

const database_queries = {
 setup_newParameter: (parameter, lower_limit, upper_limit, comment, table) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // insert the new parameter into the database
   connection.query(`INSERT INTO ${table} (parameter,lower_limit,upper_limit,comment) VALUES ('${parameter}',${lower_limit},${upper_limit},'${comment}')`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      resolve(result);
     }
    }
   );
  })
 },
 setup_deleteParameter: (table, id) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // delete the parameter from the database
   connection.query(`DELETE FROM ${table} WHERE ID = ${id}`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      resolve(result);
     }
    }
   );
  })
 },
 setup_updateParameter: (table, id, parameter, lower_limit, upper_limit, comment) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // update the parameter in the database
   connection.query(`UPDATE ${table} SET parameter = '${parameter}', lower_limit = ${lower_limit}, upper_limit = ${upper_limit}, comment = '${comment}' WHERE ID = ${id}`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      resolve(result);
     }
    }
   );
  })
 },
 setup_checkParameterExist: (table, parameter) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // check if the parameter exist in the database
   connection.query(`SELECT * FROM ${table} WHERE parameter = '${parameter}'`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      // return true if result length is greater than 0
      if (result.length > 0) {
       resolve(true);
      }
      else {
       resolve(false);
      }
     }
    }
   );
  })
 },
 setup_getParameters: (table) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // get all the parameters from the database
   connection.query(`SELECT * FROM ${table}`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      resolve(result);
     }
    }
   );
  })
 },
 setup_getonlyParameters: (table) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // get all the parameters from the database
   connection.query(`SELECT parameter FROM ${table}`,
    (err, result) => {
     if (err) {
      reject(err);
     } else {
      resolve(result);
     }
    }
   );
  })
 },
 createLiverfunctionTest_Table: () => {
  // create table if not exist in the database
  // parameters:id,billigid,patientid,date,time,comment,albumin,total protein,ast,alp,alt,bun,creatinine
  let query = `CREATE TABLE IF NOT EXISTS Liverfunctiontest 
  (id INT AUTO_INCREMENT PRIMARY KEY, billingid INT, patientid INT, date DATE, time TIME, comment VARCHAR(255),
   albumin FLOAT, totalprotein FLOAT, ast FLOAT, alp FLOAT, alt FLOAT, bun FLOAT, creatinine FLOAT)`
  connection.query(query, (err, result) => {
   if (err) {
    console.log(err);
   } else {
    console.log(result);
   }
  })
 },
 createRenalfunctionTest_Table: () => {
  // create table if not exist in the database
  // parameters:id,billigid,patientid,date,time,comment,albumin,total protein,ast,alp,alt,bun,creatinine
  let query = `CREATE TABLE IF NOT EXISTS Renalfunctiontest 
  (id INT AUTO_INCREMENT PRIMARY KEY, billingid INT, 
   patientid INT, date DATE, time TIME, comment VARCHAR(255))`
  connection.query(query, (err, result) => {
   if (err) {
    throw err;
   } else {
    return result;
   }
  })
 },
 checkduplicate: (type = 'billingid', table, id, columnName, date = testResults.getTodayDateAndTime().date) => {
  // return a promise after operation
  return new Promise((resolve, reject) => {
   // check if the parameter exist in the database
   const SQL_QUERY = `SELECT * FROM ${table} WHERE CREATED_ON = '${date}' AND ${columnName} = ${id}`

   connection.query(SQL_QUERY, function (err, result) {
    console.log(result)
    const duplicates = result.length > 0 ? true : false;
    err ? reject(err) : duplicates ? resolve(true) : resolve(false);
   })

  })
 },
 del: function (id, table) {
  return new Promise((resolve, reject) => {
   //  query
   const SQL_QUERY = `DELETE FROM ${table} WHERE ID = ${id}`
   connection.query(SQL_QUERY, function (err, result) {
    err ? reject(err) : resolve(result);
   })
  })
 },
 deleteMany: function (deleteArray, table) {
  // function for single delete
  let deleted = 0;
  let target = deleteArray.length;
  // loop through the array
  while (deleted < target) {
   this.del(deleteArray[deleted], table);
   deleted++;
  }
 },
 getall: function (table, response) {
  let SQL_QUERY = `SELECT * FROM ${table} ORDER BY ID DESC LIMIT 100`;
  connection.query(SQL_QUERY, function (err, result) {
   if (err) { throw err }
   response.send(result);
  })
 },
 addBranch: function (branch, request, response) {
  let SQL_QUERY = `INSERT INTO BRANCH (NAME) VALUES ('${branch}')`;
  connection.query(SQL_QUERY, (err, result) => {
   if (err) throw err;
   if (result) {
    response.send({
     status: 'success',
     message: 'new branch added'
    })
   }
  })
 },
 getBranch: function (request, response) {
  let SQL_QUERY = `SELECT * FROM BRANCH  ORDER BY NAME ASC LIMIT 100`;
  connection.query(SQL_QUERY, (error, result) => {
   if (error) throw error;
   if (result) {
    response.send(
     result
    )
   }
  })
 },
 editBranch: function (branchid, branchname, request, response) {
  let SQL_QUERY = `UPDATE BRANCH 
   SET BRANCHNAME = '${branchname}'
   WHERE BRANCHID = '${branchid}'
   `
  connection.query(SQL_QUERY, (err, result) => {
   if (err) throw err;
   if (result) {
    response.send({
     message: `${branchname} updated`,
     status: 200
    })
   }
  })
 },
 deleteBranch: function (branchid,request,response) {
  
 }
}





export default database_queries;