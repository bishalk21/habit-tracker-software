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
