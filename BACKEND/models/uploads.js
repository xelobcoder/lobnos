const express = require("express");
const router = express.Router();
const upload = require("express-fileupload");

router.use(express.json());
router.use(express.urlencoded({extended:true}))
router.use(upload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    preserveExtension: true,
    abortOnLimit: true,
    debug: true,
}))
router.route("/api/uploads")
.all( (request,response,next) => {
    response.statusCode = 200;
    response.statusMessage ="ALL";
    next();
})
.post( (request,response) => {


   response.send(request.body)

   console.log(request.body)
})


module.exports = router;