const express = require ("express");
const router  = express.Router();

router.use(express.json());
router.use(express.urlencoded({extended:true}));
router.route('/api/laboratory/sickling:id')
.all( (request,response) => {
    response.statusCode = 200;
    response.statusMessage = "All";
})
.get( (request,response) => {
    // get client Sickling cell status
    const userid = request.body.id;
    console.log(userid);
})
.post( (request,response) => {
    // save sickle cell result

})
.put( (request,response) => {
    // alter client result only by authorised person
})

.delete ((request,response) => {
    // delete client sickle cell result if only an authorized person
})
