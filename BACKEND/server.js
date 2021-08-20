const express = require ("express");
const app = express();
const cors = require ("cors");
const PORT  = process.env.PORT || 4000;
// router for uploading images 
const uploads = require ("./models/uploads");

app.use(cors({
   origin: "http://localhost:3000",
   methods: ["GET","POST", "PUT"],
   credentials: true
}))

app.use(uploads);

app.listen(PORT, function(err){
    if(err){
       throw err;
    }
   console.log(`server running successfully at PORT ${PORT}`)
})
