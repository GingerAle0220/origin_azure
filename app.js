"use strict";

const express = require("express");
const app = express();
app.set('view engine','ejs');
app.use(express.strict("public"));
app.use(express.urlencoded({extended:true}));



app.listen(3000,() => console.log("Example app listening on port 3000!"));