import express from "express";
const app = express();

const PORT = 8000;

app.use("/", (req, res) => {
  // this is the root path
  try {
    res.send({
      status: "success",
      message: "Welcome to the Habit Tracker System API",
    });
  } catch (error) {
    error.status = "error";
    console.log(error);
  }
});

app.use("/", (error, req, res, next) => {
  // error
  try {
    res.status(error.status || 500);
    res.send({
      status: "error",
      message: error.message,
    });
  } catch (error) {
    next(error);
  }
});

app.listen(PORT, (error) => {
  error && console.log(error);
  console.log(`Console is running at http://localhost:${PORT}`);
});
