import connection from "../api/db";
import database_queries from "./database/queries";
const testResults = {
  required: function (object) {
    return Object.values(object).every((item) => {
      return item !== "";
    });
  },
  // check for duplicate entry in the database on the same da
  getTodayDateAndTime: function () {
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let year = new Date().getFullYear();
    let hour = new Date().getHours();
    let minute = new Date().getMinutes();
    let second = new Date().getSeconds();

    return {
      date: `${year}-${month}-${day}`,
      time: `${hour}:${minute}:${second}`,
    };
  },
  bloodgroup: {
    post: function (data, response) {
      // function for inserting new records
      const insertion = function () {
        let SQL_QUERY = `INSERT INTO bloodgroup (bloodgroup,rhesus,billingid,created_on,time,patientid) VALUES (?,?,?,?,?,?)`;
        let values = [
          group,
          rhesus,
          billingid,
          testResults.getTodayDateAndTime().date,
          testResults.getTodayDateAndTime().time,
          patientid
        ];
        connection.query(SQL_QUERY, values, function (err, result) {
          if (err) {
            throw err;
          }
          response.send({
            message: "result saved successfully",
            statusCode: 200,
          });
        });
      };
      const { group, rhesus, billingid, patientid } = JSON.parse(data);
      // save to database
      database_queries
        .checkduplicate("billingid", "bloodgroup", billingid, "BILLINGID")
        .then((duplicate) => {
          duplicate
            ? response.send({
              message: "duplicate entry",
              statusCode: 400,
              action: "update record instead",
            })
            : insertion();
        })
        .catch((err) => {
          console.log(err);
        });
    },
    put: function (data, response) {
      const { group, rhesus, billingid } = JSON.parse(data);
      let SQL_QUERY = `UPDATE bloodgroup SET GROUP = '${group}', RHESUS = '${rhesus}' WHERE billingid = ${billingid}`;

      connection.query(SQL_QUERY, function (err, result) {
        if (err) throw err;
        response.send({
          message: "result updated successfully",
          statusCode: 200,
        });
      });
    },
    findid: function (id, response) {
      let SQL_QUERY = `SELECT * FROM bloodgroup WHERE ID = ${id}`;
      connection.query(SQL_QUERY, function (err, result) {
        if (err) throw err;
        response.send(result);
      });
    },
  },
  hepatitisB: {
    post: function (data, response) {
      console.log(data);
    },
  },
};

export default testResults;
