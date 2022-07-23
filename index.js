const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
//import routes


//*db
mongoose.connect(process.env.DATABASE_CLOUD,{useNewUrlParser:true,useUnifiedTopology:true})
.then(()=>console.log('DB Connected'))
.catch(err=>console.log("EROOR",err))

const authRoutes = require("./routes/auth");
const userRoutes=require("./routes/user")
const imageRoutes=require('./routes/imageUpload')
//app middlewares
app.use(morgan("dev"));
app.use(bodyParser.json({limit:'5mb',type:'application/json'}));
// app.use(cors()); //allows diff domain to send requests
app.use(cors({origin:process.env.CLIENT_URL}))
//middlewares

app.use("/api", authRoutes);
app.use('/api',userRoutes)
app.use('/api',imageRoutes)

const port = process.env.PORT||8000 ;
app.listen(port, () => {
  console.log(`Port running on ${port}`);
});
