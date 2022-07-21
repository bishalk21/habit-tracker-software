import express from "express";

import { addUser } from "../model/UserModel";

const router = express.Router(); // eslint-disable-line new-cap

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const user = await addUser(req.body);
    console.log(user);
    res.json({
      status: "success",
      message: "User added successfully",
      user,
    });
  } catch (error) {
    if (error.message.includes("E11000 duplicate key error")) {
      error.message = "Email already exists";
      error.status = 400;
    }
    next(error);
  }
});
