require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const userRouter = require("./routers/user");
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/v1", userRouter);

mongoose.connect("mongodb://localhost:27017/usersManagementDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("Database connection established with Mongoose");
  app.listen(3000, () => {
    console.log("Listening for requests on port 3000");
  });
})
.catch((err) => {
  console.log("Error connecting to the database", err);
  process.exit(-1);
});