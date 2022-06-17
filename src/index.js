const express = require("express");
const mongoose = require("mongoose");
const userRoute = require("./route/userRoute");
const taskRoute = require("./route/taskRoute");

require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost/Todo")
  .then(() => {
    console.log("connected to database");
  })
  .catch(() => {
    console.log("error in connecting to database");
  });

app.use("/user", userRoute); // user routing url
app.use("/task", taskRoute); // task routing url

app.use((req, res, next) => {
  const error = new Error("page not found");
  error.status = 404;
  next(error);
});
app.use((error, req, res, next) => {
  //error msg found if the url is wrong
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log("listening  on port " + port);
});
