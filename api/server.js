import express from "express";
import cors from "cors";
import ConnectDB from "./src/config/ConnectDB.js";
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 8000;

ConnectDB();

import userRouter from "./src/routers/userRouter.js";
app.use("/api/v1/user/", userRouter);

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
