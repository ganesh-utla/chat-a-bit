const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
.then(() => {
    console.log("DB connected!!");
})
.catch(() => {
    console.log("Failed to connect DB!!");
})