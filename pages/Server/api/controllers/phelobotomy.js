const router = require('express').Router();
const { getPhelobotomy, updatePhelobotomy } = require('../phelobotomy')


router.route('/api/v1/phelobotomy')
 .get(function (req, res) {
  if (Object.keys(req.query).length == 0) {
   getPhelobotomy(req, res);
  }
 })
 .post(function (req, res) {

 })
 .put(function (req, res) {
  const { clientid, content, status, alltaken, completedTime } = req.body;
  updatePhelobotomy(clientid, content, status, alltaken, completedTime, req, res);
 })
 .delete((req, res) => {
  res.status(405).send({
   statusCode: 405,
   message: `Method ${req.method} Not Allowed`
  });
 })

module.exports = router;
