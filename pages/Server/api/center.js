const connection = require('./db')
// handler for sample center


const get = (req, res) => {
   // get all sampling_centers from db
   let query = "SELECT * FROM branch";
   connection.query(query, (err, result) => {
      if (err) {
         res.status(500).send(err);
      } else {
         res.status(200).send(result);
      }
   })
}







module.exports = {
   get
}