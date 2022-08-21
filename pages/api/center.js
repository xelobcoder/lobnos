import connection from './db.js';
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







export default  function handler(req, res) {
   const method = req.method;
   // switch
   switch (method) {
      case 'GET':
         get(req, res);
         break;
      case 'POST':
         post(req, res);
         break;
        default:
         res.status(405).send('Method Not Allowed');
   }
}