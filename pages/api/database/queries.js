import connection from '../db';

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
 }
}





export default database_queries;